import { GeoJsonLayer, ScatterplotLayer, ArcLayer, IconLayer } from "@deck.gl/layers";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import type { LayersList } from "@deck.gl/core";
import type { MapInstruction } from "@/types";

function hexToRgba(hex: string, alpha = 200): [number, number, number, number] {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.substring(0, 2), 16) || 0;
    const g = parseInt(clean.substring(2, 4), 16) || 0;
    const b = parseInt(clean.substring(4, 6), 16) || 0;
    return [r, g, b, alpha];
}

function normalizeType(type: string): MapInstruction["type"] {
    const t = type.toLowerCase().replace(/[^a-z_]/g, "");
    if (t.includes("add")) return "add_layer";
    if (t.includes("remove")) return "remove_layer";
    if (t.includes("fly")) return "fly_to";
    if (t.includes("animate") || t.includes("camera")) return "animate_camera";
    return "add_layer";
}

function normalizeLayerType(lt?: string): MapInstruction["layerType"] {
    if (!lt) return "polygon";
    const t = lt.toLowerCase();
    if (t.includes("heat")) return "heatmap";
    if (t.includes("point") || t.includes("scatter")) return "point";
    if (t.includes("arc")) return "arc";
    if (t.includes("icon")) return "icon";
    return "polygon";
}

export function buildLayers(instructions: MapInstruction[]): LayersList {
    const layers: LayersList = [];

    for (const rawInstr of instructions) {
        const instr = {
            ...rawInstr,
            type: normalizeType(rawInstr.type),
            layerType: normalizeLayerType(rawInstr.layerType),
        };

        if (instr.type !== "add_layer" || !instr.layerType) continue;

        const color = instr.color ? hexToRgba(instr.color) : [20, 184, 166, 180];
        const id = instr.layerId ?? `layer-${Date.now()}-${Math.random()}`;

        try {
            switch (instr.layerType) {
                case "polygon":
                    if (instr.geoJson) {
                        layers.push(
                            new GeoJsonLayer({
                                id,
                                data: instr.geoJson as GeoJSON.Feature,
                                filled: true,
                                stroked: true,
                                getFillColor: [...color.slice(0, 3), 80] as [number, number, number, number],
                                getLineColor: color as [number, number, number, number],
                                getLineWidth: 2,
                                lineWidthMinPixels: 1,
                                pickable: true,
                            })
                        );
                    }
                    break;

                case "heatmap":
                    if (instr.coordinates) {
                        layers.push(
                            new ScatterplotLayer({
                                id,
                                data: [{ position: instr.coordinates }],
                                getPosition: (d: { position: [number, number] }) => d.position,
                                getRadius: 500,
                                getFillColor: color as [number, number, number, number],
                                opacity: instr.intensity ?? 0.6,
                                pickable: true,
                            })
                        );
                    }
                    break;

                case "point":
                    if (instr.coordinates) {
                        layers.push(
                            new ScatterplotLayer({
                                id,
                                data: [{ position: instr.coordinates }],
                                getPosition: (d: { position: [number, number] }) => d.position,
                                getRadius: 200,
                                getFillColor: color as [number, number, number, number],
                                pickable: true,
                            })
                        );
                    }
                    break;

                case "arc":
                    if (instr.coordinates) {
                        layers.push(
                            new ArcLayer({
                                id,
                                data: [{
                                    source: instr.coordinates,
                                    target: instr.coordinates,
                                }],
                                getSourcePosition: (d: { source: [number, number] }) => d.source,
                                getTargetPosition: (d: { target: [number, number] }) => d.target,
                                getSourceColor: color as [number, number, number, number],
                                getTargetColor: [249, 115, 22, 180] as [number, number, number, number],
                                getWidth: 2,
                            })
                        );
                    }
                    break;

                case "icon":
                    if (instr.coordinates) {
                        layers.push(
                            new IconLayer({
                                id,
                                data: [{ position: instr.coordinates, label: instr.label }],
                                getPosition: (d: { position: [number, number] }) => d.position,
                                getSize: 40,
                                pickable: true,
                            })
                        );
                    }
                    break;
            }
        } catch (err) {
            console.warn(`Failed to build layer ${id}:`, err);
        }
    }

    return layers;
}
