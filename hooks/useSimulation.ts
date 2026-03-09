"use client";

import { useState, useCallback } from "react";
import type {
    SimulationStep,
    Location,
    ClimateHeadline,
    Scenario,
    DecisionResult,
    SectorStakeholder,
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
            // Default to a varied subset if none provided by LLM (since analyze doesn't return sectors yet, but we will use the default for predictions)
            const defaultSectors = sectors && sectors.length > 0 ? sectors : ["Agriculture", "Infrastructure", "Public Health", "Economy", "Biodiversity"];

            const initialStakeholders = defaultSectors.map(s => {
                const persona = SECTOR_PERSONAS[s] || { name: "Community Member", role: "Local Resident", avatarEmoji: "🙋" };
                return {
                    sectorId: s,
                    name: persona.name,
                    role: persona.role,
                    avatarEmoji: persona.avatarEmoji,
                    approval: scenario.initialScore,
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

    const startDecisions = useCallback(() => {
        setState((prev) => ({ ...prev, step: "decision" }));
    }, []);

    // BUG-04 fix: addDecision does NOT auto-advance to complete.
    // The sim page calls advanceAfterExplanation() after showing the explanation.
    const addDecision = useCallback((result: DecisionResult, capitalCost?: number) => {
        setState((prev) => {
            const decisions = [...prev.decisions, result];
            const newSatisfaction = result.newSatisfaction;

            // Check failstate
            const isFailed = newSatisfaction <= FAILSTATE_THRESHOLD;
            const cost = capitalCost ?? 0;
            const newCapital = prev.policyCapital - cost;

            const capitalHistoryEntry = {
                starting: prev.policyCapital,
                roundCost: cost,
                ending: newCapital
            };

            return {
                ...prev,
                decisions,
                currentScore: result.newScore,
                satisfactionScore: newSatisfaction,
                policyCapital: newCapital,
                policyCapitalHistory: [...prev.policyCapitalHistory, capitalHistoryEntry],
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
                        lastQuote: quote,
                    };
                }
                return s;
            });
            // Also append any new sectors that were affected but not in initial predictions
            if (!stakeholders.some(s => s.sectorId === sectorId)) {
                const persona = SECTOR_PERSONAS[sectorId] || { name: "Community Member", role: "Local Resident", avatarEmoji: "🙋" };
                stakeholders.push({
                    sectorId,
                    name: persona.name,
                    role: persona.role,
                    avatarEmoji: persona.avatarEmoji,
                    approval: Math.max(0, Math.min(100, prev.currentScore + approvalDelta)), // fallback to score
                    lastQuote: quote,
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
