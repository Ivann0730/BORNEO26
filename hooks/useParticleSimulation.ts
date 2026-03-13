"use client";

import { useEffect, useState } from 'react';
import { SimpleMeshLayer } from '@deck.gl/mesh-layers';
import * as turf from '@turf/turf';
import { subscribe, unsubscribe } from '@/lib/traffic/animationDriver';
import type { MapInstruction } from '@/types';

const INSTANCE_ID = 'particles-sim';

interface Particle {
    position: [number, number];
    text: string;
    color: [number, number, number, number];
    delta: number;
    delayOffset: number;
    sizeOffset: number;
}

// Helper for colors
function hexToRgba(hex: string, alpha = 255): [number, number, number, number] {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.substring(0, 2), 16) || 255;
    const g = parseInt(clean.substring(2, 4), 16) || 255;
    const b = parseInt(clean.substring(4, 6), 16) || 255;
    return [r, g, b, alpha];
}

// Generate an unindexed Float32 mesh of a 3D upward-pointing Arrow
function createArrowMesh() {
    const positions: number[] = [];
    const normals: number[] = [];

    const addTriangle = (p1: number[], p2: number[], p3: number[], n: number[]) => {
        positions.push(...p1, ...p2, ...p3);
        normals.push(...n, ...n, ...n);
    };

    const addQuad = (p1: number[], p2: number[], p3: number[], p4: number[], n: number[]) => {
        addTriangle(p1, p2, p3, n);
        addTriangle(p1, p3, p4, n);
    };

    // Stem: box from Z=0 to Z=2
    const s = 0.2;
    const z1 = 0, z2 = 2;
    addQuad([-s, s, z1], [s, s, z1], [s, s, z2], [-s, s, z2], [0, 1, 0]);   // Front (+Y)
    addQuad([s, -s, z1], [-s, -s, z1], [-s, -s, z2], [s, -s, z2], [0, -1, 0]); // Back (-Y)
    addQuad([s, s, z1], [s, -s, z1], [s, -s, z2], [s, s, z2], [1, 0, 0]);   // Right (+X)
    addQuad([-s, -s, z1], [-s, s, z1], [-s, s, z2], [-s, -s, z2], [-1, 0, 0]); // Left (-X)
    addQuad([-s, -s, z1], [s, -s, z1], [s, s, z1], [-s, s, z1], [0, 0, -1]); // Bottom 

    // Head: pyramid from Z=2 to Z=4
    const h = 0.6;
    const z3 = 4;
    addQuad([-h, -h, z2], [h, -h, z2], [h, h, z2], [-h, h, z2], [0, 0, -1]); // Head Bottom

    // Slant faces (simplified bounding normals)
    addTriangle([-h, h, z2], [h, h, z2], [0, 0, z3], [0, 2, 0.6]); // Front 
    addTriangle([h, -h, z2], [-h, -h, z2], [0, 0, z3], [0, -2, 0.6]); // Back 
    addTriangle([h, h, z2], [h, -h, z2], [0, 0, z3], [2, 0, 0.6]); // Right 
    addTriangle([-h, -h, z2], [-h, h, z2], [0, 0, z3], [-2, 0, 0.6]); // Left 

    // Normalize all normal vectors
    for (let i = 0; i < normals.length; i += 3) {
        const nx = normals[i], ny = normals[i + 1], nz = normals[i + 2];
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        normals[i] /= len; normals[i + 1] /= len; normals[i + 2] /= len;
    }

    const posArray = new Float32Array(positions);
    const normArray = new Float32Array(normals);

    return {
        header: {
            vertexCount: posArray.length / 3
        },
        attributes: {
            POSITION: { value: posArray, size: 3 },
            NORMAL: { value: normArray, size: 3 }
        }
    };
}

const ARROW_MESH = createArrowMesh();

export function useParticleSimulation(instructions: MapInstruction[]) {
    const [currentTime, setCurrentTime] = useState(0);
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        const pInstrs = instructions.filter(i => i.layerType === 'particles');
        if (pInstrs.length === 0) {
            setParticles([]);
            return;
        }

        const newParticles: Particle[] = [];
        pInstrs.forEach(inst => {
            if (!inst.coordinates || inst.delta === undefined) return;
            // Ignore if minimal delta, though we typically just show it
            if (inst.delta === 0) return;

            const color = inst.color ? hexToRgba(inst.color) : [255, 255, 255, 255] as [number, number, number, number];

            // Calculate particle density based on zone area using Turf
            let particleCount = 2; // conservative fallback
            if (inst.geoJson) {
                try {
                    const areaSqMeters = turf.area(inst.geoJson as any);
                    // ~3 particles per 10,000 square meters. Clamped 2 to 15 max.
                    particleCount = Math.max(2, Math.min(15, Math.floor(areaSqMeters / 3000)));
                } catch (e) {
                    console.error("Turf area err", e);
                }
            }

            // Generate a continuous stream of arrows scattered within the polygon bounds
            for (let i = 0; i < particleCount; i++) {
                let lng = inst.coordinates[0];
                let lat = inst.coordinates[1];

                // If geoJson bounds are provided, find a random point strictly inside the polygon
                if (inst.geoJson) {
                    const bbox = turf.bbox(inst.geoJson);
                    for (let attempts = 0; attempts < 50; attempts++) {
                        const testLng = bbox[0] + Math.random() * (bbox[2] - bbox[0]);
                        const testLat = bbox[1] + Math.random() * (bbox[3] - bbox[1]);
                        const pt = turf.point([testLng, testLat]);

                        try {
                            // Turf accepts Feature or FeatureCollection
                            let isInside = false;
                            if (inst.geoJson.type === 'FeatureCollection') {
                                isInside = (inst.geoJson as GeoJSON.FeatureCollection).features.some(f => turf.booleanPointInPolygon(pt, f as any));
                            } else {
                                isInside = turf.booleanPointInPolygon(pt, inst.geoJson as any);
                            }

                            if (isInside) {
                                lng = testLng;
                                lat = testLat;
                                break;
                            }
                        } catch (e) {
                            // Ignore turf errors for degenerate polygons
                            break;
                        }
                    }
                } else {
                    // Fallback to much smaller bounding box offset if no polygon provided
                    lng += (Math.random() - 0.5) * 0.0008; // ~80 meters
                    lat += (Math.random() - 0.5) * 0.0008;
                }

                newParticles.push({
                    position: [lng, lat],
                    text: '',
                    color,
                    delta: inst.delta,
                    delayOffset: Math.random() * 12000, // Staggered over long 12-second loop
                    sizeOffset: Math.random() * 0.3 + 0.7 // 70% to 100% size variance
                });
            }
        });
        setParticles(newParticles);
        console.log("[useParticleSimulation] Generated particles:", newParticles.length, newParticles);
    }, [instructions]);

    useEffect(() => {
        console.log("[useParticleSimulation] Hook effect triggered. Particle count:", particles.length);
        if (particles.length === 0) return;
        subscribe(INSTANCE_ID, (elapsed) => setCurrentTime(elapsed));
        return () => unsubscribe(INSTANCE_ID);
    }, [particles.length]);

    if (particles.length === 0) {
        return null;
    }

    // A single True 3D Mesh Arrow Swarm rendering continuous particles
    const meshLayer = new SimpleMeshLayer({
        id: `particles-mesh-${particles.length}`,
        data: particles,
        mesh: ARROW_MESH as any,
        sizeScale: 3,
        getPosition: d => d.position,
        getScale: (d: Particle) => [d.sizeOffset, d.sizeOffset, d.sizeOffset],
        getColor: d => {
            const loopDuration = 12000; // Slowing down massively for majestic rise
            const t = ((currentTime + d.delayOffset) % loopDuration) / loopDuration;

            // Fade in over first 15%, solid for 70%, fade out over last 15%
            let alpha = 0;
            if (t < 0.15) alpha = (t / 0.15) * 255;
            else if (t < 0.85) alpha = 255;
            else alpha = ((1.0 - t) / 0.15) * 255;

            return [d.color[0], d.color[1], d.color[2], alpha];
        },
        getOrientation: (d: Particle) => {
            // Fixed rotation, upside down for negative effect
            return d.delta > 0 ? [0, 0, 0] : [180, 0, 0];
        },
        getTranslation: (d: Particle) => {
            const loopDuration = 8000; // Same slow loop
            const t = ((currentTime + d.delayOffset) % loopDuration) / loopDuration;

            // Rise or fall continuously
            const totalRise = 60; // Ascend/Descend Total Distance
            // Add a small constant base elevation so they don't clip entirely at spawn
            const baseZ = 20;
            const zOffset = d.delta > 0 ? (baseZ + t * totalRise) : (totalRise - (t * totalRise) + baseZ);

            return [0, 0, zOffset]; // Z is "up" from ground level in Deck.GL translation
        },
        updateTriggers: {
            getColor: [currentTime],
            getTranslation: [currentTime]
        },
        material: {
            ambient: 0.8,
            diffuse: 0.9,
            shininess: 32,
            specularColor: [255, 255, 255]
        },
        parameters: {
            depthTest: true,
        }
    });

    return [meshLayer];
}
