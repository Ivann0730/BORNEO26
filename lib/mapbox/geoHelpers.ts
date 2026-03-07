export function createPointFeature(
    lng: number,
    lat: number,
    properties: Record<string, unknown> = {}
): GeoJSON.Feature {
    return {
        type: "Feature",
        geometry: { type: "Point", coordinates: [lng, lat] },
        properties,
    };
}

export function createBBoxFromCenter(
    lng: number,
    lat: number,
    radiusDeg = 0.05
): [number, number, number, number] {
    return [
        lng - radiusDeg,
        lat - radiusDeg,
        lng + radiusDeg,
        lat + radiusDeg,
    ];
}

export function isValidCoordinate(lng: number, lat: number): boolean {
    return (
        typeof lng === "number" &&
        typeof lat === "number" &&
        lng >= -180 &&
        lng <= 180 &&
        lat >= -90 &&
        lat <= 90
    );
}

export function getBoundsFromFeature(
    feature: GeoJSON.Feature
): [[number, number], [number, number]] | null {
    const coords: number[][] = [];

    function extractCoords(geometry: GeoJSON.Geometry) {
        if (geometry.type === "Point") {
            coords.push(geometry.coordinates);
        } else if (geometry.type === "Polygon") {
            geometry.coordinates[0].forEach((c) => coords.push(c));
        } else if (geometry.type === "MultiPolygon") {
            geometry.coordinates.forEach((poly) =>
                poly[0].forEach((c) => coords.push(c))
            );
        }
    }

    extractCoords(feature.geometry);
    if (coords.length === 0) return null;

    let minLng = Infinity, minLat = Infinity;
    let maxLng = -Infinity, maxLat = -Infinity;

    for (const c of coords) {
        minLng = Math.min(minLng, c[0]);
        minLat = Math.min(minLat, c[1]);
        maxLng = Math.max(maxLng, c[0]);
        maxLat = Math.max(maxLat, c[1]);
    }

    return [[minLng, minLat], [maxLng, maxLat]];
}
