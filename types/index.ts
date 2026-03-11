
/* ──────────────────────── Location ──────────────────────── */
export interface Location {
  name: string;
  lat: number;
  lng: number;
  country: string;
  region: string;
}

/* ──────────────────── Climate Headline ──────────────────── */
export interface ClimateHeadline {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
  locationTag: string;
  resolvedLat?: number;
  resolvedLng?: number;
}

/* ──────────────────── Camera Target ──────────────────────── */
export interface CameraTarget {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
}

/* ────────────────────── Scenario ─────────────────────────── */
export interface Scenario {
  id: string;
  headline: ClimateHeadline;
  location: Location;
  context: string;
  affectedArea: GeoJSON.Feature;
  initialScore: number;
  hints: string[];
  cameraTarget: CameraTarget;
}

/* ─────────────────── Map Instruction ─────────────────────── */
export interface MapInstruction {
  type: "add_layer" | "remove_layer" | "fly_to" | "animate_camera";
  layerType?: "heatmap" | "polygon" | "point" | "arc" | "icon";
  layerId?: string;
  geoJson?: GeoJSON.Feature | GeoJSON.FeatureCollection;
  color?: string;
  intensity?: number;
  label?: string;
  coordinates?: [number, number];
  zoom?: number;
  bearing?: number;
  pitch?: number;
  durationMs?: number;
}

/* ─────────────────── Climate Term ────────────────────────── */
export interface ClimateTerm {
  term: string;
  definition: string;
}

/* ────────────────── Sector Stakeholder ───────────────────── */
export interface SectorStakeholder {
  sectorId: string;
  name: string;
  role: string;
  avatarEmoji: string;
  initialApproval: number;
  approval: number;
  quotes?: string[];
}

/* ─────────────────── Affected Sector ───────────────────── */
export interface AffectedSector {
  sector: "Residential" | "Commercial" | "Industrial" | "Institutional" | "Business District" | "Mixed Use" | "Open Space";
  explanation: string;
  trustDelta: number;
  cameraTarget?: CameraTarget;
  mapInstructions: MapInstruction[];
}

/* ─────────────────── Decision Result ─────────────────────── */
export interface DecisionResult {
  round: number;
  userInput: string;
  interpretation: string;
  scoreDelta: number;
  newScore: number;
  satisfactionDelta: number;
  newSatisfaction: number;
  affectedSectors: AffectedSector[];
  mapInstructions: MapInstruction[];
  explanation: string;
  climateTerms: ClimateTerm[];
  alternativeDecision: string;
  alternativeMapInstructions: MapInstruction[];
}

/* ───────────────── Decision Evaluation ─────────────────── */
export interface DecisionEvaluation {
  status: "accepted" | "rejected" | "needs_more_info";
  justification: string;
  hint: string;
}

/* ───────────────── Prediction Evaluation ───────────────── */
export interface PredictionEvaluation {
  actualTop3: { sector: string; explanation: string }[];
  score: number;
  feedback: string;
}

/* ─────────────────── Report Session ──────────────────────── */
export interface ReportSession {
  slug: string;
  userName: string;
  location: Location;
  headline: ClimateHeadline;
  finalScore: number;
  decisions: DecisionResult[];
  verdict: string;
  createdAt: string;
  sectorStakeholders?: SectorStakeholder[];
  predictionRanking?: string[];
  predictionRisk?: string[];
  predictionEvaluation?: PredictionEvaluation;
}

export interface PeerReport {
  headline_id: string;
  final_score: number;
  final_satisfaction: number;
  decision_count: number;
  decisions_summary: string[];
}

/* ──────────────── Simulation Step ─────────────────────────── */
export type SimulationStep =
  | "location"
  | "headline"
  | "scenario"
  | "decision"
  | "complete";
