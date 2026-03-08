/** Maximum number of decision rounds per simulation */
export const MAX_DECISIONS = 5;

/** Initial satisfaction score for affected communities */
export const INITIAL_SATISFACTION = 50;

/** If satisfaction drops to or below this, simulation fails early */
export const FAILSTATE_THRESHOLD = 15;

/** ASEAN bounding box [west, south, east, north] */
export const ASEAN_BBOX = [92.2, -11.0, 141.0, 28.5] as const;
