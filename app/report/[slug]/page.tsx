import { supabaseServer } from "@/lib/supabase/server";
import type { ReportSession, Location, ClimateHeadline, DecisionResult, PeerReport } from "@/types";
import ReportPageClient from "./ReportPageClient";

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function getReport(slug: string): Promise<ReportSession | null> {
    try {
        const { data, error } = await supabaseServer
            .from("reports")
            .select("*")
            .eq("slug", slug)
            .single();

        if (error || !data) return null;

        return {
            slug: data.slug,
            userName: data.user_name ?? "",
            location: data.location as Location,
            headline: data.headline as ClimateHeadline,
            finalScore: data.final_score,
            decisions: data.decisions as DecisionResult[],
            verdict: data.verdict ?? "",
            createdAt: data.created_at,
            policyCapitalHistory: data.policy_capital_history,
            sectorStakeholders: data.sector_stakeholders,
            predictionRanking: data.prediction_ranking,
            predictionRisk: data.prediction_risk,
        };
    } catch {
        return null;
    }
}

async function getPeerReports(headlineId: string, currentSlug: string): Promise<PeerReport[]> {
    try {
        const { data, error } = await supabaseServer
            .from("reports")
            .select("headline_id, final_score, final_satisfaction, decision_count, decisions_summary")
            .eq("headline_id", headlineId)
            .neq("slug", currentSlug)
            .limit(5);

        if (error || !data) return [];
        return data as PeerReport[];
    } catch {
        return [];
    }
}

export default async function ReportPage({ params }: PageProps) {
    const { slug } = await params;
    const report = await getReport(slug);
    const peerReports = report ? await getPeerReports(report.headline.id, report.slug) : [];

    if (!report) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Report not found</h1>
                    <p className="text-muted-foreground text-sm mb-4">
                        This report may have been removed or the link is invalid.
                    </p>
                    <a
                        href="/sim"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all"
                    >
                        Start a New Simulation
                    </a>
                </div>
            </div>
        );
    }

    return <ReportPageClient report={report} peerReports={peerReports} />;
}
