"use client";

import { Newspaper, Clock, Loader2 } from "lucide-react";
import type { ClimateHeadline } from "@/types";

interface HeadlineSelectorProps {
    headlines: ClimateHeadline[];
    isLoading: boolean;
    onSelect: (headline: ClimateHeadline) => void;
}

export default function HeadlineSelector({
    headlines,
    isLoading,
    onSelect,
}: HeadlineSelectorProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-2 p-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                    Finding climate news...
                </span>
            </div>
        );
    }

    if (headlines.length === 0) {
        return (
            <div className="p-6 text-center text-sm text-muted-foreground">
                No headlines found for this area. Try another location.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 p-4 max-h-[60vh] overflow-y-auto">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                Choose a headline to explore
            </p>
            {headlines.map((h) => (
                <button
                    key={h.id}
                    onClick={() => onSelect(h)}
                    className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
                >
                    <div className="flex items-start gap-3">
                        <Newspaper className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                            {h.title}
                        </h3>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 pl-7">
                        {h.description}
                    </p>
                    <div className="flex items-center gap-3 pl-7 text-xs text-muted-foreground">
                        <span>{h.source}</span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(h.publishedAt).toLocaleDateString()}
                        </span>
                    </div>
                </button>
            ))}
        </div>
    );
}
