import { NextRequest, NextResponse } from "next/server";
import { analyzeBodySchema } from "@/lib/validations/api";
import { buildAnalyzePrompt, buildLocationResolvePrompt } from "@/lib/gemini/prompts";
import { parseGeminiJson } from "@/lib/gemini/parser";
import { scenarioResponseSchema, locationResolveSchema } from "@/lib/gemini/schemas";
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

        let resolvedLat = headline.resolvedLat ?? location.lat;
        let resolvedLng = headline.resolvedLng ?? location.lng;

        if (!headline.resolvedLat || !headline.resolvedLng) {
            try {
                const resolvePrompt = buildLocationResolvePrompt(
                    headline.title,
                    headline.description,
                    location.lat,
                    location.lng
                );
                const resolved = await parseGeminiJson(resolvePrompt, locationResolveSchema);
                resolvedLat = resolved.lat;
                resolvedLng = resolved.lng;
            } catch {
                console.warn("Location resolve failed, using user coordinates");
            }
        }

        const resolvedLocation = { ...location, lat: resolvedLat, lng: resolvedLng };
        const prompt = buildAnalyzePrompt(resolvedLocation, headline);
        const result = await parseGeminiJson(prompt, scenarioResponseSchema);

        const scenario = {
            ...result,
            headline: { ...headline, resolvedLat, resolvedLng },
            location: resolvedLocation,
        } as Scenario;

        // Force camera to orbit the exact resolved coordinates rather than LLM hallucinations
        if (scenario.cameraTarget) {
            scenario.cameraTarget.center = [resolvedLng, resolvedLat];
            scenario.cameraTarget.zoom = 16.5; // Ensure low enough altitude for 3D buildings
            scenario.cameraTarget.pitch = 75;
        }

        return NextResponse.json(scenario);
    } catch (error) {
        console.error("Analyze API error:", error);
        return NextResponse.json(
            { error: "Failed to analyze scenario" },
            { status: 500 }
        );
    }
}
