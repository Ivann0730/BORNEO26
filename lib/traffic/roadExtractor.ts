import mapboxgl from 'mapbox-gl';
import type { RoadFeature, RoadClass, TileKey } from './types';

/**
 * Hidden layer ID we add for road querying.
 * Mapbox Standard style's imported layers are NOT queryable,
 * so we add our own transparent layer from the streets-v8 source.
 */
const QUERY_SOURCE = 'traffic-roads-src';
const QUERY_LAYER = 'traffic-roads-all';

const CLASS_MAP: Record<string, RoadClass> = {
  motorway: 'motorway',
  motorway_link: 'motorway',
  trunk: 'trunk',
  trunk_link: 'trunk',
  primary: 'primary',
  primary_link: 'primary',
  secondary: 'secondary',
  secondary_link: 'secondary',
  tertiary: 'tertiary',
  tertiary_link: 'tertiary',
  street: 'street',
  street_limited: 'street',
  residential: 'street',
  service: 'street',
  track: 'path',
  path: 'path',
  pedestrian: 'path',
};

/**
 * Adds a hidden vector tile source + transparent layer for road querying.
 * Call this once after map 'style.load' or 'load'.
 */
export function installRoadQueryLayers(map: mapboxgl.Map): void {
  try {
    if (map.getSource(QUERY_SOURCE)) return;

    map.addSource(QUERY_SOURCE, {
      type: 'vector',
      url: 'mapbox://mapbox.mapbox-streets-v8',
    });

    map.addLayer({
      id: QUERY_LAYER,
      type: 'line',
      source: QUERY_SOURCE,
      'source-layer': 'road',
      filter: ['in', ['get', 'class'], [
        'literal',
        [
          'motorway', 'motorway_link', 'trunk', 'trunk_link',
          'primary', 'primary_link', 'secondary', 'secondary_link',
          'tertiary', 'tertiary_link', 'street', 'street_limited',
          'residential', 'service'
        ]
      ]],
      paint: {
        'line-opacity': 0,
        'line-width': 1,
      },
    });
  } catch (err) {
    console.warn('[TrafficSim] Failed to install road query layers:', err);
  }
}

export function extractRoadsFromViewport(
  map: mapboxgl.Map,
  targetClasses: RoadClass[] = ['primary', 'secondary', 'tertiary', 'street']
): RoadFeature[] {
  try {
    const features = map.queryRenderedFeatures(undefined as unknown as mapboxgl.PointLike, {
      layers: (() => {
        try { return !!map.getLayer(QUERY_LAYER) ? [QUERY_LAYER] : []; }
        catch { return []; }
      })(),
    });

    const seen = new Set<string>();
    const roads: RoadFeature[] = [];

    for (const feature of features) {
      if (feature.geometry.type !== 'LineString') continue;

      const props = feature.properties ?? {};
      const rawClass = String(props.class ?? '');
      const roadClass = CLASS_MAP[rawClass];
      if (!roadClass || !targetClasses.includes(roadClass)) continue;

      const id = String(feature.id ?? `r-${Math.random()}`);
      if (seen.has(id)) continue;
      seen.add(id);

      roads.push({
        id,
        coordinates: (feature.geometry as GeoJSON.LineString).coordinates as [number, number][],
        roadClass,
        oneWay: props.oneway === 'true' || props.oneway === true,
        name: props.name as string | undefined,
      });
    }

    return roads;
  } catch (err) {
    console.warn('[TrafficSim] Road extraction failed:', err);
    return [];
  }
}

export function getViewportTileKey(map: mapboxgl.Map): TileKey {
  const bounds = map.getBounds();
  const z = Math.round(map.getZoom() * 10) / 10;
  if (!bounds) {
    return `${z}-0-0-0-0`;
  }
  // Format: z-west-south-east-north (rounded to 3 decimals to prevent micro-pan spam)
  return `${z}-${bounds.getWest().toFixed(3)}-${bounds.getSouth().toFixed(3)}-${bounds.getEast().toFixed(3)}-${bounds.getNorth().toFixed(3)}`;
}
