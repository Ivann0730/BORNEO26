"use client";

import { useState, useCallback } from "react";
import type {
    SimulationStep,
    Location,
    ClimateHeadline,
    Scenario,
    DecisionResult,
    SectorStakeholder,
    PredictionEvaluation,
} from "@/types";
import { SECTOR_PERSONAS } from "@/lib/sectorPersonas";
import {
    MAX_DECISIONS,
    INITIAL_SATISFACTION,
    FAILSTATE_THRESHOLD,
} from "@/lib/constants";

interface SimulationState {
    step: SimulationStep;
    location: Location | null;
    headlines: ClimateHeadline[];
    selectedHeadline: ClimateHeadline | null;
    scenario: Scenario | null;
    decisions: DecisionResult[];
    currentRound: number;
    currentScore: number;
    satisfactionScore: number;
    hintsUsedRounds: number[];
    reportSlug: string | null;
    isLoading: boolean;
    error: string | null;
    isFailed: boolean;
    policyCapital: number;
    policyCapitalHistory: { starting: number, roundCost: number, ending: number }[];
    sectorStakeholders: SectorStakeholder[];
    predictionRanking: string[];
    predictionRisk: string;
    predictionEvaluation: PredictionEvaluation | null;
}

const initialState: SimulationState = {
    step: "location",
    location: null,
    headlines: [],
    selectedHeadline: null,
    scenario: null,
    decisions: [],
    currentRound: 1,
    currentScore: 50,
    satisfactionScore: INITIAL_SATISFACTION,
    hintsUsedRounds: [],
    reportSlug: null,
    isLoading: false,
    error: null,
    isFailed: false,
    policyCapital: 100,
    policyCapitalHistory: [],
    sectorStakeholders: [],
    predictionRanking: [],
    predictionRisk: "",
    predictionEvaluation: null,
};

export function useSimulation() {
    const [state, setState] = useState<SimulationState>(initialState);

    const setLocation = useCallback((location: Location) => {
        setState((prev) => ({
            ...prev,
            location,
            step: "headline",
            isLoading: true,
            error: null,
        }));
    }, []);

    const setHeadlines = useCallback((headlines: ClimateHeadline[]) => {
        setState((prev) => ({ ...prev, headlines, isLoading: false }));
    }, []);

    const selectHeadline = useCallback((headline: ClimateHeadline) => {
        setState((prev) => ({
            ...prev,
            selectedHeadline: headline,
            isLoading: true,
            error: null,
        }));
    }, []);


    const setScenario = useCallback((scenario: Scenario, sectors?: string[]) => {
        setState((prev) => {
            // Default to the 7 main city sectors where actual impacts are measured
            const defaultSectors = sectors && sectors.length > 0 ? sectors : ["Residential", "Commercial", "Industrial", "Institutional", "Business District", "Mixed Use", "Open Space"];

            const initialStakeholders = defaultSectors.map(s => {
                const persona = SECTOR_PERSONAS[s] || { name: "Community Member", role: "Local Resident", avatarEmoji: "🙋" };
                return {
                    sectorId: s,
                    name: persona.name,
                    role: persona.role,
                    avatarEmoji: persona.avatarEmoji,
                    initialApproval: scenario.initialScore,
                    approval: scenario.initialScore,
                    quotes: [],
                };
            });

            return {
                ...prev,
                scenario,
                currentScore: scenario.initialScore,
                sectorStakeholders: initialStakeholders,
                step: "scenario", // Advance straight to scenario instead of persona
                isLoading: false,
            };
        });
    }, []);

    const setPredictions = useCallback((ranking: string[], risk: string) => {
        setState((prev) => ({ ...prev, predictionRanking: ranking, predictionRisk: risk }));
    }, []);

    const setPredictionEvaluation = useCallback((evaluation: PredictionEvaluation) => {
        setState((prev) => ({ ...prev, predictionEvaluation: evaluation }));
    }, []);

    const startDecisions = useCallback(() => {
        setState((prev) => ({ ...prev, step: "decision" }));
    }, []);

    // BUG-04 fix: addDecision does NOT auto-advance to complete.
    // The sim page calls advanceAfterExplanation() after showing the explanation.
    const addDecision = useCallback((result: DecisionResult, capitalCost?: number) => {
        setState((prev) => {
            const decisions = [...prev.decisions, result];
            const newSatisfaction = result.newSatisfaction;

            const cost = capitalCost ?? 0;
            const newCapital = prev.policyCapital - cost;

            const capitalHistoryEntry = {
                starting: prev.policyCapital,
                roundCost: cost,
                ending: newCapital
            };

            // Update sector stakeholders based on affected sectors
            const updatedStakeholders = prev.sectorStakeholders.map(s => {
                const impact = result.affectedSectors.find(as => as.sector === s.sectorId);
                if (impact) {
                    return {
                        ...s,
                        approval: Math.max(0, Math.min(100, s.approval + (impact.trustDelta !== undefined ? impact.trustDelta : (result.satisfactionDelta || 0)))),
                        quotes: [...(s.quotes || []), impact.explanation]
                    };
                }
                return s;
            });

            // Calculate new score based on average sector approval
            const currentScore = Math.round(updatedStakeholders.reduce((acc, s) => acc + s.approval, 0) / updatedStakeholders.length);
            const satisfactionScore = Math.round(updatedStakeholders.reduce((acc, s) => acc + s.approval, 0) / updatedStakeholders.length);

            // Check failstate
            const isFailed = satisfactionScore <= FAILSTATE_THRESHOLD;

            return {
                ...prev,
                decisions,
                currentScore,
                satisfactionScore,
                policyCapital: newCapital,
                policyCapitalHistory: [...prev.policyCapitalHistory, capitalHistoryEntry],
                sectorStakeholders: updatedStakeholders,
                isLoading: false,
                isFailed,
            };
        });
    }, []);

    const updateSectorStakeholder = useCallback((sectorId: string, quote: string, approvalDelta: number) => {
        setState((prev) => {
            const stakeholders = prev.sectorStakeholders.map(s => {
                if (s.sectorId === sectorId) {
                    return {
                        ...s,
                        approval: Math.max(0, Math.min(100, s.approval + approvalDelta)),
                        quotes: [...(s.quotes || []), quote],
                    };
                }
                return s;
            });
            // Also append any new sectors that were affected but not in initial predictions
            if (!stakeholders.some(s => s.sectorId === sectorId)) {
                const persona = SECTOR_PERSONAS[sectorId] || { name: "Community Member", role: "Local Resident", avatarEmoji: "🙋" };
                const newApproval = Math.max(0, Math.min(100, prev.currentScore + approvalDelta));
                stakeholders.push({
                    sectorId,
                    name: persona.name,
                    role: persona.role,
                    avatarEmoji: persona.avatarEmoji,
                    initialApproval: prev.currentScore,
                    approval: newApproval,
                    quotes: [quote],
                });
            }
            return { ...prev, sectorStakeholders: stakeholders };
        });
    }, []);

    // Called after the explanation panel is dismissed
    const advanceAfterExplanation = useCallback(() => {
        setState((prev) => {
            const completedRounds = prev.decisions.length;
            const isComplete =
                completedRounds >= MAX_DECISIONS || prev.isFailed;

            if (isComplete) {
                return { ...prev, step: "complete" };
            }

            return {
                ...prev,
                currentRound: completedRounds + 1,
            };
        });
    }, []);

    const recordHintUsed = useCallback((round: number) => {
        setState((prev) => {
            if (prev.hintsUsedRounds.includes(round)) return prev;
            return {
                ...prev,
                hintsUsedRounds: [...prev.hintsUsedRounds, round],
            };
        });
    }, []);

    const endSimulationEarly = useCallback(() => {
        setState((prev) => ({ ...prev, step: "complete" }));
    }, []);

    const setReportSlug = useCallback((slug: string) => {
        setState((prev) => ({ ...prev, reportSlug: slug }));
    }, []);

    const setLoading = useCallback((isLoading: boolean) => {
        setState((prev) => ({ ...prev, isLoading }));
    }, []);

    const setError = useCallback((error: string | null) => {
        setState((prev) => ({ ...prev, error, isLoading: false }));
    }, []);

    const reset = useCallback(() => {
        setState(initialState);
    }, []);

    return {
        ...state,
        maxDecisions: MAX_DECISIONS,
        setLocation,
        setHeadlines,
        selectHeadline,
        setScenario,
        setPredictions,
        setPredictionEvaluation,
        startDecisions,
        addDecision,
        updateSectorStakeholder,
        advanceAfterExplanation,
        endSimulationEarly,
        recordHintUsed,
        setReportSlug,
        setLoading,
        setError,
        reset,
    };
}
