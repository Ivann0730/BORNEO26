"use client";

import { useCallback, useState } from "react";
import type { Scenario, DecisionResult } from "@/types";

interface UseDecisionReturn {
    submitDecision: (
        scenario: Scenario,
        decisionText: string,
        round: number,
        previousScore: number,
        history: DecisionResult[]
    ) => Promise<DecisionResult | null>;
    isSubmitting: boolean;
    error: string | null;
}

export function useDecision(): UseDecisionReturn {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitDecision = useCallback(
        async (
            scenario: Scenario,
            decisionText: string,
            round: number,
            previousScore: number,
            history: DecisionResult[]
        ): Promise<DecisionResult | null> => {
            setIsSubmitting(true);
            setError(null);

            try {
                const res = await fetch("/api/decision", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        scenarioId: scenario.id,
                        scenario,
                        decisionText,
                        round,
                        previousScore,
                        history,
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error ?? "Failed to process decision");
                }

                const result: DecisionResult = await res.json();
                return result;
            } catch (err) {
                const msg =
                    err instanceof Error ? err.message : "Something went wrong";
                setError(msg);
                return null;
            } finally {
                setIsSubmitting(false);
            }
        },
        []
    );

    return { submitDecision, isSubmitting, error };
}
