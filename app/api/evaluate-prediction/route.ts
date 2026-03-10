import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildPredictionEvaluationPrompt } from "@/lib/gemini/prompts";
import { parseGeminiJson } from "@/lib/gemini/parser";
import { evaluatePredictionSchema } from "@/lib/gemini/schemas";

const evaluatePredictionBodySchema = z.object({
    scenarioContext: z.string(),
    predictedSectors: z.array(z.string()),
    predictedRisk: z.string(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = evaluatePredictionBodySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request body", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { scenarioContext, predictedSectors, predictedRisk } = parsed.data;

        const prompt = buildPredictionEvaluationPrompt(
            scenarioContext,
            predictedSectors,
            predictedRisk
        );

        const result = await parseGeminiJson(prompt, evaluatePredictionSchema);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Evaluate Prediction API error:", error);
        return NextResponse.json(
            { error: "Failed to evaluate prediction" },
            { status: 500 }
        );
    }
}
