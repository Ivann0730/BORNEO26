"use client";

import { useEffect, useRef } from "react";
import { MapboxOverlay } from "@deck.gl/mapbox";
import type { LayersList } from "@deck.gl/core";
import mapboxgl from "mapbox-gl";

interface DeckGLOverlayProps {
    map: mapboxgl.Map | null;
    layers: LayersList;
}

export default function DeckGLOverlay({ map, layers }: DeckGLOverlayProps) {
    const overlayRef = useRef<MapboxOverlay | null>(null);

    useEffect(() => {
        if (!map) return;

        const overlay = new MapboxOverlay({ layers: [] });
        map.addControl(overlay as unknown as mapboxgl.IControl);
        overlayRef.current = overlay;

        return () => {
            try {
                map.removeControl(overlay as unknown as mapboxgl.IControl);
            } catch {
                // map may already be removed
            }
            overlayRef.current = null;
        };
    }, [map]);

    useEffect(() => {
        if (overlayRef.current) {
            overlayRef.current.setProps({ layers });
        }
    }, [layers]);

    return null;
}

