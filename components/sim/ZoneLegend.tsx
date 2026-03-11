"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const ZONE_TYPES = [
    { label: "Residential", color: "#ef4444" },
    { label: "Commercial", color: "#3b82f6" },
    { label: "Industrial", color: "#f59e0b" },
    { label: "Institutional", color: "#a855f7" },
    { label: "Business District", color: "#eab308" },
    { label: "Mixed Use", color: "#ec4899" },
    { label: "Open Space", color: "#22c55e" },
];

interface ZoneLegendProps {
    sectorTrusts?: Record<string, number>;
    activeSectorId?: string;
    activeSectorDelta?: number;
}

export default function ZoneLegend({ sectorTrusts, activeSectorId, activeSectorDelta }: ZoneLegendProps) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="fixed top-24 left-4 z-[1000] sm:top-20 pointer-events-auto">
            <button
                onClick={() => setIsOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-xl bg-card/90 backdrop-blur-md border border-border px-3 py-2 text-xs font-medium shadow-md hover:bg-card transition-colors"
            >
                <span>Zones</span>
                {isOpen ? (
                    <ChevronUp className="h-3 w-3" />
                ) : (
                    <ChevronDown className="h-3 w-3" />
                )}
            </button>

            {isOpen && (
                <div className="mt-2 rounded-xl bg-card/90 backdrop-blur-md border border-border p-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 w-[240px]">
                    <div className="flex flex-col gap-0.25">
                        {ZONE_TYPES.map((zone) => {
                            const isActive = activeSectorId === zone.label;
                            const delta = activeSectorDelta;

                            return (
                                <div
                                    key={zone.label}
                                    className={`flex items-center gap-2 p-1.5 rounded-md transition-colors ${isActive ? 'bg-primary/5 border border-primary/20 shadow-sm' : 'border border-transparent'}`}
                                >
                                    <span
                                        className="h-2.5 w-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: zone.color }}
                                    />
                                    <span className="text-[11px] font-medium text-foreground whitespace-nowrap">
                                        {zone.label}
                                    </span>

                                    <div className="flex items-center justify-end gap-1 ml-auto w-full">
                                        {isActive && delta !== undefined && delta !== 0 && (
                                            <span className={`text-[10px] font-bold ${delta > 0 ? "text-emerald-500" : "text-red-500"} animate-in fade-in slide-in-from-right-2 duration-300`}>
                                                {delta > 0 ? "+" : ""}{delta}%
                                            </span>
                                        )}
                                        {sectorTrusts && sectorTrusts[zone.label] !== undefined && (
                                            <div className="flex items-center gap-2 shrink-0 pl-1">
                                                <div className="w-8 h-1.5 bg-muted/60 rounded-full overflow-hidden">
                                                    <div className={`h-full transition-all duration-1000 ${sectorTrusts[zone.label] >= 70 ? 'bg-emerald-500' : sectorTrusts[zone.label] <= 30 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${sectorTrusts[zone.label]}%` }} />
                                                </div>
                                                <span className={`text-[10px] w-[26px] text-right font-bold ${sectorTrusts[zone.label] >= 70 ? 'text-emerald-500' : sectorTrusts[zone.label] <= 30 ? 'text-red-500' : 'text-primary'}`}>
                                                    {sectorTrusts[zone.label]}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
