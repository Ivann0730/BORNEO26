"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";

interface ClimateTermTooltipProps {
    term: string;
    definition: string;
    children: React.ReactNode;
}

export default function ClimateTermTooltip({
    term,
    definition,
    children,
}: ClimateTermTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <span
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onTouchStart={() => setIsVisible((v) => !v)}
        >
            <span className="border-b border-dashed border-primary/50 text-primary cursor-help font-medium">
                {children}
            </span>

            {isVisible && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg bg-popover border border-border p-3 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-200">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-1">
                        <BookOpen className="h-3 w-3" />
                        {term}
                    </span>
                    <span className="text-xs text-popover-foreground leading-relaxed block">
                        {definition}
                    </span>
                    <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 rotate-45 bg-popover border-r border-b border-border" />
                </span>
            )}
        </span>
    );
}
