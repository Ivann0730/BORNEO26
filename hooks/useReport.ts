"use client";

import { useCallback, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type {
    Location,
    ClimateHeadline,
    DecisionResult,
    ReportSession,
} from "@/types";

interface UseReportReturn {
    generateReport: (
        location: Location,
        headline: ClimateHeadline,
        finalScore: number,
        decisions: DecisionResult[],
        userName: string
    ) => Promise<string | null>;
    fetchReport: (slug: string) => Promise<ReportSession | null>;
    isGenerating: boolean;
    error: string | null;
}

export function useReport(): UseReportReturn {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateReport = useCallback(
        async (
            location: Location,
            headline: ClimateHeadline,
            finalScore: number,
            decisions: DecisionResult[],
            userName: string
        ): Promise<string | null> => {
            setIsGenerating(true);
            setError(null);

            try {
                const res = await fetch("/api/report", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        location,
                        headline,
                        finalScore,
                        decisions,
                        userName,
                    }),
                });

                if (!res.ok) {
                    throw new Error("Failed to generate report");
                }

                const data = await res.json();
                return data.slug as string;
            } catch (err) {
                const msg =
                    err instanceof Error ? err.message : "Something went wrong";
                setError(msg);
                return null;
            } finally {
                setIsGenerating(false);
            }
        },
        []
    );

    const fetchReport = useCallback(
        async (slug: string): Promise<ReportSession | null> => {
            try {
                const { data, error: dbError } = await supabaseBrowser
                    .from("reports")
                    .select("*")
                    .eq("slug", slug)
                    .single();

                if (dbError || !data) return null;

                return {
                    slug: data.slug,
                    userName: data.user_name ?? "",
                    location: data.location as Location,
                    headline: data.headline as ClimateHeadline,
                    finalScore: data.final_score,
                    decisions: data.decisions as DecisionResult[],
                    verdict: data.verdict ?? "",
                    createdAt: data.created_at,
                } as ReportSession;
            } catch {
                return null;
            }
        },
        []
    );

    return { generateReport, fetchReport, isGenerating, error };
}
