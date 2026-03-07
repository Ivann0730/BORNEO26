"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { enableTerrain, stopBrollAnimation } from "@/lib/mapbox/camera";

// Mapbox Standard style — includes detailed 3D building models, landmarks, trees
const STANDARD_STYLE = "mapbox://styles/mapbox/standard";

function getIsDark(): boolean {
    return document.documentElement.classList.contains("dark");
}

interface MapCanvasProps {
    onMapReady: (map: mapboxgl.Map) => void;
    onClick?: (lng: number, lat: number) => void;
    isSimulationActive?: boolean;
    className?: string;
}

export default function MapCanvas({
    onMapReady,
    onClick,
    isSimulationActive = false,
    className = "",
}: MapCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
    const clickHandlerRef = useRef<((e: mapboxgl.MapMouseEvent) => void) | null>(null);
    const simActiveRef = useRef(isSimulationActive);

    // Keep ref in sync with prop
    simActiveRef.current = isSimulationActive;

    useEffect(() => {
        if (!containerRef.current || mapInstanceRef.current) return;

        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token) {
            console.error("NEXT_PUBLIC_MAPBOX_TOKEN is not set");
            return;
        }

        mapboxgl.accessToken = token;
        const isDark = getIsDark();

        const map = new mapboxgl.Map({
            container: containerRef.current,
            style: STANDARD_STYLE,
            center: [118, 5],
            zoom: 4,
            pitch: 0,
            bearing: 0,
            attributionControl: false,
            config: {
                basemap: {
                    theme: "night",
                    lightPreset: "night",
                    show3dObjects: true,
                    showPointOfInterestLabels: true,
                    showPlaceLabels: true,
                }
            }
        });

        map.addControl(
            new mapboxgl.AttributionControl({ compact: true }),
            "bottom-right"
        );

        map.on("load", () => {
            mapInstanceRef.current = map;

            // Dark fog to match dark-v11 feel
            map.setFog({
                color: "#0d1b2a",
                "high-color": "#0d1b2a",
                "space-color": "#070d15",
                "horizon-blend": 0.08,
                "star-intensity": 0.15,
            } as mapboxgl.FogSpecification);

            enableTerrain(map);
            onMapReady(map);
        });

        // BUG-01: Guard click handler with simulation active check
        if (onClick) {
            const handler = (e: mapboxgl.MapMouseEvent) => {
                if (simActiveRef.current) return;
                onClick(e.lngLat.lng, e.lngLat.lat);
            };
            clickHandlerRef.current = handler;
            map.on("click", handler);
        }

        // No theme observer needed — map is always dark/night

        return () => {
            stopBrollAnimation();
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div
            ref={containerRef}
            className={`w-full h-full ${className}`}
        />
    );
}
