"use client";

import { useRef, useCallback, useState } from "react";
import mapboxgl from "mapbox-gl";
import {
    flyToLocation,
    flyToCoordinates,
    startBrollAnimation,
    stopBrollAnimation,
} from "@/lib/mapbox/camera";
import type { CameraTarget, MapInstruction } from "@/types";
import { buildLayers } from "@/lib/mapbox/layerBuilder";

export function useMap() {
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [layers, setLayers] = useState<MapInstruction[]>([]);
    const [isMapReady, setIsMapReady] = useState(false);

    const setMapInstance = useCallback((map: mapboxgl.Map) => {
        mapRef.current = map;
        setIsMapReady(true);
    }, []);

    const flyTo = useCallback((target: CameraTarget, duration?: number) => {
        if (mapRef.current) {
            flyToLocation(mapRef.current, target, duration);
        }
    }, []);

    const flyToCoords = useCallback(
        (lng: number, lat: number, zoom?: number) => {
            if (mapRef.current) {
                flyToCoordinates(mapRef.current, lng, lat, zoom);
            }
        },
        []
    );

    const addLayers = useCallback((instructions: MapInstruction[]) => {
        setLayers((prev) => [...prev, ...instructions]);
    }, []);

    const clearLayers = useCallback(() => {
        setLayers([]);
    }, []);

    const startBroll = useCallback((lng: number, lat: number) => {
        if (mapRef.current) {
            startBrollAnimation(mapRef.current, lng, lat);
        }
    }, []);

    const stopBroll = useCallback(() => {
        stopBrollAnimation();
    }, []);

    const deckLayers = buildLayers(layers);

    return {
        mapRef,
        isMapReady,
        setMapInstance,
        flyTo,
        flyToCoords,
        addLayers,
        clearLayers,
        startBroll,
        stopBroll,
        layers,
        deckLayers,
    };
}
