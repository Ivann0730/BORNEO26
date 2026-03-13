
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
  // Initial conditions when the scenario drops
  initialEcology: number;
  initialEconomy: number;
  initialSociety: number; // Represents average starting public trust
  hints: string[];
  cameraTarget: CameraTarget;
  /** Available zone IDs from the zone registry for this location */
  availableZoneIds?: string[];
}

/* ─────────────────── Map Instruction ─────────────────────── */
export interface MapInstruction {
  type: "add_layer" | "remove_layer" | "fly_to" | "animate_camera";
  layerType?: "heatmap" | "polygon" | "point" | "arc" | "icon" | "particles";
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
  delta?: number;
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
  /** Zone IDs from the zone registry that this sector impact applies to */
  zoneIds?: string[];
  cameraTarget?: CameraTarget;
  mapInstructions: MapInstruction[];
}

/* ─────────────────── Decision Result ─────────────────────── */
export interface DecisionResult {
  round: number;
  userInput: string;
  interpretation: string;
  /** AI's justification for the changes */
  justification: string;
  /** Impact on ecology (0-100 scale shift) */
  ecologyDelta: number;
  /** The running total of the ecology score after this decision */
  newEcology: number;
  /** Impact on economy (0-100 scale shift) */
  economyDelta: number;
  /** The running total of the economy score after this decision */
  newEconomy: number;
  /** Impact on society (0-100 scale shift), calculated from sector averages */
  societyDelta?: number;
  /** The running total of the society score after this decision */
  newSociety?: number;
  /** Impact on specific sector stakeholders */
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
  finalEcology: number;
  finalEconomy: number;
  finalSociety: number;
  decisions: DecisionResult[];
  verdict: string;
  postMortem?: string;
  createdAt: string;
  sectorStakeholders?: SectorStakeholder[];
  predictionRanking?: string[];
  predictionRisk?: string[];
  predictionEvaluation?: PredictionEvaluation;
}

export interface PeerReport {
  headline_id: string;
  final_ecology: number;
  final_economy: number;
  final_society: number;
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
