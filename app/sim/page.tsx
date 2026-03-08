"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useSimulation } from "@/hooks/useSimulation";
import { useMap } from "@/hooks/useMap";
import { useDecision } from "@/hooks/useDecision";
import { useReport } from "@/hooks/useReport";
import { setTimeOfDay, setScenarioAtmosphere } from "@/lib/mapbox/camera";
import Navbar from "@/components/layout/Navbar";
import LocationSearch from "@/components/sim/LocationSearch";
import HeadlineSelector from "@/components/sim/HeadlineSelector";
import ScenarioPanel from "@/components/sim/ScenarioPanel";
import SimDecisionUI from "./SimDecisionUI";
import DeckGLOverlay from "@/components/map/DeckGLOverlay";
import ZoneLegend from "@/components/sim/ZoneLegend";
import TrafficControls from "@/components/traffic/TrafficControls";
import TrafficLegend from "@/components/traffic/TrafficLegend";
import { Loader2, Play } from "lucide-react";


const MapCanvas = dynamic(() => import("@/components/map/MapCanvas"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-muted flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    ),
});

export default function SimPage() {
    const router = useRouter();
    const sim = useSimulation();
    const map = useMap();
    const decision = useDecision();
    const report = useReport();
    const [reportTriggered, setReportTriggered] = useState(false);

    const isSimulationActive = sim.step === "decision" || sim.step === "scenario";

    /* ─── location selected ─── */
    const handleLocationSelect = useCallback(
        (name: string, lat: number, lng: number, country: string) => {
            sim.setLocation({ name, lat, lng, country, region: "" });
            map.flyToCoords(lng, lat, 12);
            fetch(`/api/headlines?lat=${lat}&lng=${lng}&name=${encodeURIComponent(name)}`)
                .then((r) => r.json())
                .then((data) => sim.setHeadlines(data))
                .catch(() => sim.setHeadlines([]));
        },
        [sim, map]
    );

    const handleMapClick = useCallback(
        (lng: number, lat: number) => {
            if (sim.step !== "location") return;
            handleLocationSelect(`${lat.toFixed(2)}, ${lng.toFixed(2)}`, lat, lng, "ASEAN");
        },
        [sim.step, handleLocationSelect]
    );

    /* ─── headline selected ─── */
    const handleHeadlineSelect = useCallback(
        async (headline: (typeof sim.headlines)[0]) => {
            sim.selectHeadline(headline);
            try {
                const res = await fetch("/api/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ location: sim.location, headline }),
                });
                if (!res.ok) throw new Error("Analyze failed");
                const scenario = await res.json();

                // Start cinematic intro sequence
                map.traffic.updateConfig({ speedMultiplier: 0.5, globalWidth: 4 });

                // BUG-03: fly to scenario cameraTarget (resolved coordinates), not user click
                map.flyTo(scenario.cameraTarget, 3000);
                map.startBroll(
                    scenario.cameraTarget.center[0],
                    scenario.cameraTarget.center[1]
                );
                if (scenario.affectedArea) {
                    map.addLayers([{
                        type: "add_layer",
                        layerType: "polygon",
                        layerId: "affected-area",
                        geoJson: scenario.affectedArea,
                        color: "#14B8A6",
                    }]);
                }
                if (map.mapRef.current) {
                    setScenarioAtmosphere(map.mapRef.current, scenario.context);
                }

                sim.setScenario(scenario);
            } catch {
                sim.setError("Failed to analyze the headline. Please try again.");
            }
        },
        [sim, map]
    );

    const handleScenarioReady = useCallback(() => {
        if (!sim.scenario) return;
        sim.startDecisions();
    }, [sim, map]);

    /* ─── generate report on complete ─── */
    useEffect(() => {
        if (sim.step !== "complete" || reportTriggered) return;
        if (!sim.location || !sim.selectedHeadline) return;
        setReportTriggered(true);

        report
            .generateReport(
                sim.location,
                sim.selectedHeadline,
                sim.currentScore,
                sim.decisions,
                "Anonymous"
            )
            .then((slug) => {
                if (slug) {
                    sim.setReportSlug(slug);
                    router.push(`/report/${slug}`);
                }
            });
    }, [sim.step]); // eslint-disable-line react-hooks/exhaustive-deps

    /* ─── time-of-day per round ─── */
    useEffect(() => {
        if (sim.step === "decision" && map.mapRef.current) {
            setTimeOfDay(map.mapRef.current, sim.currentRound);
        }
    }, [sim.currentRound, sim.step]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="relative w-full h-screen overflow-hidden">
            <Navbar />

            <div className="absolute inset-0 z-0">
                <MapCanvas
                    onMapReady={map.setMapInstance}
                    onClick={handleMapClick}
                    isSimulationActive={isSimulationActive}
                />
            </div>

            {/* Traffic controls + legend */}
            <TrafficControls
                state={map.traffic.state}
                zoom={Math.round(map.mapRef.current?.getZoom() ?? 0)}
                onConfigChange={map.traffic.updateConfig}
                onToggle={map.traffic.toggle}
            />
            <TrafficLegend config={map.traffic.state.config} />

            {/* Resume B-Roll Button */}
            {map.isBrollPaused && sim.step !== "complete" && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto z-[1000] animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <button
                        onClick={map.resumeBroll}
                        className="bg-card/90 backdrop-blur-md border border-border text-foreground px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 hover:bg-card/100 hover:scale-105 transition-all text-sm font-semibold"
                    >
                        <Play className="w-4 h-4 fill-primary text-primary" />
                        Resume Camera
                    </button>
                </div>
            )}

            {/* Zone legend (visible during decision) */}
            {sim.step === "decision" && <ZoneLegend />}

            {/* UI overlays */}
            <div className="absolute inset-0 pointer-events-none pt-14 p-4 flex flex-col">
                {/* Location search */}
                {sim.step === "location" && (
                    <div className="pointer-events-auto mt-2">
                        <LocationSearch onSelect={handleLocationSelect} />
                        <p className="text-center text-xs text-muted-foreground mt-3 bg-card/60 backdrop-blur-sm rounded-lg py-2 px-3 max-w-xs mx-auto">
                            Search or tap the map to pick a location
                        </p>
                    </div>
                )}

                {/* Headlines */}
                {sim.step === "headline" && (
                    <div className="pointer-events-auto mt-auto max-h-[70vh] w-full max-w-sm mx-auto sm:max-w-md">
                        <div className="rounded-2xl bg-card/90 backdrop-blur-md border border-border shadow-xl overflow-hidden">
                            <HeadlineSelector
                                headlines={sim.headlines}
                                isLoading={sim.isLoading}
                                onSelect={handleHeadlineSelect}
                            />
                        </div>
                    </div>
                )}


                {/* Scenario briefing */}
                {sim.step === "scenario" && sim.scenario && (
                    <div className="pointer-events-auto mt-auto sm:mt-0 sm:ml-auto sm:mr-4 sm:self-end">
                        <ScenarioPanel context={sim.scenario.context} onReady={handleScenarioReady} />
                    </div>
                )}

                {/* Decision round */}
                {sim.step === "decision" && sim.scenario && (
                    <SimDecisionUI
                        sim={sim}
                        decision={decision}
                        map={map}
                    />
                )}

                {/* Complete — loading report */}
                {sim.step === "complete" && (
                    <div className="pointer-events-auto flex flex-col items-center justify-center flex-1 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                            {sim.isFailed
                                ? "Community trust collapsed... Generating failure report..."
                                : "Generating your report..."}
                        </p>
                    </div>
                )}

                {sim.error && (
                    <div className="pointer-events-auto fixed bottom-4 left-4 right-4 mx-auto max-w-sm rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive text-center">
                        {sim.error}
                    </div>
                )}
            </div>

            {/* DeckGL goes strictly ON TOP of UI so traffic can flow over elements */}
            <div className="absolute inset-0 z-[2000] pointer-events-none">
                <DeckGLOverlay map={map.mapRef.current} layers={map.deckLayers} />
            </div>
        </div>
    );
}
