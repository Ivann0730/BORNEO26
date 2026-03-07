"use client";

import { useRef, useCallback, useState, useEffect } from "react";
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
    const [isBrollPaused, setIsBrollPaused] = useState(false);
    const brollCenterRef = useRef<[number, number] | null>(null);
    const isBrollActiveRef = useRef(false);

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
            brollCenterRef.current = [lng, lat];
            startBrollAnimation(mapRef.current, lng, lat);
            isBrollActiveRef.current = true;
            setIsBrollPaused(false);
        }
    }, []);

    const stopBroll = useCallback(() => {
        stopBrollAnimation();
        isBrollActiveRef.current = false;
        setIsBrollPaused(false);
    }, []);

    const resumeBroll = useCallback(() => {
        if (mapRef.current && brollCenterRef.current) {
            startBrollAnimation(mapRef.current, brollCenterRef.current[0], brollCenterRef.current[1]);
            isBrollActiveRef.current = true;
            setIsBrollPaused(false);
        }
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const handleMoveStart = (e: any) => {
            if (e.originalEvent && isBrollActiveRef.current) {
                stopBrollAnimation();
                isBrollActiveRef.current = false;
                setIsBrollPaused(true);
            }
        };

        map.on("movestart", handleMoveStart);

        return () => {
            map.off("movestart", handleMoveStart);
        };
    }, [isMapReady]);

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
        resumeBroll,
        isBrollPaused,
        layers,
        deckLayers,
    };
}
