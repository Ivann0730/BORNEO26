import { NextRequest, NextResponse } from "next/server";
import { decisionBodySchema } from "@/lib/validations/api";
import { buildDecisionPrompt } from "@/lib/gemini/prompts";
import { parseGeminiJson } from "@/lib/gemini/parser";
import { decisionResultSchema } from "@/lib/gemini/schemas";
import type { DecisionResult, Scenario } from "@/types";

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

        const {
            scenario,
            decisionText,
            round,
            previousEcology,
            previousEconomy,
            previousSociety, // We'll pass this in for logging/history, though not explicitly used in prompt
            sectorApprovalsList,
            history,
        } = parsed.data;

        // Use type assertion properly with 'unknown' step since we stripped some fields for transit
        const fullScenario: Scenario = {
            ...scenario,
        } as unknown as Scenario;

        const prompt = buildDecisionPrompt(
            fullScenario,
            decisionText,
            round,
            previousEcology,
            previousEconomy,
            sectorApprovalsList, // BUG-FIX: need to pass actual list, we'll fix this in the next pass when we update useDecision call site
            history as DecisionResult[]
        );

        const result = await parseGeminiJson(prompt, decisionResultSchema);

        // Clamp values server-side
        const clampedEcologyDelta = Math.max(-30, Math.min(30, result.ecologyDelta));
        const clampedEconomyDelta = Math.max(-30, Math.min(30, result.economyDelta));

        const clamped = {
            ...result,
            ecologyDelta: clampedEcologyDelta,
            newEcology: Math.max(0, Math.min(100, previousEcology + clampedEcologyDelta)),
            economyDelta: clampedEconomyDelta,
            newEconomy: Math.max(0, Math.min(100, previousEconomy + clampedEconomyDelta)),
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
