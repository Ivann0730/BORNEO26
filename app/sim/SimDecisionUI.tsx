"use client";

import { useCallback, useState } from "react";
import ScoreIndicator from "@/components/sim/ScoreIndicator";
import ExplanationPanel from "@/components/sim/ExplanationPanel";
import HintButton from "@/components/sim/HintButton";
import DecisionInput from "@/components/sim/DecisionInput";
import SimPanel from "@/components/sim/SimPanel";
import type { DecisionResult } from "@/types";

interface SimDecisionUIProps {
    sim: ReturnType<typeof import("@/hooks/useSimulation").useSimulation>;
    decision: ReturnType<typeof import("@/hooks/useDecision").useDecision>;
    map: ReturnType<typeof import("@/hooks/useMap").useMap>;
}

export default function SimDecisionUI({ sim, decision, map }: SimDecisionUIProps) {
    const [lastResult, setLastResult] = useState<DecisionResult | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [currentSectorIndex, setCurrentSectorIndex] = useState(-1);

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
                sim.satisfactionScore,
                sim.decisions
            );
            if (result) {
                sim.addDecision(result);
                // Start with the first sector
                setLastResult(result);
                
                if (result.affectedSectors && result.affectedSectors.length > 0) {
                    setCurrentSectorIndex(0);
                    const firstSector = result.affectedSectors[0];
                    map.addLayers(firstSector.mapInstructions);
                    if (firstSector.cameraTarget) {
                        map.startBroll(
                            firstSector.cameraTarget.center[0],
                            firstSector.cameraTarget.center[1],
                            firstSector.cameraTarget.zoom,
                            firstSector.cameraTarget.pitch
                        );
                    }
                } else {
                    setCurrentSectorIndex(-1);
                    map.addLayers(result.mapInstructions);
                }
                
                setShowExplanation(true);
            } else {
                sim.setLoading(false);
            }
        },
        [sim, decision, map]
    );

    /* ─── continue after explanation (BUG-04 fix) ─── */
    const handleContinue = useCallback(() => {
        if (!lastResult) return;

        const totalSectors = lastResult.affectedSectors?.length || 0;

        if (currentSectorIndex >= 0 && currentSectorIndex < totalSectors - 1) {
            // Move to next sector
            const nextIndex = currentSectorIndex + 1;
            setCurrentSectorIndex(nextIndex);
            const nextSector = lastResult.affectedSectors[nextIndex];
            
            // Note: we intentionally do NOT clear layers.
            // The sectors will accumulate persistently so the user can see all affected regions side-by-side.
            map.addLayers(nextSector.mapInstructions);
            
            if (nextSector.cameraTarget) {
                map.startBroll(
                    nextSector.cameraTarget.center[0],
                    nextSector.cameraTarget.center[1],
                    nextSector.cameraTarget.zoom,
                    nextSector.cameraTarget.pitch
                );
            }
        } else if (currentSectorIndex === totalSectors - 1 && totalSectors > 0) {
            // All sectors done, show overall
            setCurrentSectorIndex(-1);
            // Append overall view layout persistently.
            map.addLayers(lastResult.mapInstructions);
            
            // Return to exactly the original camera position with broll panning
            if (sim.scenario?.cameraTarget) {
                map.startBroll(
                    sim.scenario.cameraTarget.center[0],
                    sim.scenario.cameraTarget.center[1],
                    sim.scenario.cameraTarget.zoom,
                    sim.scenario.cameraTarget.pitch || 60
                );
            }
        } else {
            // Overall is done, advance to next round
            setShowExplanation(false);
            setLastResult(null);
            setCurrentSectorIndex(-1);
            // DO NOT clear layers - let the highlighted zones persist into the next round!
            sim.advanceAfterExplanation();
        }
    }, [sim, lastResult, currentSectorIndex, map]);

    /* ─── hint fill ─── */
    const handleHintUsed = useCallback(() => {
        sim.recordHintUsed(sim.currentRound);
    }, [sim]);

    const prevScore = lastResult
        ? sim.currentScore - (lastResult.scoreDelta ?? 0)
        : undefined;

    const isLastRound = sim.decisions.length >= sim.maxDecisions || sim.isFailed;

    return (
        <>
            {/* Fixed top score bar */}
            <ScoreIndicator
                score={sim.currentScore}
                previousScore={prevScore}
                satisfaction={sim.satisfactionScore}
                round={sim.currentRound}
            />

            {/* Side panel / bottom sheet */}
            <SimPanel>
                {showExplanation && lastResult ? (
                    currentSectorIndex >= 0 ? (
                        <ExplanationPanel
                            explanation={lastResult.affectedSectors[currentSectorIndex].explanation}
                            climateTerms={lastResult.climateTerms}
                            onContinue={handleContinue}
                            isLastRound={false}
                            sectorName={lastResult.affectedSectors[currentSectorIndex].sector}
                            stepInfo={{ current: currentSectorIndex + 1, total: (lastResult.affectedSectors?.length || 0) + 1 }}
                        />
                    ) : (
                        <ExplanationPanel
                            explanation={lastResult.explanation}
                            climateTerms={lastResult.climateTerms}
                            alternativeDecision={lastResult.alternativeDecision}
                            onContinue={handleContinue}
                            isLastRound={isLastRound}
                            stepInfo={lastResult.affectedSectors?.length > 0 ? { current: lastResult.affectedSectors.length + 1, total: lastResult.affectedSectors.length + 1 } : undefined}
                        />
                    )
                ) : (
                    <>
                        <HintButton
                            hints={sim.scenario?.hints ?? []}
                            onHintUsed={handleHintUsed}
                        />
                        <DecisionInput
                            onSubmit={handleDecisionSubmit}
                            isSubmitting={decision.isSubmitting || sim.isLoading}
                        />
                        {sim.currentRound >= 2 && (
                            <button
                                onClick={() => sim.endSimulationEarly()}
                                className="text-xs text-muted-foreground/70 underline underline-offset-2 mx-auto hover:text-foreground transition-colors"
                            >
                                End simulation early
                            </button>
                        )}
                    </>
                )}
            </SimPanel>
        </>
    );
}
