import type { Feature, Polygon } from "geojson";

export type SectorType =
    | "Residential"
    | "Commercial"
    | "Industrial"
    | "Institutional"
    | "Business District"
    | "Mixed Use"
    | "Open Space";

export interface ZoneEntry {
    /** Unique identifier, e.g. "cebu-residential-1" */
    id: string;
    /** Which sector type this zone belongs to */
    sectorType: SectorType;
    /** Human-readable name (may be empty for unnamed areas) */
    name: string;
    /** [lng, lat] centroid for camera targeting */
    centroid: [number, number];
    /** GeoJSON polygon for rendering on the map */
    polygon: Feature<Polygon>;
}

export interface ZoneRegistry {
    /** Center coordinates of this registry area */
    center: { lat: number; lng: number };
    /** Approximate radius in km covered by this registry */
    radiusKm: number;
    /** All zones in this registry */
    zones: ZoneEntry[];
}

/**
 * Maps OSM `landuse` tag values to our sector types.
 * Used by both predefined data generation and runtime Overpass queries.
 */
export const OSM_LANDUSE_TO_SECTOR: Record<string, SectorType> = {
    residential: "Residential",
    commercial: "Commercial",
    retail: "Commercial",
    industrial: "Industrial",
    construction: "Industrial",
    brownfield: "Industrial",
    religious: "Institutional",
    cemetery: "Institutional",
    education: "Institutional",
    institutional: "Institutional",
    greenfield: "Mixed Use",
    garages: "Mixed Use",
    grass: "Open Space",
    forest: "Open Space",
    farmland: "Open Space",
    salt_pond: "Open Space",
    meadow: "Open Space",
    recreation_ground: "Open Space",
    park: "Open Space",
    orchard: "Open Space",
    vineyard: "Open Space",
    allotments: "Open Space",
};
