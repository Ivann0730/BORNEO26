import { NextRequest, NextResponse } from "next/server";
import { analyzeBodySchema } from "@/lib/validations/api";
import { buildAnalyzePrompt } from "@/lib/gemini/prompts";
import { parseGeminiJson } from "@/lib/gemini/parser";
import { scenarioResponseSchema } from "@/lib/gemini/schemas";
import type { Scenario } from "@/types";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = analyzeBodySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request body", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { location, headline } = parsed.data;
        const prompt = buildAnalyzePrompt(location, headline);
        const result = await parseGeminiJson(prompt, scenarioResponseSchema);

        const scenario = {
            ...result,
            headline,
            location,
        } as Scenario;

        return NextResponse.json(scenario);
    } catch (error) {
        console.error("Analyze API error:", error);
        return NextResponse.json(
            { error: "Failed to analyze scenario" },
            { status: 500 }
        );
    }
}
