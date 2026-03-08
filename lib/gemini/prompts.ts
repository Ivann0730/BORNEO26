import type {
    Location,
    ClimateHeadline,
    DecisionResult,
    Scenario,
} from "@/types";
import { MAX_DECISIONS } from "@/lib/constants";

export function buildAnalyzePrompt(
    location: Location,
    headline: ClimateHeadline
): string {
    return `You are a climate education assistant for middle school students in ASEAN.

Given this location and news headline, generate a climate scenario object.

Location: ${location.name}, ${location.country}
Headline: ${headline.title}
Context: ${headline.description}

Return ONLY a valid JSON object matching this exact structure:
{
  "id": "unique string id",
  "context": "2-3 sentence engaging explanation of the issue at Grade 7-8 reading level. Focus on who is affected and why it matters.",
  "affectedArea": {
    "type": "Feature",
    "geometry": { "type": "Polygon", "coordinates": [[...]] },
    "properties": { "label": "area name" }
  },
  "initialScore": 45,
  "hints": ["hint 1", "hint 2", "hint 3"],
  "cameraTarget": {
    "center": [${location.lng}, ${location.lat}],
    "zoom": 14,
    "pitch": 45,
    "bearing": 0
  }
}

Rules:
- affectedArea polygon coordinates must be near [${location.lng}, ${location.lat}] and within 0.05 degrees
- CRITICAL: Ensure coordinates are placed logically (e.g., on actual land for city issues). Do not randomly place terrestrial zones in the middle of the ocean or water bodies.
- initialScore must be between 30 and 60
- hints must be 3 short, helpful suggestions a 13-year-old would understand
- Write at a Grade 7-8 reading level. Be engaging and solution-focused, not scary or doom-and-gloom.
- Return ONLY JSON, no explanation, no markdown`;
}

export function buildDecisionPrompt(
    scenario: Scenario,
    decisionText: string,
    round: number,
    previousScore: number,
    previousSatisfaction: number,
    history: DecisionResult[]
): string {
    return `You are a climate policy simulator for Grade 6-10 students in ASEAN.

Scenario: ${scenario.context}
Location: ${scenario.location.name}
Current score: ${previousScore}/100
Satisfaction of affected people: ${previousSatisfaction}/100
Round: ${round} of ${MAX_DECISIONS}
Decision history: ${JSON.stringify(history.map((h) => h.interpretation))}

The student just said: "${decisionText}"

Interpret their decision and return ONLY a valid JSON object:
{
  "round": ${round},
  "userInput": "${decisionText}",
  "interpretation": "1 sentence describing what you understood their decision to be",
  "scoreDelta": (integer between -30 and +30),
  "newScore": (previousScore + scoreDelta, clamped 0-100),
  "satisfactionDelta": (integer between -20 and +20, represents affected people's reaction),
  "newSatisfaction": (previousSatisfaction + satisfactionDelta, clamped 0-100),
  "affectedSectors": [
    {
      "sector": "one of: Residential, Commercial, Industrial, Institutional, Central Business District, Mixed Use, Green/Open Space",
      "explanation": "2-3 sentences explaining how this specific sector is affected.",
      "cameraTarget": {
        "center": [${scenario.location.lng}, ${scenario.location.lat}],
        "zoom": 17,
        "pitch": 55,
        "bearing": 20
      },
      "mapInstructions": [
        {
          "type": "add_layer",
          "layerType": "polygon",
          "layerId": "sector-layer-id",
          "geoJson": { "type": "Feature", "geometry": {...}, "properties": {...} },
          "color": "#hexcolor"
        }
      ]
    }
  ],
  "mapInstructions": [
    {
      "type": "add_layer",
      "layerType": "heatmap" | "polygon" | "point" | "arc" | "icon",
      "layerId": "unique-layer-id",
      "geoJson": { "type": "Feature", "geometry": {...}, "properties": {...} },
      "color": "#hexcolor",
      "intensity": 0.0-1.0,
      "label": "description"
    }
  ],
  "explanation": "2-3 sentences overall summary at Grade 7-8 reading level. Honest about tradeoffs.",
  "climateTerms": [
    { "term": "term used in explanation", "definition": "simple definition for a 13-year-old" }
  ],
  "alternativeDecision": "1 sentence nudging the student to think about a different direction they could have taken without explicitly giving them the exact answer",
  "alternativeMapInstructions": [
    {
      "type": "add_layer",
      "layerType": "polygon",
      "layerId": "alt-layer-id",
      "geoJson": { "type": "Feature", "geometry": {...}, "properties": {...} },
      "color": "#hexcolor"
    }
  ]
}

Rules:
- scoreDelta MUST be between -30 and +30
- satisfactionDelta MUST be between -20 and +20
- Provide 1-3 affectedSectors showing the specific impact on different city zones
- The cameraTarget in affectedSectors should zoom in closely to the affected area
- Provide 1-2 mapInstructions in affectedSectors to highlight the area
- CRITICAL: For affectedSectors, you MUST use these exact colors for the mapInstructions: Residential (#ef4444), Commercial (#3b82f6), Industrial (#f59e0b), Institutional (#a855f7), Central Business District (#eab308), Mixed Use (#ec4899), Green/Open Space (#22c55e).
- Provide 1-2 overall mapInstructions showing the visual effect of the decision for the whole city
- All coordinates must be tightly clustered near [${scenario.location.lng}, ${scenario.location.lat}] (within 0.02 degrees)
- CRITICAL: Ensure coordinates are placed logically. Terrestrial sectors (Residential, Commercial, Industrial, etc.) MUST be placed on land. Do not hallucinate coordinates in the middle of the ocean or water bodies!
- Only place coordinates on water if the specific sector or issue is explicitly marine-based.
- Decisions are morally complex: every choice has real tradeoffs
- Do not reward or punish obviously: ambiguous is better
- Score should never feel gameable — no obvious "win" path
- Write at Grade 7-8 reading level, engaging not scary
- Return ONLY JSON, no explanation, no markdown`;
}

export function buildVerdictPrompt(
    location: Location,
    headline: ClimateHeadline,
    finalScore: number,
    decisions: DecisionResult[]
): string {
    const decisionSummary = decisions
        .map((d) => d.interpretation)
        .join(" → ");

    return `A Grade 8 student just completed a climate policy simulation.

Location: ${location.name}
Issue: ${headline.title}
Final score: ${finalScore}/100
Their decisions: ${decisionSummary}

Write a single sentence verdict (max 20 words) summarizing their performance.
Be encouraging but honest. Use simple language.

Return ONLY the verdict sentence, no JSON, no quotes, no explanation.`;
}

export function buildLocationResolvePrompt(
    headlineTitle: string,
    headlineDescription: string,
    fallbackLat: number,
    fallbackLng: number
): string {
    return `Extract the specific geographic location mentioned in this climate news headline.

Headline: ${headlineTitle}
Description: ${headlineDescription}

Return ONLY a valid JSON object:
{
  "lat": (latitude as a number),
  "lng": (longitude as a number),
  "name": "specific place name"
}

If you cannot determine a specific location, use these fallback coordinates:
{ "lat": ${fallbackLat}, "lng": ${fallbackLng}, "name": "Unknown" }

Return ONLY JSON, no explanation, no markdown.`;
}
