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

        const { location, headline, finalScore, decisions, userName } =
            parsed.data;

        const slug = nanoid(8);

        const verdict = await getGeminiText(
            buildVerdictPrompt(
                location,
                headline,
                finalScore,
                decisions as DecisionResult[]
            )
        );

        const { error } = await supabaseServer.from("reports").insert({
            slug,
            user_name: userName,
            location,
            headline,
            final_score: finalScore,
            decisions,
            verdict,
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
