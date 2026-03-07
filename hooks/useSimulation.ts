"use client";

import { useState, useCallback } from "react";
import type {
    SimulationStep,
    Location,
    ClimateHeadline,
    Scenario,
    DecisionResult,
} from "@/types";

interface SimulationState {
    step: SimulationStep;
    location: Location | null;
    headlines: ClimateHeadline[];
    selectedHeadline: ClimateHeadline | null;
    scenario: Scenario | null;
    decisions: DecisionResult[];
    currentRound: number;
    currentScore: number;
    reportSlug: string | null;
    isLoading: boolean;
    error: string | null;
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
    reportSlug: null,
    isLoading: false,
    error: null,
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
        setState((prev) => ({
            ...prev,
            headlines,
            isLoading: false,
        }));
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
            step: "scenario",
            isLoading: false,
        }));
    }, []);

    const startDecisions = useCallback(() => {
        setState((prev) => ({
            ...prev,
            step: "decision",
        }));
    }, []);

    const addDecision = useCallback((result: DecisionResult) => {
        setState((prev) => {
            const decisions = [...prev.decisions, result];
            const nextRound = prev.currentRound + 1;
            const isComplete = nextRound > 3;

            return {
                ...prev,
                decisions,
                currentScore: result.newScore,
                currentRound: isComplete ? prev.currentRound : nextRound,
                step: isComplete ? "complete" : "decision",
                isLoading: false,
            };
        });
    }, []);

    const endEarly = useCallback(() => {
        setState((prev) => ({
            ...prev,
            step: "complete",
        }));
    }, []);

    const setReportSlug = useCallback((slug: string) => {
        setState((prev) => ({
            ...prev,
            reportSlug: slug,
        }));
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
        setLocation,
        setHeadlines,
        selectHeadline,
        setScenario,
        startDecisions,
        addDecision,
        endEarly,
        setReportSlug,
        setLoading,
        setError,
        reset,
    };
}
