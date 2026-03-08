"use client";

import { useState, useCallback } from "react";
import type {
    SimulationStep,
    Location,
    ClimateHeadline,
    Scenario,
    DecisionResult,
} from "@/types";
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


    const setScenario = useCallback((scenario: Scenario) => {
        setState((prev) => ({
            ...prev,
            scenario,
            currentScore: scenario.initialScore,
            step: "scenario", // Advance straight to scenario instead of persona
            isLoading: false,
        }));
    }, []);

    const startDecisions = useCallback(() => {
        setState((prev) => ({ ...prev, step: "decision" }));
    }, []);

    // BUG-04 fix: addDecision does NOT auto-advance to complete.
    // The sim page calls advanceAfterExplanation() after showing the explanation.
    const addDecision = useCallback((result: DecisionResult) => {
        setState((prev) => {
            const decisions = [...prev.decisions, result];
            const newSatisfaction = result.newSatisfaction;

            // Check failstate
            const isFailed = newSatisfaction <= FAILSTATE_THRESHOLD;

            return {
                ...prev,
                decisions,
                currentScore: result.newScore,
                satisfactionScore: newSatisfaction,
                isLoading: false,
                isFailed,
            };
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
        startDecisions,
        addDecision,
        advanceAfterExplanation,
        endSimulationEarly,
        recordHintUsed,
        setReportSlug,
        setLoading,
        setError,
        reset,
    };
}
