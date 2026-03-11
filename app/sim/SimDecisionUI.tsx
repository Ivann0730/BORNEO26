"use client";

import { useCallback, useState } from "react";
import ScoreIndicator from "@/components/sim/ScoreIndicator";
import ExplanationPanel from "@/components/sim/ExplanationPanel";
import HintButton from "@/components/sim/HintButton";
import DecisionInput from "@/components/sim/DecisionInput";
import SimPanel from "@/components/sim/SimPanel";
import ZoneLegend from "@/components/sim/ZoneLegend";
import { useEvaluateDecision } from "@/hooks/useEvaluateDecision";
import type { DecisionResult, DecisionEvaluation } from "@/types";
import { AlertCircle, Info } from "lucide-react";

interface SimDecisionUIProps {
    sim: ReturnType<typeof import("@/hooks/useSimulation").useSimulation>;
    decision: ReturnType<typeof import("@/hooks/useDecision").useDecision>;
    map: ReturnType<typeof import("@/hooks/useMap").useMap>;
}

export default function SimDecisionUI({ sim, decision, map }: SimDecisionUIProps) {
    const [lastResult, setLastResult] = useState<DecisionResult | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [currentSectorIndex, setCurrentSectorIndex] = useState(-1);

    const { evaluateDecision, isEvaluating } = useEvaluateDecision();
    const [rejection, setRejection] = useState<DecisionEvaluation | null>(null);
    const [inputMode, setInputMode] = useState<"guided" | "freeform">(sim.currentRound === 1 ? "guided" : "freeform");

    // Extracted simulation execution out of handleDecisionSubmit so it can be called from override
    const executeSimulateDecision = useCallback(async (text: string) => {
        sim.setLoading(true);
        const result = await decision.submitDecision(
            sim.scenario!,
            text,
            sim.currentRound,
            sim.currentEcology,
            sim.currentEconomy,
            sim.societyScore,
            sim.sectorStakeholders.map(s => `[${s.sectorId}]: ${s.approval}`).join(', '),
            sim.decisions
        );
        if (result) {
            sim.addDecision(result);
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
    }, [sim, decision, map]);

    /* ─── submit decision ─── */
    const handleDecisionSubmit = useCallback(
        async (text: string) => {
            if (!sim.scenario) return;

            setRejection(null);
            sim.setLoading(true);

            // 1. Evaluate the decision's quality first
            const evaluation = await evaluateDecision(
                sim.scenario.context,
                text
            );

            if (!evaluation) {
                // If evaluation request failed entirely, fallback to continuing
            } else if (evaluation.status !== "accepted") {
                // Decision is rejected or needs info! Show the hint and stop.
                setRejection(evaluation);
                sim.setLoading(false);
                return;
            }

            // 2. Decision accepted, proceed to simulate
            await executeSimulateDecision(text);
        },
        [sim, evaluateDecision, executeSimulateDecision]
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

    const prevEcology = lastResult
        ? sim.currentEcology - (lastResult.ecologyDelta ?? 0)
        : undefined;
    const prevEconomy = lastResult
        ? sim.currentEconomy - (lastResult.economyDelta ?? 0)
        : undefined;
    const prevSociety = lastResult
        ? sim.societyScore - (lastResult.societyDelta ?? 0)
        : undefined;

    const isLastRound = sim.decisions.length >= sim.maxDecisions || sim.isFailed;

    return (
        <>
            {/* Fixed top score bar */}
            <ScoreIndicator
                ecology={sim.currentEcology}
                economy={sim.currentEconomy}
                society={sim.societyScore}
                previousEcology={prevEcology}
                previousEconomy={prevEconomy}
                previousSociety={prevSociety}
                round={sim.currentRound}
            />

            <ZoneLegend
                sectorTrusts={sim.sectorStakeholders.reduce((acc, s) => ({ ...acc, [s.sectorId]: s.approval }), {})}
                activeSectorId={showExplanation && lastResult && currentSectorIndex >= 0 ? lastResult.affectedSectors[currentSectorIndex].sector : undefined}
                activeSectorDelta={showExplanation && lastResult && currentSectorIndex >= 0 ? lastResult.affectedSectors[currentSectorIndex].trustDelta : undefined}
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

                        {rejection && rejection.status === "rejected" && (
                            <div className="w-full max-w-sm mx-auto sm:max-w-md bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-2 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-orange-700 dark:text-orange-500">Decision Rejected</p>
                                        <p className="text-sm text-foreground/80 leading-snug">{rejection.justification}</p>
                                        {rejection.hint && (
                                            <p className="text-sm text-muted-foreground mt-2 italic flex gap-1.5 items-start">
                                                <span className="font-semibold text-orange-600/80 not-italic shrink-0">Hint:</span>
                                                {rejection.hint}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {rejection && rejection.status === "needs_more_info" && (
                            <div className="w-full max-w-sm mx-auto sm:max-w-md bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-2 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-start gap-3">
                                    <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-blue-700 dark:text-blue-500">Needs More Detail</p>
                                        <p className="text-sm text-foreground/80 leading-snug">{rejection.justification}</p>
                                        {rejection.hint && (
                                            <p className="text-sm text-blue-800/80 dark:text-blue-200/80 mt-2 font-medium flex gap-1.5 items-start">
                                                {rejection.hint}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <DecisionInput
                            onSubmit={handleDecisionSubmit}
                            isSubmitting={decision.isSubmitting || sim.isLoading || isEvaluating}
                            inputMode={inputMode}
                            onInputModeChange={setInputMode}
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
