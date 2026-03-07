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
                map.addLayers(result.mapInstructions);
                setLastResult(result);
                setShowExplanation(true);
            } else {
                sim.setLoading(false);
            }
        },
        [sim, decision, map]
    );

    /* ─── continue after explanation (BUG-04 fix) ─── */
    const handleContinue = useCallback(() => {
        setShowExplanation(false);
        setLastResult(null);
        sim.advanceAfterExplanation();
    }, [sim]);

    /* ─── hint fill ─── */
    const handleHintSelect = useCallback(
        (hint: string) => {
            handleDecisionSubmit(hint);
        },
        [handleDecisionSubmit]
    );

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
                    <ExplanationPanel
                        explanation={lastResult.explanation}
                        climateTerms={lastResult.climateTerms}
                        alternativeDecision={lastResult.alternativeDecision}
                        onContinue={handleContinue}
                        isLastRound={isLastRound}
                    />
                ) : (
                    <>
                        <HintButton
                            hints={sim.scenario?.hints ?? []}
                            onSelect={handleHintSelect}
                            onHintUsed={handleHintUsed}
                        />
                        <DecisionInput
                            onSubmit={handleDecisionSubmit}
                            isSubmitting={decision.isSubmitting || sim.isLoading}
                        />
                        {sim.currentRound >= 2 && (
                            <button
                                onClick={() => sim.advanceAfterExplanation()}
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
