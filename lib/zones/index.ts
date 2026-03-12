import "server-only";
import type { ZoneEntry, SectorType } from "./types";
import { CEBU_CITY_ZONES, CEBU_CITY_CENTER, CEBU_CITY_RADIUS_KM } from "./cebuCity";
import { fetchZonesFromOverpass } from "./overpassFallback";

/** Haversine distance in km */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * All predefined registries. Add more cities here as they're authored.
 */
const PREDEFINED_REGISTRIES = [
    { center: CEBU_CITY_CENTER, radiusKm: CEBU_CITY_RADIUS_KM, zones: CEBU_CITY_ZONES },
];

/**
 * Get zones for the given coordinates.
 * Checks predefined registries first, falls back to Overpass API.
 */
export async function getZonesForLocation(
    lat: number,
    lng: number
): Promise<ZoneEntry[]> {
    // Check predefined registries
    for (const reg of PREDEFINED_REGISTRIES) {
        const dist = haversineKm(lat, lng, reg.center.lat, reg.center.lng);
        if (dist <= reg.radiusKm * 1.5) {
            return reg.zones;
        }
    }

    // Fallback to Overpass API
    console.log(`[zones] No predefined registry for (${lat}, ${lng}), querying Overpass…`);
    return fetchZonesFromOverpass(lat, lng);
}

/** Look up a single zone by its ID from all known sources. */
export function getZoneById(id: string, zones: ZoneEntry[]): ZoneEntry | undefined {
    return zones.find((z) => z.id === id);
}

/** Get zones filtered by sector type. */
export function getZonesBySector(
    zones: ZoneEntry[],
    sectorType: SectorType
): ZoneEntry[] {
    return zones.filter((z) => z.sectorType === sectorType);
}

/**
 * Build a compact summary of available zones for injection into LLM prompts.
 * Format: "ID | SectorType | Name" — one per line.
 */
export function buildZoneSummaryForPrompt(zones: ZoneEntry[]): string {
    // Group by sector type and pick the most significant zones per type
    const bySector = new Map<string, ZoneEntry[]>();
    for (const z of zones) {
        const list = bySector.get(z.sectorType) || [];
        list.push(z);
        bySector.set(z.sectorType, list);
    }

    const lines: string[] = [];
    for (const [sectorType, sectorZones] of bySector) {
        // Take top 5 per sector to keep the prompt manageable
        const top = sectorZones.slice(0, 5);
        for (const z of top) {
            const label = z.name ? `${z.name}` : `unnamed ${sectorType.toLowerCase()} area`;
            lines.push(`${z.id} | ${sectorType} | ${label}`);
        }
    }

    return lines.join("\n");
}

export type { ZoneEntry, SectorType } from "./types";
