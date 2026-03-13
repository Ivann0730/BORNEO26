import { NextRequest, NextResponse } from "next/server";
import { analyzeBodySchema } from "@/lib/validations/api";
import { buildAnalyzePrompt, buildLocationResolvePrompt } from "@/lib/gemini/prompts";
import { parseGeminiJson } from "@/lib/gemini/parser";
import { scenarioResponseSchema, locationResolveSchema } from "@/lib/gemini/schemas";
import { getZonesForLocation } from "@/lib/zones";
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

        // Pre-fetch zones for this location (predefined or Overpass fallback)
        const zones = await getZonesForLocation(resolvedLat, resolvedLng);
        const availableZoneIds = zones.map((z) => z.id);
        console.log(`[analyze] Fetched ${zones.length} zones for (${resolvedLat}, ${resolvedLng})`);

        const prompt = buildAnalyzePrompt(resolvedLocation, headline);
        const result = await parseGeminiJson(prompt, scenarioResponseSchema);

        const scenario = {
            ...result,
            headline: { ...headline, resolvedLat, resolvedLng },
            location: resolvedLocation,
            initialEcology: 50,
            initialEconomy: 50,
            initialSociety: 50,
            availableZoneIds,
        } as Scenario;

        // Force camera to orbit the exact resolved coordinates rather than LLM hallucinations
        if (scenario.cameraTarget) {
            scenario.cameraTarget.center = [resolvedLng, resolvedLat];
            scenario.cameraTarget.zoom = 16.5; // Ensure low enough altitude for 3D buildings
            scenario.cameraTarget.pitch = 75;
        }

        // MVP Override for SRP Dumpsite: Force an accurate affected area polygon
        if (headline.id === "fallback-srp-cebu") {
            scenario.affectedArea = {
                type: "Feature",
                geometry: {
                    type: "Polygon",
                    coordinates: [[
                        [123.86910033911266, 10.269811387467541],
                        [123.87017926046622, 10.270779352603],
                        [123.870097789873, 10.270873459464426],
                        [123.87028375535698, 10.271063415821246],
                        [123.86964733348009, 10.271864357501187],
                        [123.86951747658333, 10.272116147995305],
                        [123.86931734230188, 10.272274734796682],
                        [123.86914554561719, 10.272365355790527],
                        [123.86890524184764, 10.272335740345298],
                        [123.86866791446937, 10.272483870773996],
                        [123.86857207363761, 10.272618658422346],
                        [123.86863051993157, 10.272803385604618],
                        [123.86855790483833, 10.273015996001746],
                        [123.86838551129438, 10.273178579551825],
                        [123.8680813303269, 10.273298301341967],
                        [123.86814216651891, 10.27356019259787],
                        [123.8680813303269, 10.273986700750143],
                        [123.86796726246354, 10.274181248137467],
                        [123.86744255284196, 10.271846673397718],
                        [123.86910033911266, 10.269811387467541]
                    ]]
                },
                properties: { name: "South Road Properties Dumpsite Impact Zone" }
            };
            // Ensure the camera focuses nicely on it
            scenario.cameraTarget.center = [123.868563, 10.270705];
            scenario.cameraTarget.zoom = 17;
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

