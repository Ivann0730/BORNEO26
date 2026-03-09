import { NextRequest, NextResponse } from "next/server";
import { stakeholderReactBodySchema } from "@/lib/validations/api";
import { buildStakeholderReactPrompt } from "@/lib/gemini/prompts";
import { parseGeminiJson } from "@/lib/gemini/parser";
import { stakeholderReactSchema } from "@/lib/gemini/schemas";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = stakeholderReactBodySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request body", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { sectorId, personaName, personaRole, decision, sectorOutcome, currentApproval } = parsed.data;

        const prompt = buildStakeholderReactPrompt(
            sectorId,
            personaName,
            personaRole,
            decision,
            sectorOutcome,
            currentApproval
        );
        const result = await parseGeminiJson(prompt, stakeholderReactSchema);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Stakeholder React API error:", error);
        return NextResponse.json(
            { error: "Failed to generate stakeholder reaction" },
            { status: 500 }
        );
    }
}
