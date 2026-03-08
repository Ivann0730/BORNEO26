import { z } from "zod";
import { MAX_DECISIONS } from "@/lib/constants";

/* ────────── GeoJSON sub-schemas (lenient) ────────── */

const coordinateSchema = z.tuple([z.number(), z.number()]);

const geometrySchema = z.object({
    type: z.string(),
    coordinates: z.unknown(),
}).passthrough();

const featureSchema = z.object({
    type: z.literal("Feature"),
    geometry: geometrySchema,
    properties: z.record(z.string(), z.unknown()).nullable().optional(),
}).passthrough();

const geoJsonSchema = z.union([
    featureSchema,
    z.object({
        type: z.literal("FeatureCollection"),
        features: z.array(featureSchema),
    }),
]).optional();

/* ────────── Camera Target ────────── */

const cameraTargetSchema = z.object({
    center: coordinateSchema,
    zoom: z.number().min(0).max(22),
    pitch: z.number().min(0).max(85),
    bearing: z.number(),
});

/* ────────── Scenario (from /api/analyze) ────────── */

export const scenarioResponseSchema = z.object({
    id: z.string(),
    context: z.string(),
    affectedArea: featureSchema,
    initialScore: z.number().min(0).max(100),
    hints: z.array(z.string()).min(1).max(5),
    cameraTarget: cameraTargetSchema,
});

export type ScenarioResponse = z.infer<typeof scenarioResponseSchema>;

/* ────────── Map Instruction (lenient) ────────── */

const mapInstructionSchema = z.object({
    type: z.string(),
    layerType: z.string().optional(),
    layerId: z.string().optional(),
    geoJson: geoJsonSchema,
    color: z.string().optional(),
    intensity: z.number().optional(),
    label: z.string().optional(),
    coordinates: z.union([coordinateSchema, z.array(z.number())]).optional(),
    zoom: z.number().optional(),
    bearing: z.number().optional(),
    pitch: z.number().optional(),
    durationMs: z.number().optional(),
}).passthrough();

/* ────────── Climate Term ────────── */

const climateTermSchema = z.object({
    term: z.string(),
    definition: z.string(),
});

/* ────────── Affected Sector ────────── */

const affectedSectorSchema = z.object({
    sector: z.enum([
        "Residential",
        "Commercial",
        "Industrial",
        "Institutional",
        "Central Business District",
        "Mixed Use",
        "Green/Open Space"
    ]),
    explanation: z.string(),
    cameraTarget: cameraTargetSchema.optional(),
    mapInstructions: z.array(mapInstructionSchema),
});

/* ────────── Decision Result (from /api/decision) ────────── */

export const decisionResultSchema = z.object({
    round: z.number().int().min(1).max(MAX_DECISIONS),
    userInput: z.string(),
    interpretation: z.string(),
    scoreDelta: z.number().int().min(-30).max(30),
    newScore: z.number().int().min(0).max(100),
    satisfactionDelta: z.number().int().min(-20).max(20),
    newSatisfaction: z.number().int().min(0).max(100),
    affectedSectors: z.array(affectedSectorSchema).min(1),
    mapInstructions: z.array(mapInstructionSchema),
    explanation: z.string(),
    climateTerms: z.array(climateTermSchema),
    alternativeDecision: z.string(),
    alternativeMapInstructions: z.array(mapInstructionSchema),
});

export type DecisionResultResponse = z.infer<typeof decisionResultSchema>;

/* ────────── Location Resolve (from Gemini) ────────── */

export const locationResolveSchema = z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    name: z.string(),
});

export type LocationResolveResponse = z.infer<typeof locationResolveSchema>;

/* ────────── Decision Evaluation (from /api/evaluate-decision) ────────── */

export const decisionEvaluationSchema = z.object({
    status: z.enum(["accepted", "rejected", "needs_more_info"]),
    justification: z.string(),
    hint: z.string(),
});

export type DecisionEvaluationResponse = z.infer<typeof decisionEvaluationSchema>;
