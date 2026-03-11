import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { reportBodySchema } from "@/lib/validations/api";
import { buildVerdictPrompt } from "@/lib/gemini/prompts";
import { getGeminiText } from "@/lib/gemini/parser";
import { supabaseServer } from "@/lib/supabase/server";
import type { DecisionResult } from "@/types";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = reportBodySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request body", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { headline, finalEcology, finalEconomy, finalSociety, decisions, userName, sectorStakeholders, predictionRanking, predictionRisk, predictionEvaluation } =
            parsed.data;

        const slug = nanoid(8);

        const verdict = await getGeminiText(
            buildVerdictPrompt(
                { name: headline.locationTag, lat: 0, lng: 0, country: "", region: "" }, // Mock Location object, buildVerdictPrompt only uses name
                headline,
                finalEcology,
                finalEconomy,
                finalSociety,
                decisions as DecisionResult[]
            )
        );

        const decisionCount = decisions.length;
        const decisionsSummary = (decisions as any[]).map((d: any) =>
            d.userInput ? d.userInput.substring(0, 120) : ""
        );

        const { error } = await supabaseServer.from("reports").insert({
            slug,
            user_name: userName,
            location: headline.locationTag, // Just fallback since location was removed from schema body for report
            headline,
            final_ecology: finalEcology,
            final_economy: finalEconomy,
            final_society: finalSociety,
            decisions,
            verdict,
            decision_count: decisionCount,
            decisions_summary: decisionsSummary,
            headline_id: headline.id,
            sector_stakeholders: sectorStakeholders,
            prediction_ranking: predictionRanking,
            prediction_risk: predictionRisk,
            prediction_evaluation: predictionEvaluation,
        });

        if (error) {
            console.error("Supabase insert error:", error);
            return NextResponse.json(
                { error: "Failed to save report" },
                { status: 500 }
            );
        }

        return NextResponse.json({ slug });
    } catch (error) {
        console.error("Report API error:", error);
        return NextResponse.json(
            { error: "Failed to generate report" },
            { status: 500 }
        );
    }
}
