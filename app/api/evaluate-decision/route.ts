import { NextRequest, NextResponse } from "next/server";
import { evaluateDecisionBodySchema } from "@/lib/validations/api";
import { buildDecisionEvaluationPrompt } from "@/lib/gemini/prompts";
import { parseGeminiJson } from "@/lib/gemini/parser";
import { decisionEvaluationSchema } from "@/lib/gemini/schemas";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = evaluateDecisionBodySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request body", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { scenarioContext, decisionText } = parsed.data;

        const prompt = buildDecisionEvaluationPrompt(scenarioContext, decisionText);
        const result = await parseGeminiJson(prompt, decisionEvaluationSchema);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Evaluate Decision API error:", error);
        return NextResponse.json(
            { error: "Failed to evaluate decision" },
            { status: 500 }
        );
    }
}
