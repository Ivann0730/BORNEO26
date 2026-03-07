import { NextRequest, NextResponse } from "next/server";
import { decisionBodySchema } from "@/lib/validations/api";
import { buildDecisionPrompt } from "@/lib/gemini/prompts";
import { parseGeminiJson } from "@/lib/gemini/parser";
import { decisionResultSchema } from "@/lib/gemini/schemas";
import type { DecisionResult } from "@/types";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = decisionBodySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request body", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { scenario, decisionText, round, previousScore, history } =
            parsed.data;

        const fullScenario = {
            ...scenario,
            headline: scenario.headline,
            location: scenario.location,
        };

        const prompt = buildDecisionPrompt(
            fullScenario,
            decisionText,
            round,
            previousScore,
            history as DecisionResult[]
        );

        const result = await parseGeminiJson(prompt, decisionResultSchema);

        const clamped = {
            ...result,
            scoreDelta: Math.max(-30, Math.min(30, result.scoreDelta)),
            newScore: Math.max(
                0,
                Math.min(100, previousScore + result.scoreDelta)
            ),
        } as DecisionResult;

        return NextResponse.json(clamped);
    } catch (error) {
        console.error("Decision API error:", error);
        return NextResponse.json(
            { error: "Failed to process decision" },
            { status: 500 }
        );
    }
}
