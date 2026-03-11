"use client";

import { useCallback, useState } from "react";
import type { DecisionEvaluation } from "@/types";

interface UseEvaluateDecisionReturn {
    evaluateDecision: (
        scenarioContext: string,
        decisionText: string
    ) => Promise<DecisionEvaluation | null>;
    isEvaluating: boolean;
    error: string | null;
}

export function useEvaluateDecision(): UseEvaluateDecisionReturn {
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const evaluateDecision = useCallback(
        async (
            scenarioContext: string,
            decisionText: string
        ): Promise<DecisionEvaluation | null> => {
            setIsEvaluating(true);
            setError(null);

            try {
                const res = await fetch("/api/evaluate-decision", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        scenarioContext,
                        decisionText,
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error ?? "Failed to evaluate decision");
                }

                const result: DecisionEvaluation = await res.json();
                return result;
            } catch (err) {
                const msg =
                    err instanceof Error ? err.message : "Something went wrong during evaluation";
                setError(msg);
                return null;
            } finally {
                setIsEvaluating(false);
            }
        },
        []
    );

    return { evaluateDecision, isEvaluating, error };
}
