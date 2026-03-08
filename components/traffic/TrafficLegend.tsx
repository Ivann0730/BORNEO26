"use client";

import type { TrafficConfig, RoadClass } from '@/lib/traffic/types';
import { getSchemeColors } from '@/lib/traffic/colorSchemes';

interface TrafficLegendProps {
  config: TrafficConfig;
}

const CLASS_LABELS: Record<RoadClass, string> = {
  motorway: 'Motorway',
  trunk: 'Trunk',
  primary: 'Primary',
  secondary: 'Secondary',
  tertiary: 'Tertiary',
  street: 'Street',
  path: 'Path',
};

export default function TrafficLegend({
  config,
}: TrafficLegendProps) {
  // We only have neon-blue and neon-green now.
  // Both are uniform, so no legend is required.
  return null;
}
