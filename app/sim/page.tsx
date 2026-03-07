"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useSimulation } from "@/hooks/useSimulation";
import { useMap } from "@/hooks/useMap";
import { useDecision } from "@/hooks/useDecision";
import { useReport } from "@/hooks/useReport";
import Navbar from "@/components/layout/Navbar";
import LocationSearch from "@/components/sim/LocationSearch";
import HeadlineSelector from "@/components/sim/HeadlineSelector";
import ScenarioPanel from "@/components/sim/ScenarioPanel";
import DecisionInput from "@/components/sim/DecisionInput";
import HintChips from "@/components/sim/HintChips";
import ScoreIndicator from "@/components/sim/ScoreIndicator";
import ExplanationPanel from "@/components/sim/ExplanationPanel";
import DeckGLOverlay from "@/components/map/DeckGLOverlay";
import { Loader2 } from "lucide-react";
import type { DecisionResult } from "@/types";

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
    const [lastResult, setLastResult] = useState<DecisionResult | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [decisionInput, setDecisionInput] = useState("");

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
        async (headline: typeof sim.headlines[0]) => {
            sim.selectHeadline(headline);
            try {
                const res = await fetch("/api/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ location: sim.location, headline }),
                });
                if (!res.ok) throw new Error("Analyze failed");
                const scenario = await res.json();
                sim.setScenario(scenario);
                map.flyTo(scenario.cameraTarget, 3000);
                map.startBroll(scenario.cameraTarget.center[0], scenario.cameraTarget.center[1]);
                if (scenario.affectedArea) {
                    map.addLayers([{
                        type: "add_layer",
                        layerType: "polygon",
                        layerId: "affected-area",
                        geoJson: scenario.affectedArea,
                        color: "#14B8A6",
                    }]);
                }
            } catch {
                sim.setError("Failed to analyze the headline. Please try again.");
            }
        },
        [sim, map]
    );

    /* ─── scenario ready → decisions ─── */
    const handleScenarioReady = useCallback(() => {
        map.stopBroll();
        sim.startDecisions();
    }, [sim, map]);

    /* ─── submit decision ─── */
    const handleDecisionSubmit = useCallback(
        async (text: string) => {
            if (!sim.scenario) return;
            sim.setLoading(true);
            const result = await decision.submitDecision(
                sim.scenario,
                text,
                sim.currentRound,
                sim.currentScore,
                sim.decisions
            );
            if (result) {
                sim.addDecision(result);
                map.addLayers(result.mapInstructions);
                setLastResult(result);
                setShowExplanation(true);
            } else {
                sim.setLoading(false);
            }
        },
        [sim, decision, map]
    );

    /* ─── continue after explanation ─── */
    const handleContinue = useCallback(() => {
        setShowExplanation(false);
        setLastResult(null);
        setDecisionInput("");
    }, []);

    /* ─── end early ─── */
    const handleEndEarly = useCallback(() => {
        sim.endEarly();
    }, [sim]);

    /* ─── generate report on complete ─── */
    useEffect(() => {
        if (sim.step !== "complete" || sim.reportSlug) return;
        if (!sim.location || !sim.selectedHeadline) return;

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

    /* ─── hint chip fill ─── */
    const handleHintSelect = useCallback((hint: string) => {
        setDecisionInput(hint);
    }, []);

    return (
        <div className="relative w-full h-screen overflow-hidden">
            <Navbar />

            {/* Map fills the screen */}
            <div className="absolute inset-0">
                <MapCanvas
                    onMapReady={map.setMapInstance}
                    onClick={handleMapClick}
                />
                <DeckGLOverlay
                    map={map.mapRef.current}
                    layers={map.deckLayers}
                />
            </div>

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
                        <ScenarioPanel
                            context={sim.scenario.context}
                            onReady={handleScenarioReady}
                        />
                    </div>
                )}

                {/* Decision round */}
                {sim.step === "decision" && sim.scenario && (
                    <div className="pointer-events-auto mt-auto flex flex-col gap-3 pb-4">
                        <ScoreIndicator
                            score={sim.currentScore}
                            previousScore={lastResult?.newScore !== undefined ? sim.currentScore - (lastResult?.scoreDelta ?? 0) : undefined}
                            round={sim.currentRound}
                        />

                        {showExplanation && lastResult ? (
                            <ExplanationPanel
                                explanation={lastResult.explanation}
                                climateTerms={lastResult.climateTerms}
                                alternativeDecision={lastResult.alternativeDecision}
                                onContinue={handleContinue}
                                isLastRound={sim.currentRound > 3}
                            />
                        ) : (
                            <>
                                <HintChips
                                    hints={sim.scenario.hints}
                                    onSelect={handleHintSelect}
                                />
                                <DecisionInput
                                    onSubmit={handleDecisionSubmit}
                                    isSubmitting={decision.isSubmitting || sim.isLoading}
                                />
                                {sim.currentRound >= 2 && (
                                    <button
                                        onClick={handleEndEarly}
                                        className="text-xs text-muted-foreground underline underline-offset-2 mx-auto hover:text-foreground transition-colors"
                                    >
                                        End simulation early
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Complete — loading report */}
                {sim.step === "complete" && (
                    <div className="pointer-events-auto flex flex-col items-center justify-center flex-1 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                            Generating your report...
                        </p>
                    </div>
                )}

                {/* Error */}
                {sim.error && (
                    <div className="pointer-events-auto fixed bottom-4 left-4 right-4 mx-auto max-w-sm rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive text-center">
                        {sim.error}
                    </div>
                )}
            </div>
        </div>
    );
}
