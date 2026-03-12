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
  previousEcology: number,
  previousEconomy: number,
  sectorApprovalsList: string,
  history: DecisionResult[],
  zonesSummary?: string
): string {
  const zonesBlock = zonesSummary
    ? `\nAVAILABLE ZONES (select from these by ID for affected sectors):\n${zonesSummary}\n`
    : "";

  return `You are a climate policy simulator for Grade 6-10 students in ASEAN.

Scenario: ${scenario.context}
Location: ${scenario.location.name}
Current Simulation State:
- Round: ${round} of ${MAX_DECISIONS}
- Ecology: ${previousEcology}/100
- Economy: ${previousEconomy}/100
- Sector Approvals: ${sectorApprovalsList}
${zonesBlock}
Decision history: ${JSON.stringify(history.map((h) => h.interpretation))}

The student just said: "${decisionText}"

Interpret their decision and return ONLY a valid JSON object:
{
  "round": ${round},
  "userInput": "${decisionText}",
  "interpretation": "1 sentence describing the decision in second person, addressing the student directly (e.g. 'You decided to...' or 'You proposed...'). Never use third person like 'The student'.",
  "justification": "1-2 sentences explaining why this decision impacts the city the way it does.",
  "ecologyDelta": (integer between -30 and +30. Environmental impact),
  "newEcology": (previousEcology + ecologyDelta, clamped 0-100),
  "economyDelta": (integer between -30 and +30. Economic/business impact),
  "newEconomy": (previousEconomy + economyDelta, clamped 0-100),
  "affectedSectors": [
    {
      "sector": "one of: Residential, Commercial, Industrial, Institutional, Business District, Mixed Use, Open Space",
      "explanation": "2-3 sentences explaining how this specific sector is affected.",
      "trustDelta": (integer between -20 and +20 representing change in trust for this specific sector),
      "zoneIds": ["zone-id-1", "zone-id-2"],
      "cameraTarget": {
        "center": [${scenario.location.lng}, ${scenario.location.lat}],
        "zoom": 17,
        "pitch": 55,
        "bearing": 20
      },
      "mapInstructions": []
    }
  ],
  "mapInstructions": [],
  "explanation": "2-3 sentences overall summary at Grade 7-8 reading level. Honest about tradeoffs.",
  "climateTerms": [
    { "term": "term used in explanation", "definition": "simple definition for a 13-year-old" }
  ],
  "alternativeDecision": "1 sentence nudging the student to think about a different direction they could have taken without explicitly giving them the exact answer",
  "alternativeMapInstructions": []
}

Rules:
- SCORING RULES: Calibrate your deltas to the current state! If Economy is already low (30/100), a -20 delta means utter devastation.
- Maximum magnitude for a single delta (ecologyDelta, economyDelta, trustDelta) is +/- 15 unless the decision is a monumental, city-altering structural reform.
- Standard, incremental policies should have deltas between +/- 3 to 8.
- You MUST NOT output a societyDelta. You ONLY output trustDelta for specific sectors.
- Provide 1-3 affectedSectors showing the specific impact on different city zones.
- CRITICAL: For each affectedSector, you MUST select 1-3 zone IDs from the AVAILABLE ZONES list above. Use the "zoneIds" field. The server will resolve these to real map polygons.
- If no AVAILABLE ZONES are listed, leave "zoneIds" as an empty array.
- Set "mapInstructions" to an empty array [] in both affectedSectors and the top-level object. The server will generate map layers from the zone IDs.
- The cameraTarget in affectedSectors should zoom in closely to the affected area. Use the coordinates from the AVAILABLE ZONES if possible (they represent real locations).
- Decisions are morally complex: every choice has real tradeoffs across Ecology, Economy, and Society (Sector trust).
- Do not reward or punish obviously: ambiguous is better.
- Write at Grade 7-8 reading level, engaging not scary.
- Return ONLY JSON, no explanation, no markdown.`;
}

export function buildVerdictPrompt(
  location: Location,
  headline: ClimateHeadline,
  finalEcology: number,
  finalEconomy: number,
  finalSociety: number,
  decisions: DecisionResult[]
): string {
  const decisionSummary = decisions
    .map((d) => d.interpretation)
    .join(" → ");

  return `A Grade 8 student just completed a climate policy simulation.

Location: ${location.name}
Issue: ${headline.title}
Final TBL Scores - Ecology: ${finalEcology}/100, Economy: ${finalEconomy}/100, Society: ${finalSociety}/100
Their decisions: ${decisionSummary}

Write a single sentence verdict (max 20 words) summarizing their performance. Be encouraging but honest. Use simple language.
Then, write a "post-mortem" reflection (What could you have done differently?). This should be a cohesive, 3-4 sentence paragraph that looks back at their entire decision path and gently suggests a better approach or highlights a critical missed opportunity. Frame it as a post-mortem reflection rather than mid-path second-guessing.

Return ONLY a valid JSON object matching this exact structure:
{
  "verdict": "Your 20-word summarized verdict",
  "postMortem": "Your 3-4 sentence post-mortem paragraph"
}

Return ONLY JSON, no explanation, no markdown.`;
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

export function buildDecisionEvaluationPrompt(
  scenarioContext: string,
  decisionText: string
): string {
  return `You are an educational evaluator for an interactive climate policy simulation for Grade 8 students.
Before simulating a user's decision, you must evaluate if their input is sensible, relevant to the scenario, and demonstrates critical thinking.

Scenario Context: ${scenarioContext}
User's Decision: "${decisionText}"

Evaluate the decision and return ONLY a valid JSON object matching this structure:
{
  "status": "accepted" | "rejected" | "needs_more_info",
  "justification": "A short, encouraging explanation of why their decision was accepted, rejected, or needs more info.",
  "hint": "If rejected or needs more info, provide a helpful hint to guide them. If accepted, this can be an empty string."
}

Rules for status "rejected":
- The decision is completely vague or nonsensical (e.g., "idk", "asdfasdf", "do nothing", "i don't care").
- The decision is malicious, violent, or wildly inappropriate.
- The decision has absolutely nothing to do with the climate scenario or city management.

Rules for status "needs_more_info":
- The decision is sensible and well-intentioned, but too vague to simulate (e.g., "help the people", "stop climate change", "fix the water").
- When using this status, the "hint" MUST ask the student for specific policy actions or methods to achieve their goal.

Rules for status "accepted":
- The decision attempts to address the scenario with a specific action or policy, even if it's not the "best" choice. Allow for creative or unconventional approaches as long as they show specific thought.
- The decision is a valid policy or action (e.g., "build a seawall", "educate people about recycling", "tax carbon emissions").

Ensure "justification" and "hint" are written at a Grade 7-8 reading level.
Return ONLY JSON, no explanation, no markdown.`;
}

export function buildStakeholderReactPrompt(
  sectorId: string,
  personaName: string,
  personaRole: string,
  decision: string,
  sectorOutcome: string,
  currentApproval: number
): string {
  return `You are simulating a real person affected by climate policy.
Your name is ${personaName} and your role is ${personaRole} in the ${sectorId} sector.

The city just made this decision:
"${decision}"

Here is how your sector was affected:
"${sectorOutcome}"

Your current approval rating of the city's policies is ${currentApproval}/100.

Return ONLY a valid JSON object:
{
  "quote": "A specific, emotionally grounded quote between 15-30 words. Avoid generic statements. Reference a concrete impact (e.g. 'My irrigation costs just doubled' not 'This will hurt farmers'). Speak from the first person.",
  "approvalDelta": (integer between -25 and +25 based on how the decision affected you)
}

Rules:
- Be authentic and realistic to your role.
- If the outcome is good for your sector, express relief or optimism, and approvalDelta should be positive.
- If the outcome is bad, express frustration, fear, or anger, and approvalDelta should be negative.
- The magnitude of approvalDelta should match the severity of the outcome.
- Return ONLY JSON, no explanation, no markdown.`;
}

export function buildPredictionEvaluationPrompt(
  scenarioContext: string,
  predictedSectors: string[],
  predictedRisk: string
): string {
  return `You are an educational evaluator for a climate policy simulation.
Based on the following scenario, determine the actual top 3 city sectors most likely to be impacted if no action is taken.
Then, evaluate the user's prediction of the impacted sectors and their stated risk.

Scenario Context: ${scenarioContext}
User's Predicted Sectors: ${predictedSectors.join(", ")}
User's Predicted Risk: "${predictedRisk}"

Return ONLY a valid JSON object matching this structure:
{
  "actualTop3": [
    { "sector": "sector name", "explanation": "1 short sentence explaining why" }
  ],
  "score": (integer 0-100 evaluating the user's predictions),
  "feedback": "A short, encouraging 2-3 sentence feedback explaining why their prediction was accurate or what they missed."
}

Rules:
- actualTop3 MUST be exactly 3 unique sectors chosen from: Residential, Commercial, Industrial, Institutional, Business District, Mixed Use, Open Space.
- The score should be based on how well their predicted sectors match your actualTop3, and how insightful their predicted risk is.
- Provide constructive feedback written at a Grade 7-8 reading level.
- Return ONLY JSON, no explanation, no markdown.`;
}
