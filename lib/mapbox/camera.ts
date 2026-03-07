import type { CameraTarget } from "@/types";
import mapboxgl from "mapbox-gl";

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

let brollAnimationId: number | null = null;

export function startBrollAnimation(
    map: mapboxgl.Map,
    centerLng: number,
    centerLat: number
): void {
    stopBrollAnimation();
    let bearing = map.getBearing();

    function rotate() {
        bearing = (bearing + 0.1) % 360;
        map.rotateTo(bearing, { duration: 0 });
        brollAnimationId = requestAnimationFrame(rotate);
    }

    map.flyTo({
        center: [centerLng, centerLat],
        zoom: 15,
        pitch: 50,
        bearing,
        duration: 2500,
        essential: true,
    });

    map.once("moveend", () => {
        brollAnimationId = requestAnimationFrame(rotate);
    });
}

export function stopBrollAnimation(): void {
    if (brollAnimationId !== null) {
        cancelAnimationFrame(brollAnimationId);
        brollAnimationId = null;
    }
}
