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

export default function ZoneLegend() {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="fixed top-16 left-4 z-[999]">
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
                <div className="mt-1 rounded-xl bg-card/90 backdrop-blur-md border border-border p-3 shadow-lg animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex flex-col gap-2">
                        {ZONE_TYPES.map((zone) => (
                            <div
                                key={zone.label}
                                className="flex items-center gap-2"
                            >
                                <span
                                    className="h-3 w-3 rounded-full shrink-0"
                                    style={{ backgroundColor: zone.color }}
                                />
                                <span className="text-[11px] text-muted-foreground">
                                    {zone.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
