"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

/* ── ASEAN Capitals ── */
const CITIES = [
    { name: "Jakarta", lng: 106.8456, lat: -6.2088 },
    { name: "Manila", lng: 120.9842, lat: 14.5995 },
    { name: "Bangkok", lng: 100.5018, lat: 13.7563 },
    { name: "Kuala Lumpur", lng: 101.6869, lat: 3.1390 },
    { name: "Singapore", lng: 103.8198, lat: 1.3521 },
    { name: "Hanoi", lng: 105.8542, lat: 21.0285 },
    { name: "Naypyidaw", lng: 96.1297, lat: 19.7450 },
    { name: "Phnom Penh", lng: 104.9282, lat: 11.5564 },
    { name: "Vientiane", lng: 102.6331, lat: 17.9757 },
    { name: "Bandar Seri Begawan", lng: 114.9398, lat: 4.9031 },
];

export default function WorldMapBg() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        if (!containerRef.current || mapInstanceRef.current) return;

        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token) {
            console.error("NEXT_PUBLIC_MAPBOX_TOKEN is not set. Map background disabled.");
            return;
        }

        mapboxgl.accessToken = token;

        const getIsDark = () => document.documentElement.classList.contains("dark");
        const getStyleUrl = (isDark: boolean) =>
            isDark ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11";

        // Initialize a fully locked, static map
        const map = new mapboxgl.Map({
            container: containerRef.current,
            style: getStyleUrl(getIsDark()),
            center: [110, 8],
            zoom: 3.8,
            interactive: false,
            attributionControl: false,
            dragPan: false,
            scrollZoom: false,
            boxZoom: false,
            dragRotate: false,
            keyboard: false,
            doubleClickZoom: false,
            touchZoomRotate: false,
            logoPosition: "bottom-left"
        });

        // Whenever the style fully loads (initially or after a theme switch),
        // strip out all labels and POIs to keep the background clean.
        map.on("style.load", () => {
            const layers = map.getStyle()?.layers;
            if (layers) {
                for (const layer of layers) {
                    if (layer.type === "symbol") {
                        map.removeLayer(layer.id);
                    }
                }
            }
        });

        map.on("load", () => {
            mapInstanceRef.current = map;

            // Add custom HTML markers for each ASEAN capital
            CITIES.forEach((city, i) => {
                const el = document.createElement("div");
                el.className = "group relative cursor-pointer";

                el.innerHTML = `
                    <div class="relative flex items-center justify-center h-4 w-4">
                        <!-- Pulse ring 1 -->
                        <div class="absolute inset-0 rounded-full border border-primary/50 landing-ping-ring" style="animation-delay: ${i * 0.4}s"></div>
                        <!-- Pulse ring 2 -->
                        <div class="absolute inset-0 rounded-full border border-primary/30 landing-ping-ring" style="animation-delay: ${i * 0.4 + 1.5}s"></div>
                        <!-- Center dot -->
                        <div class="h-2 w-2 rounded-full bg-primary z-10"></div>
                        
                        <!-- Tooltip Label -->
                        <div class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                            <div class="bg-card/90 border border-border px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold whitespace-nowrap text-foreground shadow-lg backdrop-blur-sm">
                                ${city.name}
                            </div>
                        </div>
                    </div>
                `;

                new mapboxgl.Marker({ element: el })
                    .setLngLat([city.lng, city.lat])
                    .addTo(map);
            });
        });

        // Watch for theme toggles to dynamically update map style
        const observer = new MutationObserver(() => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setStyle(getStyleUrl(getIsDark()));
            }
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"]
        });

        // Clean up on unmount
        return () => {
            observer.disconnect();
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-auto" aria-hidden="true">
            {/* The map container */}
            <div ref={containerRef} className="absolute inset-0 w-full h-full" />

            {/* SE Asia radial glow overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center ml-[30%]">
                <div className="w-[800px] h-[600px] rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(0,212,160,0.15)_0%,rgba(0,212,160,0.05)_40%,transparent_70%)] landing-sea-glow" />
            </div>

            {/* Radar scan line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/20 landing-scanline pointer-events-none" />

            {/* Radial vignette overlay to darken edges */}
            <div className="absolute inset-0 landing-vignette pointer-events-none" />
        </div>
    );
}
