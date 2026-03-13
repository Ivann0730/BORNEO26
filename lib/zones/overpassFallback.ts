import "server-only";
import type { ZoneEntry } from "./types";
import { OSM_LANDUSE_TO_SECTOR } from "./types";

/**
 * In-memory cache: location key → zones.
 * Keys are rounded to 3 decimal places (~111m) to group nearby queries.
 */
const zoneCache = new Map<string, ZoneEntry[]>();

function cacheKey(lat: number, lng: number): string {
    return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

/** Compute centroid of a polygon ring */
function centroid(ring: number[][]): [number, number] {
    let cx = 0, cy = 0;
    for (const [x, y] of ring) { cx += x; cy += y; }
    return [+(cx / ring.length).toFixed(6), +(cy / ring.length).toFixed(6)];
}

/** Compute shoelace area for filtering tiny polygons */
function ringArea(ring: number[][]): number {
    let area = 0;
    for (let i = 0; i < ring.length - 1; i++) {
        area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
    }
    return Math.abs(area / 2);
}

interface OverpassElement {
    type: string;
    id: number;
    tags?: Record<string, string>;
    nodes?: number[];
    lat?: number;
    lon?: number;
}

/**
 * Query the Overpass API for landuse polygons near a coordinate.
 * Returns ZoneEntry[] in the same shape as predefined zones.
 */
export async function fetchZonesFromOverpass(
    lat: number,
    lng: number,
    radiusMeters = 2000
): Promise<ZoneEntry[]> {
    const key = cacheKey(lat, lng);
    const cached = zoneCache.get(key);
    if (cached) return cached;

    const query = `[out:json][timeout:25];
(
  way["landuse"](around:${radiusMeters},${lat},${lng});
  relation["landuse"](around:${radiusMeters},${lat},${lng});
);
out body;
>;
out skel qt;`;

    try {
        const res = await fetch(
            `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
            { signal: AbortSignal.timeout(30_000) }
        );

        if (!res.ok) {
            console.error(`Overpass API error: ${res.status}`);
            return [];
        }

        const data = await res.json();
        const elements: OverpassElement[] = data.elements;

        // Build node lookup for resolving way geometries
        const nodes = new Map<number, [number, number]>();
        for (const el of elements) {
            if (el.type === "node" && el.lon != null && el.lat != null) {
                nodes.set(el.id, [el.lon, el.lat]);
            }
        }

        const counters: Record<string, number> = {};
        const zones: ZoneEntry[] = [];

        for (const el of elements) {
            if (el.type !== "way" || !el.tags?.landuse || !el.nodes) continue;

            const sectorType = OSM_LANDUSE_TO_SECTOR[el.tags.landuse];
            if (!sectorType) continue;

            const ring = el.nodes
                .map((nid) => nodes.get(nid))
                .filter((c): c is [number, number] => c != null);

            if (ring.length < 4) continue;

            // Filter very small polygons
            if (ringArea(ring) < 0.0000005) continue;

            // Close the ring if needed
            const first = ring[0];
            const last = ring[ring.length - 1];
            if (first[0] !== last[0] || first[1] !== last[1]) {
                ring.push([...first] as [number, number]);
            }

            // Round coordinates
            const coords = ring.map(([x, y]) => [+x.toFixed(6), +y.toFixed(6)]);

            const prefix = sectorType.toLowerCase().replace(/\s+/g, "-");
            counters[prefix] = (counters[prefix] || 0) + 1;
            const id = `osm-${prefix}-${counters[prefix]}`;

            const name = el.tags.name || "";

            zones.push({
                id,
                sectorType,
                name,
                centroid: centroid(coords),
                polygon: {
                    type: "Feature" as const,
                    geometry: { type: "Polygon" as const, coordinates: [coords] },
                    properties: { label: name || sectorType },
                },
            });
        }

        // Sort by area (largest first) so the prompt lists the most significant zones first
        zones.sort((a, b) => {
            const aArea = ringArea(a.polygon.geometry.coordinates[0] as number[][]);
            const bArea = ringArea(b.polygon.geometry.coordinates[0] as number[][]);
            return bArea - aArea;
        });

        zoneCache.set(key, zones);
        return zones;
    } catch (error) {
        console.error("Overpass fallback error:", error);
        return [];
    }
}
