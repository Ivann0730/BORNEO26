"use client";

import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  Car,
} from 'lucide-react';
import type {
  TrafficState,
  TrafficConfig,
  RoadClass,
  TrafficColorScheme,
} from '@/lib/traffic/types';

interface TrafficControlsProps {
  state: TrafficState;
  zoom: number;
  onConfigChange: (partial: Partial<TrafficConfig>) => void;
  onToggle: () => void;
}

const COLOR_OPTIONS: {
  value: TrafficColorScheme;
  label: string;
}[] = [
  { value: 'neon-blue', label: 'Neon Blue' },
  { value: 'neon-green', label: 'Neon Green' },
  { value: 'neon-pink', label: 'Neon Pink' },
  { value: 'neon-orange', label: 'Neon Orange' },
  { value: 'neon-purple', label: 'Neon Purple' },
  { value: 'neon-yellow', label: 'Neon Yellow' },
];

const ROAD_OPTIONS: { value: RoadClass; label: string }[] = [
  { value: 'motorway', label: 'Motorway' },
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'tertiary', label: 'Tertiary' },
  { value: 'street', label: 'Street' },
];

export default function TrafficControls({
  state,
  zoom,
  onConfigChange,
  onToggle,
}: TrafficControlsProps) {
  const [expanded, setExpanded] = useState(false);
  const { config } = state;

  if (!expanded) {
    return (
      <button
        id="traffic-controls-toggle"
        onClick={() => setExpanded(true)}
        className="fixed bottom-24 md:bottom-6 left-6 z-[1100] w-11 h-11 rounded-full bg-card/90 backdrop-blur-md border border-border shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
        title="Traffic Controls"
      >
        <Car className="w-5 h-5 text-primary" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 md:bottom-6 left-6 z-[1100] w-72 rounded-2xl bg-card/90 backdrop-blur-md border border-border shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <span className="text-sm font-semibold text-foreground">
          Traffic Flow
        </span>
        <div className="flex items-center gap-1">
          <button
            id="traffic-play-pause"
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            {state.isPlaying ? (
              <Pause className="w-4 h-4 text-foreground" />
            ) : (
              <Play className="w-4 h-4 text-foreground" />
            )}
          </button>
          <button
            onClick={() => setExpanded(false)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 py-3 space-y-3 text-xs">
        {/* Density */}
        <SliderRow
          label="Density"
          value={config.density}
          min={0.1}
          max={1.0}
          step={0.1}
          display={`${Math.round(config.density * 100)}%`}
          onChange={(v) => onConfigChange({ density: v })}
        />

        {/* Speed */}
        <SliderRow
          label="Speed"
          value={config.speedMultiplier}
          min={0.25}
          max={3}
          step={0.25}
          display={`${config.speedMultiplier}x`}
          onChange={(v) =>
            onConfigChange({ speedMultiplier: v })
          }
        />

        {/* Trail Length */}
        <SliderRow
          label="Trail"
          value={config.trailLength}
          min={100}
          max={1000}
          step={50}
          display={`${config.trailLength}`}
          onChange={(v) =>
            onConfigChange({ trailLength: v })
          }
        />

        {/* Color Scheme */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Color</span>
          <select
            id="traffic-color-scheme"
            value={config.colorScheme}
            onChange={(e) =>
              onConfigChange({
                colorScheme:
                  e.target.value as TrafficColorScheme,
              })
            }
            className="bg-muted border border-border rounded-lg px-2 py-1 text-xs text-foreground"
          >
            {COLOR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Road Classes */}
        <div>
          <span className="text-muted-foreground block mb-1">
            Roads
          </span>
          <div className="flex flex-wrap gap-1.5">
            {ROAD_OPTIONS.map((opt) => {
              const active =
                config.roadClasses.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    const next = active
                      ? config.roadClasses.filter(
                          (c) => c !== opt.value
                        )
                      : [...config.roadClasses, opt.value];
                    if (next.length > 0)
                      onConfigChange({ roadClasses: next });
                  }}
                  className={`px-2 py-0.5 rounded-md border text-xs transition-colors ${
                    active
                      ? 'bg-primary/20 border-primary/50 text-primary'
                      : 'bg-muted border-border text-muted-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Width */}
        <SliderRow
          label="Width"
          value={config.globalWidth ?? 8}
          min={1}
          max={10}
          step={1}
          display={`${config.globalWidth ?? 8}px`}
          onChange={(v) =>
            onConfigChange({ globalWidth: v })
          }
        />
      </div>

      {/* Footer stats */}
      <div className="px-4 py-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{state.roadCount} roads</span>
        <span>{state.tripCount} trips</span>
        <span>z{zoom}</span>
      </div>
    </div>
  );
}

/* ─── Slider Row ─── */

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: SliderRowProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground w-10 shrink-0">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1 accent-primary"
      />
      <span className="text-foreground w-8 text-right">
        {display}
      </span>
    </div>
  );
}
