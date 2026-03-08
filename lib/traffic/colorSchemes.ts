import type { RoadClass, TrafficColorScheme, TrafficConfig } from './types';

const NEON_BLUE: Record<RoadClass, [number, number, number]> = {
  motorway: [0, 200, 255],
  trunk: [0, 180, 240],
  primary: [30, 160, 255],
  secondary: [60, 140, 230],
  tertiary: [80, 120, 200],
  street: [100, 110, 180],
  path: [120, 100, 160],
};

const NEON_GREEN: Record<RoadClass, [number, number, number]> = {
  motorway: [0, 255, 100],
  trunk: [0, 240, 80],
  primary: [30, 255, 60],
  secondary: [60, 230, 40],
  tertiary: [80, 200, 20],
  street: [100, 180, 0],
  path: [120, 160, 0],
};

const NEON_PINK: Record<RoadClass, [number, number, number]> = {
  motorway: [255, 0, 150],
  trunk: [240, 20, 130],
  primary: [255, 30, 200],
  secondary: [230, 40, 180],
  tertiary: [200, 50, 160],
  street: [180, 60, 140],
  path: [160, 70, 120],
};

const NEON_ORANGE: Record<RoadClass, [number, number, number]> = {
  motorway: [255, 100, 0],
  trunk: [240, 90, 0],
  primary: [255, 130, 20],
  secondary: [230, 120, 30],
  tertiary: [200, 110, 40],
  street: [180, 100, 50],
  path: [160, 90, 60],
};

const NEON_PURPLE: Record<RoadClass, [number, number, number]> = {
  motorway: [150, 0, 255],
  trunk: [140, 20, 240],
  primary: [180, 30, 255],
  secondary: [160, 40, 230],
  tertiary: [140, 50, 200],
  street: [120, 60, 180],
  path: [100, 70, 160],
};

const NEON_YELLOW: Record<RoadClass, [number, number, number]> = {
  motorway: [255, 255, 0],
  trunk: [240, 240, 0],
  primary: [255, 255, 50],
  secondary: [230, 230, 60],
  tertiary: [200, 200, 80],
  street: [180, 180, 100],
  path: [160, 160, 120],
};

export function getColorForTrip(
  roadClass: RoadClass,
  scheme: TrafficColorScheme,
  _index: number
): [number, number, number] {
  switch (scheme) {
    case 'neon-green':
      return NEON_GREEN[roadClass];
    case 'neon-pink':
      return NEON_PINK[roadClass];
    case 'neon-orange':
      return NEON_ORANGE[roadClass];
    case 'neon-purple':
      return NEON_PURPLE[roadClass];
    case 'neon-yellow':
      return NEON_YELLOW[roadClass];
    case 'neon-blue':
    default:
      return NEON_BLUE[roadClass];
  }
}

/** Color palette lookup for legend display */
export function getSchemeColors(
  scheme: TrafficColorScheme
): Record<RoadClass, [number, number, number]> {
  switch (scheme) {
    case 'neon-green':
      return NEON_GREEN;
    case 'neon-blue':
    default:
      return NEON_BLUE;
  }
}

export const DEFAULT_CONFIG: TrafficConfig = {
  density: 0.6,
  speedMultiplier: 0.5,
  trailLength: 800,
  colorScheme: 'neon-green',
  roadClasses: ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'street'],
  loopDurationMs: 8000,
  globalWidth: 4,
};
