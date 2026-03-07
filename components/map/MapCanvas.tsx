"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const DARK_STYLE = "mapbox://styles/mapbox/dark-v11";
const LIGHT_STYLE = "mapbox://styles/mapbox/light-v11";

function getIsDark(): boolean {
    return document.documentElement.classList.contains("dark");
}

interface MapCanvasProps {
    onMapReady: (map: mapboxgl.Map) => void;
    onClick?: (lng: number, lat: number) => void;
    className?: string;
}

export default function MapCanvas({
    onMapReady,
    onClick,
    className = "",
}: MapCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<mapboxgl.Map | null>(null);

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
            style: isDark ? DARK_STYLE : LIGHT_STYLE,
            center: [118, 5],
            zoom: 4,
            pitch: 0,
            bearing: 0,
            attributionControl: false,
        });

        map.addControl(
            new mapboxgl.AttributionControl({ compact: true }),
            "bottom-right"
        );

        map.on("load", () => {
            mapInstanceRef.current = map;
            onMapReady(map);
        });

        if (onClick) {
            map.on("click", (e) => {
                onClick(e.lngLat.lng, e.lngLat.lat);
            });
        }

        // Watch for theme changes via MutationObserver on <html> class
        const observer = new MutationObserver(() => {
            const dark = getIsDark();
            const newStyle = dark ? DARK_STYLE : LIGHT_STYLE;
            map.setStyle(newStyle);
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => {
            observer.disconnect();
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div
            ref={containerRef}
            className={`w-full h-full ${className}`}
        />
    );
}
