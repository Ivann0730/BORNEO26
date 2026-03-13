import type { CameraTarget } from "@/types";
import mapboxgl from "mapbox-gl";

/* ────────── Basic Camera ────────── */

export function flyToLocation(
    map: mapboxgl.Map,
    target: CameraTarget,
    duration = 3000
): void {
    map.flyTo({
        center: target.center,
        zoom: target.zoom,
        pitch: target.pitch,
        bearing: target.bearing,
        duration,
        essential: true,
    });
}

export function flyToCoordinates(
    map: mapboxgl.Map,
    lng: number,
    lat: number,
    zoom = 12
): void {
    map.flyTo({
        center: [lng, lat],
        zoom,
        pitch: 0,
        bearing: 0,
        duration: 2000,
        essential: true,
    });
}

/* ────────── B-Roll Animation ────────── */

let brollAnimationId: number | null = null;
let brollMoveEndHandler: (() => void) | null = null;
let brollMap: mapboxgl.Map | null = null;

const BROLL_SEGMENT_DEGREES = 15; // Degrees per segment
const BROLL_SEGMENT_DURATION = 10000; // 10 seconds per segment — smooth and slow

export function startBrollAnimation(
    map: mapboxgl.Map,
    centerLng: number,
    centerLat: number,
    zoom: number = 16.5,
    pitch: number = 75
): void {
    stopBrollAnimation();
    brollMap = map;

    function rotateSegment() {
        if (!brollMap) return;
        const currentBearing = brollMap.getBearing();
        brollMap.easeTo({
            bearing: currentBearing + BROLL_SEGMENT_DEGREES,
            duration: BROLL_SEGMENT_DURATION,
            easing: (t) => t, // Linear — constant angular velocity
        });
    }

    // Chain segments: when one finishes, start the next
    brollMoveEndHandler = () => rotateSegment();
    map.on("moveend", brollMoveEndHandler);

    map.flyTo({
        center: [centerLng, centerLat],
        zoom,
        pitch,
        bearing: map.getBearing(),
        duration: 2500,
        essential: true,
    });

    // Start the first rotation segment after the initial flyTo completes
    map.once("moveend", () => {
        rotateSegment();
    });
}

export function stopBrollAnimation(): void {
    if (brollAnimationId !== null) {
        cancelAnimationFrame(brollAnimationId);
        brollAnimationId = null;
    }
    if (brollMap && brollMoveEndHandler) {
        brollMap.off("moveend", brollMoveEndHandler);
        brollMap.stop(); // Stop any in-progress easeTo
        brollMoveEndHandler = null;
    }
    brollMap = null;
}

/* ────────── 3D Terrain ────────── */

export function enableTerrain(map: mapboxgl.Map): void {
    try {
        if (!map.getSource("mapbox-dem")) {
            map.addSource("mapbox-dem", {
                type: "raster-dem",
                url: "mapbox://mapbox.mapbox-terrain-dem-v1",
                tileSize: 512,
                maxzoom: 14,
            });
        }
        map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
        map.setFog({
            color: "#0d1b2a",
            "horizon-blend": 0.05,
        } as mapboxgl.FogSpecification);
    } catch (err) {
        console.warn("Failed to enable terrain:", err);
    }
}

/* ────────── 3D Buildings ────────── */

export function enable3DBuildings(map: mapboxgl.Map): void {
    try {
        if (map.getLayer("3d-buildings")) return;

        map.addLayer({
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 14,
            paint: {
                "fill-extrusion-color": "#1a2f45",
                "fill-extrusion-height": ["get", "height"],
                "fill-extrusion-base": ["get", "min_height"],
                "fill-extrusion-opacity": 0.8,
            },
        });
    } catch (err) {
        console.warn("Failed to enable 3D buildings:", err);
    }
}

/* ────────── Time-of-Day Shift ────────── */

export function setTimeOfDay(map: mapboxgl.Map, round: number): void {
    try {
        // Subtle shift: dawn → midday → dusk across rounds
        const anchors: { position: number; color: string }[] = [
            { position: 1.5, color: "white" },
            { position: 1.5, color: "#ffd700" },
            { position: 1.5, color: "#ff8c00" },
            { position: 1.5, color: "#ff6347" },
            { position: 1.5, color: "#cd5c5c" },
        ];

        const idx = Math.min(round - 1, anchors.length - 1);
        const anchor = anchors[idx];

        map.setLight({
            anchor: "viewport",
            color: anchor.color,
            position: [anchor.position, 45, 45],
            intensity: 0.4,
        } as mapboxgl.LightSpecification);
    } catch (err) {
        console.warn("Failed to set time of day:", err);
    }
}

/* ────────── Scenario Atmosphere ────────── */

export function setScenarioAtmosphere(
    map: mapboxgl.Map,
    context: string
): void {
    try {
        const lower = context.toLowerCase();
        let fogColor = "#0d1b2a";

        if (lower.includes("flood") || lower.includes("water") || lower.includes("sea")) {
            fogColor = "#0a1628";
        } else if (
            lower.includes("pollution") ||
            lower.includes("dump") ||
            lower.includes("waste") ||
            lower.includes("landfill")
        ) {
            fogColor = "#1a1510";
        }

        map.setFog({
            color: fogColor,
            "horizon-blend": 0.08,
        } as mapboxgl.FogSpecification);
    } catch (err) {
        console.warn("Failed to set atmosphere:", err);
    }
}
