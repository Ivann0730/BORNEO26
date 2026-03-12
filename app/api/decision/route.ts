import { NextRequest, NextResponse } from "next/server";
import { decisionBodySchema } from "@/lib/validations/api";
import { buildDecisionPrompt } from "@/lib/gemini/prompts";
import { parseGeminiJson } from "@/lib/gemini/parser";
import { decisionResultSchema } from "@/lib/gemini/schemas";
import { getZonesForLocation, getZoneById, buildZoneSummaryForPrompt } from "@/lib/zones";
import type { DecisionResult, Scenario, MapInstruction } from "@/types";

/** Sector type → polygon color (matches ZoneLegend) */
const SECTOR_COLORS: Record<string, string> = {
    "Residential": "#ef4444",
    "Commercial": "#3b82f6",
    "Industrial": "#f59e0b",
    "Institutional": "#a855f7",
    "Business District": "#eab308",
    "Mixed Use": "#ec4899",
    "Open Space": "#22c55e",
};

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
            previousSociety,
            sectorApprovalsList,
            history,
        } = parsed.data;

        const fullScenario: Scenario = {
            ...scenario,
        } as unknown as Scenario;

        // Fetch zones for the location
        const zones = await getZonesForLocation(
            fullScenario.location.lat,
            fullScenario.location.lng
        );
        const zonesSummary = zones.length > 0
            ? buildZoneSummaryForPrompt(zones)
            : undefined;

        const prompt = buildDecisionPrompt(
            fullScenario,
            decisionText,
            round,
            previousEcology,
            previousEconomy,
            sectorApprovalsList,
            history as DecisionResult[],
            zonesSummary
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

        // Resolve zone IDs → real GeoJSON polygons for each affected sector
        // Track used zone IDs to prevent overlap between sectors
        const usedZoneIds = new Set<string>();

        if (zones.length > 0 && clamped.affectedSectors) {
            for (const sector of clamped.affectedSectors) {
                const color = SECTOR_COLORS[sector.sector] || "#6b7280";
                const resolvedInstructions: MapInstruction[] = [];
                const resolvedCentroids: [number, number][] = [];

                if (sector.zoneIds && sector.zoneIds.length > 0) {
                    for (const zoneId of sector.zoneIds) {
                        // Skip zones already used by another sector
                        if (usedZoneIds.has(zoneId)) continue;

                        const zone = getZoneById(zoneId, zones);
                        if (zone) {
                            usedZoneIds.add(zoneId);
                            resolvedInstructions.push({
                                type: "add_layer",
                                layerType: "polygon",
                                layerId: `zone-${zoneId}-${Date.now()}`,
                                geoJson: zone.polygon,
                                color,
                            });
                            resolvedInstructions.push({
                                type: "add_layer",
                                layerType: "particles",
                                layerId: `particles-${zoneId}-${Date.now()}`,
                                coordinates: zone.centroid,
                                geoJson: zone.polygon,
                                color,
                                delta: sector.trustDelta,
                            });
                            resolvedCentroids.push(zone.centroid);
                        }
                    }
                }

                // If we resolved any zones, use those instead of LLM-generated instructions
                if (resolvedInstructions.length > 0) {
                    sector.mapInstructions = resolvedInstructions;

                    // Pick a RANDOM resolved zone's centroid for camera b-roll
                    const randomCentroid = resolvedCentroids[
                        Math.floor(Math.random() * resolvedCentroids.length)
                    ];
                    sector.cameraTarget = {
                        center: randomCentroid,
                        zoom: 17,
                        pitch: 55,
                        bearing: Math.floor(Math.random() * 360),
                    };
                }
            }
        }

        return NextResponse.json(clamped);
    } catch (error) {
        console.error("Decision API error:", error);
        return NextResponse.json(
            { error: "Failed to process decision" },
            { status: 500 }
        );
    }
}
