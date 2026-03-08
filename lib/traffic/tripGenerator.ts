import * as turf from '@turf/turf';
import type { RoadFeature, Trip, TrafficConfig, RoadClass } from './types';
import { getColorForTrip } from './colorSchemes';

const MAX_TRIPS = 800;

const BASE_SPEEDS: Record<RoadClass, number> = {
  motorway: 100,
  trunk: 80,
  primary: 60,
  secondary: 50,
  tertiary: 40,
  street: 30,
  path: 15,
};

const DENSITY_MULTIPLIERS: Record<RoadClass, number> = {
  motorway: 4,
  trunk: 3,
  primary: 3,
  secondary: 2,
  tertiary: 1,
  street: 1,
  path: 0.5,
};

export function generateTrips(
  roads: RoadFeature[],
  config: TrafficConfig
): Trip[] {
  const trips: Trip[] = [];
  let tripIndex = 0;

  for (const road of roads) {
    if (road.coordinates.length < 2) continue;

    const multiplier = DENSITY_MULTIPLIERS[road.roadClass] ?? 1;
    const count = Math.max(
      1,
      Math.round(multiplier * config.density * 3)
    );

    for (let i = 0; i < count; i++) {
      trips.push(buildTrip(road, 1, tripIndex, tripIndex++, config));

      if (!road.oneWay) {
        trips.push(buildTrip(road, -1, tripIndex, tripIndex++, config));
      }
    }
  }

  // Cap at MAX_TRIPS via random subsample
  let sampled = trips;
  if (sampled.length > MAX_TRIPS) {
    sampled = subsample(sampled, MAX_TRIPS);
  }

  // Create seamless loop by duplicating trips shifted by loopDuration
  const seamless: Trip[] = [];
  for (const t of sampled) {
    seamless.push(t);
    // Wrap-around copy ensures lines crossing the loop boundary seamlessly continue at currentTime = 0
    seamless.push({
      ...t,
      id: `${t.id}-wrap`,
      timestamps: t.timestamps.map((ts) => ts - config.loopDurationMs),
    });
  }

  return seamless;
}

const SUBSAMPLE_BOOST: Record<RoadClass, number> = {
  motorway: 20,
  trunk: 15,
  primary: 10,
  secondary: 5,
  tertiary: 2,
  street: 1,
  path: 1,
};

function subsample(trips: Trip[], max: number): Trip[] {
  const scored = trips.map((t) => ({
    trip: t,
    score: Math.random() * (SUBSAMPLE_BOOST[t.roadClass] ?? 1),
  }));
  
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, max).map((s) => s.trip);
}

function buildTrip(
  road: RoadFeature,
  direction: 1 | -1,
  spawnIndex: number,
  globalIndex: number,
  config: TrafficConfig
): Trip {
  const coords =
    direction === 1
      ? road.coordinates
      : [...road.coordinates].reverse();

  const speed = BASE_SPEEDS[road.roadClass];
  const timestamps = buildTimestamps(
    coords,
    speed,
    spawnIndex,
    config.loopDurationMs
  );

  return {
    id: `trip-${globalIndex}`,
    waypoints: coords,
    timestamps,
    roadClass: road.roadClass,
    direction,
    color: getColorForTrip(
      road.roadClass,
      config.colorScheme,
      globalIndex
    ),
    speed,
  };
}

function buildTimestamps(
  coords: [number, number][],
  speedKmh: number,
  spawnIndex: number,
  loopMs: number
): number[] {
  // Build raw segment durations from real distances
  const rawDeltas: number[] = [];
  for (let i = 1; i < coords.length; i++) {
    const distKm = turf.distance(
      turf.point(coords[i - 1]),
      turf.point(coords[i]),
      { units: 'kilometers' }
    );
    rawDeltas.push(
      Math.max((distKm / speedKmh) * 3_600_000, 50)
    );
  }

  const rawTotal = rawDeltas.reduce(
    (a, b) => a + b,
    0
  );

  // Only scale down if the route takes too long; let short routes end quickly
  const maxTravelMs = loopMs * 0.85;
  const scale = rawTotal > maxTravelMs ? maxTravelMs / rawTotal : 1;

  // Stagger start using global index, allowing spawn anywhere in the loop
  const startOffset =
    (((spawnIndex * 1733) % 100) / 100) * loopMs;

  // Build monotonically increasing timestamps
  let elapsed = startOffset;
  const timestamps = [elapsed];

  for (const delta of rawDeltas) {
    elapsed += delta * scale;
    timestamps.push(elapsed);
  }

  return timestamps;
}
