"use client";

import { Lightbulb } from "lucide-react";

interface HintChipsProps {
    hints: string[];
    onSelect: (hint: string) => void;
}

export default function HintChips({ hints, onSelect }: HintChipsProps) {
    if (hints.length === 0) return null;

    return (
        <div className="flex flex-col gap-2 w-full max-w-sm mx-auto sm:max-w-md">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lightbulb className="h-3.5 w-3.5" />
                <span>Need a hint?</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {hints.map((hint, i) => (
                    <button
                        key={i}
                        onClick={() => onSelect(hint)}
                        className="rounded-full border border-border bg-card px-3 py-1.5 text-xs transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-95"
                    >
                        {hint}
                    </button>
                ))}
            </div>
        </div>
    );
}
