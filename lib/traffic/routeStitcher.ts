import * as turf from '@turf/turf';
import type { RoadFeature } from './types';

const SNAP_THRESHOLD_M = 25;

export function stitchRoads(
  roads: RoadFeature[],
  maxChainLength = 30
): RoadFeature[] {
  if (roads.length < 10) return roads;

  const adjacency = buildAdjacency(roads);
  const stitched: RoadFeature[] = [];
  const used = new Set<string>();

  for (const road of roads) {
    if (used.has(road.id)) continue;

    const chain = [road];
    used.add(road.id);
    let current = road;

    for (let step = 0; step < maxChainLength; step++) {
      const endPt =
        current.coordinates[current.coordinates.length - 1];
      const neighbors = adjacency.get(current.id) ?? [];
      const next = neighbors.find((n) => !used.has(n.id));
      if (!next) break;

      const dist = turf.distance(
        turf.point(endPt),
        turf.point(next.coordinates[0]),
        { units: 'meters' }
      );
      if (dist > SNAP_THRESHOLD_M) break;

      chain.push(next);
      used.add(next.id);
      current = next;
    }

    stitched.push(
      chain.length === 1 ? road : mergeChain(chain)
    );
  }

  return stitched;
}

function mergeChain(chain: RoadFeature[]): RoadFeature {
  const coords = chain.flatMap((road, i) =>
    i === 0 ? road.coordinates : road.coordinates.slice(1)
  ) as [number, number][];

  return {
    id: `stitched-${chain.map((r) => r.id).join('-')}`,
    coordinates: coords,
    roadClass: chain[0].roadClass,
    oneWay: chain[0].oneWay,
    name: chain[0].name,
  };
}

function buildAdjacency(
  roads: RoadFeature[]
): Map<string, RoadFeature[]> {
  const map = new Map<string, RoadFeature[]>();

  for (const road of roads) {
    const neighbors: RoadFeature[] = [];
    const endPt =
      road.coordinates[road.coordinates.length - 1];

    for (const other of roads) {
      if (other.id === road.id) continue;
      const startPt = other.coordinates[0];
      const dist = turf.distance(
        turf.point(endPt),
        turf.point(startPt),
        { units: 'meters' }
      );
      if (dist <= SNAP_THRESHOLD_M) neighbors.push(other);
    }

    map.set(road.id, neighbors);
  }

  return map;
}
