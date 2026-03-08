export type RoadClass =
  | 'motorway'
  | 'trunk'
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'street'
  | 'path';

export interface RoadFeature {
  id: string;
  coordinates: [number, number][];
  roadClass: RoadClass;
  oneWay: boolean;
  name?: string;
}

export interface Trip {
  id: string;
  waypoints: [number, number][];
  timestamps: number[];
  roadClass: RoadClass;
  direction: 1 | -1;
  color: [number, number, number];
  speed: number;
}

export interface TrafficConfig {
  density: number;
  speedMultiplier: number;
  trailLength: number;
  colorScheme: TrafficColorScheme;
  roadClasses: RoadClass[];
  loopDurationMs: number;
  globalWidth: number;
}

export type TrafficColorScheme =
  | 'neon-blue'
  | 'neon-green'
  | 'neon-pink'
  | 'neon-orange'
  | 'neon-purple'
  | 'neon-yellow';

export type TileKey = string;

export interface TrafficState {
  trips: Trip[];
  currentTime: number;
  isPlaying: boolean;
  config: TrafficConfig;
  roadCount: number;
  tripCount: number;
  tileKey: TileKey | null;
}
