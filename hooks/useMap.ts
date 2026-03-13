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
import { useTrafficSimulation } from "@/hooks/useTrafficSimulation";
import { buildTrafficLayer } from "@/components/traffic/TrafficOverlay";
import { useParticleSimulation } from "@/hooks/useParticleSimulation";

export function useMap() {
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [layers, setLayers] = useState<MapInstruction[]>([]);
    const [particleInstructions, setParticleInstructions] = useState<MapInstruction[]>([]);
    const [isMapReady, setIsMapReady] = useState(false);
    const [isBrollPaused, setIsBrollPaused] = useState(false);
    const brollParamsRef = useRef<{lng: number, lat: number, zoom?: number, pitch?: number} | null>(null);
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
        const withIds = instructions.map(inst => ({
            ...inst,
            layerId: inst.layerId || `layer-${Date.now()}-${Math.random()}`
        }));
        setLayers((prev) => [...prev, ...withIds]);
    }, []);

    const clearLayers = useCallback(() => {
        setLayers([]);
    }, []);

    const startBroll = useCallback((lng: number, lat: number, zoom?: number, pitch?: number) => {
        if (mapRef.current) {
            brollParamsRef.current = { lng, lat, zoom, pitch };
            startBrollAnimation(mapRef.current, lng, lat, zoom, pitch);
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
        if (mapRef.current && brollParamsRef.current) {
            const { lng, lat, zoom, pitch } = brollParamsRef.current;
            startBrollAnimation(mapRef.current, lng, lat, zoom, pitch);
            isBrollActiveRef.current = true;
            setIsBrollPaused(false);
        }
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const handleUserInput = () => {
            if (isBrollActiveRef.current) {
                stopBrollAnimation();
                isBrollActiveRef.current = false;
                setIsBrollPaused(true);
            }
        };

        // Listen to raw interactions on the map canvas to reliably catch user intent
        const container = map.getContainer();
        container.addEventListener("mousedown", handleUserInput, { passive: true });
        container.addEventListener("touchstart", handleUserInput, { passive: true });
        container.addEventListener("wheel", handleUserInput, { passive: true });

        return () => {
            container.removeEventListener("mousedown", handleUserInput);
            container.removeEventListener("touchstart", handleUserInput);
            container.removeEventListener("wheel", handleUserInput);
        };
    }, [isMapReady]);

    // Traffic simulation
    const traffic = useTrafficSimulation(mapRef.current);

    // Particle simulation for effects
    const particleLayer = useParticleSimulation(particleInstructions);

    // Merge scenario layers with traffic & particle layers
    const scenarioLayers = buildLayers(layers);
    const trafficLayer = buildTrafficLayer(traffic.state);
    
    const deckLayers = [
        ...scenarioLayers,
        ...(trafficLayer ? [trafficLayer] : []),
        ...(Array.isArray(particleLayer) ? particleLayer : particleLayer ? [particleLayer] : []),
    ];

    return {
        mapRef,
        isMapReady,
        setMapInstance,
        flyTo,
        flyToCoords,
        addLayers,
        clearLayers,
        setParticleInstructions,
        startBroll,
        stopBroll,
        resumeBroll,
        isBrollPaused,
        layers,
        deckLayers,
        traffic,
    };
}
