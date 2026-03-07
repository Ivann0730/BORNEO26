"use client";

import { useMemo } from "react";
import { buildLayers } from "@/lib/mapbox/layerBuilder";
import type { MapInstruction } from "@/types";

interface LayerRendererProps {
    instructions: MapInstruction[];
}

export default function LayerRenderer({ instructions }: LayerRendererProps) {
    const layers = useMemo(() => buildLayers(instructions), [instructions]);

    // This component exposes layers for the parent to pass to DeckGLOverlay
    // It doesn't render anything itself
    return null;
}

export function useBuiltLayers(instructions: MapInstruction[]) {
    return useMemo(() => buildLayers(instructions), [instructions]);
}
