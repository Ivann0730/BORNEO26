"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Info } from "lucide-react";

interface ScenarioPanelProps {
    context: string;
    onReady: () => void;
}

export default function ScenarioPanel({ context, onReady }: ScenarioPanelProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        let i = 0;
        setDisplayedText("");
        setShowButton(false);

        const interval = setInterval(() => {
            if (i < context.length) {
                setDisplayedText(context.slice(0, i + 1));
                i++;
            } else {
                clearInterval(interval);
                setTimeout(() => setShowButton(true), 500);
            }
        }, 25);

        return () => clearInterval(interval);
    }, [context]);

    return (
        <div className="flex flex-col gap-4 rounded-2xl bg-card/90 backdrop-blur-md border border-border p-5 shadow-xl max-w-sm w-full animate-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-2 text-primary">
                <Info className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                    Situation Briefing
                </span>
            </div>

            <p className="text-sm leading-relaxed min-h-[60px]">
                {displayedText}
                <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
            </p>

            {showButton && (
                <button
                    onClick={onReady}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-95 animate-in fade-in duration-300"
                >
                    Make Your Decision
                    <ArrowRight className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
