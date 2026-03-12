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
import AnalysisLoading from "@/components/sim/AnalysisLoading";

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
                    scenario.cameraTarget.center[1],
                    scenario.cameraTarget.zoom,
                    scenario.cameraTarget.pitch || 60
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
                sim.currentEcology,
                sim.currentEconomy,
                sim.societyScore,
                sim.decisions,
                "Anonymous",
                sim.sectorStakeholders,
                sim.predictionRanking,
                sim.predictionRisk,
                sim.predictionEvaluation!
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

            {/* Resume B-Roll Button */}
            {map.isBrollPaused && sim.step !== "complete" && (
                <div className="absolute top-24 right-6 pointer-events-auto z-[1000] animate-in fade-in duration-300">
                    <button
                        onClick={map.resumeBroll}
                        className="bg-card/90 backdrop-blur-md border border-border text-foreground px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 hover:bg-card/100 hover:scale-105 transition-all text-sm font-semibold"
                    >
                        <Play className="w-4 h-4 fill-primary text-primary" />
                        Resume Camera
                    </button>
                </div>
            )}


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
                            {sim.isLoading && sim.selectedHeadline ? (
                                <AnalysisLoading />
                            ) : (
                                <HeadlineSelector
                                    headlines={sim.headlines}
                                    isLoading={sim.isLoading}
                                    onSelect={handleHeadlineSelect}
                                />
                            )}
                        </div>
                    </div>
                )}


                {/* Scenario briefing */}
                {sim.step === "scenario" && sim.scenario && (
                    <div className="pointer-events-auto mt-auto sm:mt-6 sm:ml-auto sm:mr-4 sm:self-start">
                        <ScenarioPanel
                            context={sim.scenario.context}
                            availableSectors={sim.sectorStakeholders.map(s => s.sectorId)}
                            onComplete={(ranking, risk) => {
                                sim.setPredictions(ranking, risk);
                                handleScenarioReady();

                                // Background fetch for evaluation
                                fetch("/api/evaluate-prediction", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        scenarioContext: sim.scenario?.context,
                                        predictedSectors: ranking,
                                        predictedRisk: risk,
                                    }),
                                }).then(res => res.json())
                                    .then(evaluation => {
                                        sim.setPredictionEvaluation(evaluation);
                                    }).catch(console.error);
                            }}
                        />
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
                    <div className="pointer-events-auto fixed inset-0 z-[5000] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md animate-in fade-in duration-500 overflow-y-auto p-4">
                        <div className="max-w-2xl w-full bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 mt-16 sm:mt-0">
                            <div className="flex flex-col items-center text-center gap-2">
                                <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                                    {sim.isFailed ? "Simulation Failed" : "Simulation Complete"}
                                </h2>
                                <p className="text-base text-muted-foreground">
                                    Compiling your final report... Here is a look back at your initial predictions.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <div className="flex flex-col gap-3 bg-muted/40 p-4 rounded-xl border border-border/50">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">Your Predictions</h3>
                                    <div className="flex flex-col gap-3">
                                        {sim.predictionRanking?.length ? sim.predictionRanking.map((sector, i) => (
                                            <div key={sector} className="flex items-center gap-3">
                                                <span className="w-7 h-7 shrink-0 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                                <span className="text-sm font-semibold">{sector}</span>
                                            </div>
                                        )) : (
                                            <span className="text-sm text-muted-foreground italic">No predictions made.</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 bg-muted/40 p-4 rounded-xl border border-border/50">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">Actual Impact (Freq)</h3>
                                    <div className="flex flex-col gap-3">
                                        {(() => {
                                            const actualImpacts = sim.decisions?.flatMap(d => d.affectedSectors.map(s => s.sector)) || [];
                                            const impactCounts = actualImpacts.reduce((acc, sector) => {
                                                acc[sector] = (acc[sector] || 0) + 1;
                                                return acc;
                                            }, {} as Record<string, number>);
                                            const actualTop3 = Object.entries(impactCounts)
                                                .sort((a, b) => b[1] - a[1])
                                                .slice(0, 3)
                                                .map(e => e[0]);

                                            return actualTop3.length > 0 ? actualTop3.map((sector, i) => {
                                                const wasPredicted = sim.predictionRanking?.includes(sector);
                                                return (
                                                    <div key={sector} className="flex items-center gap-3">
                                                        <span className="w-7 h-7 shrink-0 rounded-full bg-accent/10 border border-accent/20 text-accent flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                                        <span className="text-sm font-semibold">{sector}</span>
                                                        {wasPredicted && <span className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Predicted</span>}
                                                    </div>
                                                );
                                            }) : (
                                                <span className="text-sm text-muted-foreground italic">No impact recorded.</span>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {sim.predictionRisk && (
                                <div className="flex flex-col gap-2 bg-muted/40 p-4 rounded-xl border border-border/50">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Your Predicted Risk</h3>
                                    <p className="text-sm font-medium italic text-foreground/90">"{sim.predictionRisk}"</p>
                                </div>
                            )}

                            <div className="flex justify-center items-center gap-3 mt-2 py-4 border-t border-border/50">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                <span className="text-sm font-semibold text-muted-foreground animate-pulse">Generating comprehensive report...</span>
                            </div>
                        </div>
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
