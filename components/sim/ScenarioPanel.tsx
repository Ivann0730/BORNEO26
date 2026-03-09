"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Info } from "lucide-react";

interface ScenarioPanelProps {
    context: string;
    availableSectors: string[];
    onComplete: (ranking: string[], risk: string) => void;
}

export default function ScenarioPanel({ context, availableSectors, onComplete }: ScenarioPanelProps) {
    const [phase, setPhase] = useState<"reading" | "predicting">("reading");
    const [displayedText, setDisplayedText] = useState("");
    const [showButton, setShowButton] = useState(false);
    const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
    const [riskInput, setRiskInput] = useState("");

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

    function toggleSector(sector: string) {
        setSelectedSectors(prev => {
            if (prev.includes(sector)) return prev.filter(s => s !== sector);
            if (prev.length >= 3) return prev;
            return [...prev, sector];
        });
    }

    if (phase === "predicting") {
        return (
            <div className="flex flex-col gap-5 rounded-2xl bg-card/90 backdrop-blur-md border border-border p-5 shadow-xl max-w-sm w-full animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-2 text-primary">
                    <Info className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                        Prediction Exercise
                    </span>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-foreground leading-snug">
                        Which <span className="text-primary font-bold">3 sectors</span> are most likely to be impacted?
                    </label>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {availableSectors.map(sector => {
                            const rank = selectedSectors.indexOf(sector);
                            const isSelected = rank !== -1;
                            return (
                                <button
                                    key={sector}
                                    onClick={() => toggleSector(sector)}
                                    className={`relative px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${isSelected
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                                        }`}
                                >
                                    {isSelected && (
                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-bold">
                                            {rank + 1}
                                        </span>
                                    )}
                                    {sector}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-foreground leading-snug">
                        What is the biggest risk going forward?
                    </label>
                    <textarea
                        value={riskInput}
                        onChange={(e) => setRiskInput(e.target.value)}
                        placeholder="e.g., funding might dry up..."
                        rows={2}
                        className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                </div>

                <button
                    onClick={() => onComplete(selectedSectors, riskInput)}
                    disabled={selectedSectors.length === 0 || riskInput.trim().length === 0}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                    Start Simulation
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        );
    }

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
                    onClick={() => setPhase("predicting")}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-95 animate-in fade-in duration-300"
                >
                    Make Predictions
                    <ArrowRight className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
