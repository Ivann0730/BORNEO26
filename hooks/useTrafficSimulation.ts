"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import type { TrafficState, TrafficConfig } from '@/lib/traffic/types';
import {
  extractRoadsFromViewport,
  getViewportTileKey,
  installRoadQueryLayers,
} from '@/lib/traffic/roadExtractor';
import { generateTrips } from '@/lib/traffic/tripGenerator';
import { stitchRoads } from '@/lib/traffic/routeStitcher';
import {
  getCached,
  setCache,
  invalidateCache,
} from '@/lib/traffic/tileCache';
import {
  subscribe,
  unsubscribe,
} from '@/lib/traffic/animationDriver';
import { DEFAULT_CONFIG } from '@/lib/traffic/colorSchemes';

const INSTANCE_ID = 'traffic-sim-main';

export function useTrafficSimulation(
  map: mapboxgl.Map | null
) {
  const [state, setState] = useState<TrafficState>({
    trips: [],
    currentTime: 0,
    isPlaying: true,
    config: DEFAULT_CONFIG,
    roadCount: 0,
    tripCount: 0,
    tileKey: null,
  });

  const configRef = useRef(state.config);
  const installedRef = useRef(false);
  const timeRef = useRef(0); // Raw time at ~60fps, no React re-renders

  // Install hidden road query layers once
  useEffect(() => {
    if (!map || installedRef.current) return;
    installRoadQueryLayers(map);
    installedRef.current = true;
  }, [map]);

  const regenerate = useCallback(() => {
    if (!map) return;

    try {
      const tileKey = getViewportTileKey(map);
      const cached = getCached(tileKey);

      if (cached) {
        setState((prev) => ({
          ...prev,
          trips: cached.trips,
          roadCount: cached.roads.length,
          tripCount: cached.trips.length,
          tileKey,
        }));
        return;
      }

      // Lower density when zoomed out
      const cfg = { ...configRef.current };
      const currentZoom = map.getZoom();
      if (currentZoom < 12) {
        cfg.density = Math.min(cfg.density, 0.3);
      }

      const roads = extractRoadsFromViewport(
        map,
        cfg.roadClasses
      );
      if (roads.length === 0) return;

      const stitched = stitchRoads(roads);
      const trips = generateTrips(stitched, cfg);
      setCache(tileKey, stitched, trips);

      setState((prev) => ({
        ...prev,
        trips,
        roadCount: stitched.length,
        tripCount: trips.length,
        tileKey,
      }));
    } catch (err) {
      console.warn('[TrafficSim] Regeneration failed:', err);
    }
  }, [map]);

  // Subscribe to animation loop
  useEffect(() => {
    if (!state.isPlaying) return;

    subscribe(INSTANCE_ID, (elapsed) => {
      // Scale perceived time by speedMultiplier
      const scaledTime = elapsed * state.config.speedMultiplier;
      const loopTime = scaledTime % state.config.loopDurationMs;
      // Store raw time in ref (no re-render)
      timeRef.current = loopTime;
    });

    // Throttled React re-render at ~24fps
    const intervalId = setInterval(() => {
      setState((prev) => ({
        ...prev,
        currentTime: timeRef.current,
      }));
    }, 42); // ~24fps

    return () => {
      unsubscribe(INSTANCE_ID);
      clearInterval(intervalId);
    };
  }, [state.isPlaying, state.config.loopDurationMs, state.config.speedMultiplier]);

  // Listen for map events to trigger regeneration when view settles
  useEffect(() => {
    if (!map) return;

    let timeoutId: NodeJS.Timeout;
    const triggerRegen = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => regenerate(), 300);
    };

    map.on('moveend', triggerRegen);
    map.on('zoomend', triggerRegen);
    map.on('idle', triggerRegen);

    // Initial load trigger
    triggerRegen();

    return () => {
      clearTimeout(timeoutId);
      map.off('moveend', triggerRegen);
      map.off('zoomend', triggerRegen);
      map.off('idle', triggerRegen);
    };
  }, [map, regenerate]);

  const updateConfig = useCallback(
    (partial: Partial<TrafficConfig>) => {
      configRef.current = { ...configRef.current, ...partial };
      invalidateCache();
      setState((prev) => ({
        ...prev,
        config: configRef.current,
      }));
      regenerate();
    },
    [regenerate]
  );

  const toggle = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  }, []);

  return { state, updateConfig, toggle, regenerate };
}
