import { z } from "zod";
import { MAX_DECISIONS } from "@/lib/constants";

/* ────────── Shared sub-schemas ────────── */



const locationSchema = z.object({
    name: z.string().min(1),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    country: z.string().min(1),
    region: z.string(),
});

const headlineSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string(),
    source: z.string(),
    url: z.string(),
    publishedAt: z.string(),
    locationTag: z.string(),
    resolvedLat: z.number().optional(),
    resolvedLng: z.number().optional(),
});

/* ────────── /api/headlines query ────────── */

export const headlinesQuerySchema = z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
});

/* ────────── /api/analyze body ────────── */

export const analyzeBodySchema = z.object({
    location: locationSchema,
    headline: headlineSchema,
});

/* ────────── /api/decision body ────────── */

export const decisionBodySchema = z.object({
    scenarioId: z.string().min(1),
    scenario: z.object({
        id: z.string(),
        context: z.string(),
        location: locationSchema,
        headline: headlineSchema,
        initialScore: z.number(),
        hints: z.array(z.string()),
        cameraTarget: z.object({
            center: z.tuple([z.number(), z.number()]),
            zoom: z.number(),
            pitch: z.number(),
            bearing: z.number(),
        }),
        affectedArea: z.object({
            type: z.literal("Feature"),
            geometry: z.object({
                type: z.string(),
                coordinates: z.unknown(),
            }).passthrough(),
            properties: z.record(z.string(), z.unknown()).nullable(),
        }).passthrough(),
    }),
    decisionText: z.string().min(1),
    round: z.number().int().min(1).max(MAX_DECISIONS),
    previousScore: z.number().int().min(0).max(100),
    previousSatisfaction: z.number().int().min(0).max(100),
    history: z.array(z.unknown()),
});

/* ────────── /api/report body ────────── */

export const reportBodySchema = z.object({
    location: locationSchema,
    headline: headlineSchema,
    finalScore: z.number().int().min(0).max(100),
    finalSatisfaction: z.number().int().min(0).max(100),
    decisions: z.array(z.unknown()).min(1),
    userName: z.string().min(1).max(100),
    sectorStakeholders: z.array(z.unknown()).optional(),
    predictionRanking: z.array(z.string()).optional(),
    predictionRisk: z.string().optional(),
    predictionEvaluation: z.unknown().optional(),
});

/* ────────── /api/evaluate-decision body ────────── */

export const evaluateDecisionBodySchema = z.object({
    scenarioContext: z.string().min(1),
    decisionText: z.string().min(1),
});

/* ────────── /api/stakeholder-react body ────────── */

export const stakeholderReactBodySchema = z.object({
    sectorId: z.string().min(1),
    personaName: z.string().min(1),
    personaRole: z.string().min(1),
    decision: z.string().min(1),
    sectorOutcome: z.string().min(1),
    currentApproval: z.number().min(0).max(100),
});

