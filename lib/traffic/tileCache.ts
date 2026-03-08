import type { RoadFeature, TileKey, Trip } from './types';

interface CacheEntry {
  tileKey: TileKey;
  roads: RoadFeature[];
  trips: Trip[];
  generatedAt: number;
}

const TTL_MS = 30_000;

let cache: CacheEntry | null = null;

export function getCached(key: TileKey): CacheEntry | null {
  if (!cache) return null;
  if (Date.now() - cache.generatedAt > TTL_MS) return null;
  if (cache.tileKey !== key) return null;
  return cache;
}

export function setCache(
  key: TileKey,
  roads: RoadFeature[],
  trips: Trip[]
): void {
  cache = { tileKey: key, roads, trips, generatedAt: Date.now() };
}

export function invalidateCache(): void {
  cache = null;
}
