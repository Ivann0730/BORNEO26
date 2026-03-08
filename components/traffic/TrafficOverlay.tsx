"use client";

import { TripsLayer } from '@deck.gl/geo-layers';
import type { TrafficState, Trip } from '@/lib/traffic/types';
import { getColorForTrip } from '@/lib/traffic/colorSchemes';

/**
 * Builds the TripsLayer for traffic visualization.
 * Returns a deck.gl layer instance to be merged into LayersList.
 */
export function buildTrafficLayer(
  state: TrafficState
): TripsLayer<Trip> | null {
  if (state.trips.length === 0) return null;

  try {
    return new TripsLayer<Trip>({
      id: 'traffic-trips',
      data: state.trips,
      getPath: (d: Trip) => d.waypoints,
      getTimestamps: (d: Trip) => d.timestamps,
      getColor: (d: Trip) =>
        getColorForTrip(d.roadClass, state.config.colorScheme, 0),
      getWidth: state.config.globalWidth,
      widthMinPixels: 1,
      trailLength: state.config.trailLength,
      currentTime: state.currentTime,
      updateTriggers: {
        getColor: [state.config.colorScheme],
      },
    });
  } catch (err) {
    console.warn('[TrafficSim] Layer build failed:', err);
    return null;
  }
}
