import type { Location, ClimateHeadline, DecisionResult, Scenario } from "@/types";

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
- affectedArea polygon coordinates must be near [${location.lng}, ${location.lat}]
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
    history: DecisionResult[]
): string {
    return `You are a climate policy simulator for Grade 6-10 students in ASEAN.

Scenario: ${scenario.context}
Location: ${scenario.location.name}
Current score: ${previousScore}/100
Round: ${round} of 3
Decision history: ${JSON.stringify(history)}

The student just said: "${decisionText}"

Interpret their decision and return ONLY a valid JSON object:
{
  "round": ${round},
  "userInput": "${decisionText}",
  "interpretation": "1 sentence describing what you understood their decision to be",
  "scoreDelta": (integer between -30 and +30),
  "newScore": (previousScore + scoreDelta, clamped to 0-100),
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
  "explanation": "2-3 sentences explaining the consequence at Grade 7-8 reading level. Be honest about tradeoffs.",
  "climateTerms": [
    { "term": "term used in explanation", "definition": "simple definition for a 13-year-old" }
  ],
  "alternativeDecision": "1 sentence describing a different approach they could have taken",
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
- Provide 2-4 mapInstructions showing the visual effect of the decision
- All coordinates must be near [${scenario.location.lng}, ${scenario.location.lat}]
- Decisions are morally complex: every choice has real tradeoffs
- Do not reward or punish obviously: ambiguous is better
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
        .join(" -> ");

    return `A Grade 8 student just completed a climate policy simulation.

Location: ${location.name}
Issue: ${headline.title}
Final score: ${finalScore}/100
Their decisions: ${decisionSummary}

Write a single sentence verdict (max 20 words) summarizing their performance.
Be encouraging but honest. Use simple language.

Return ONLY the verdict sentence, no JSON, no quotes, no explanation.`;
}
