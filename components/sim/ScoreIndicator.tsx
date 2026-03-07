"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ScoreIndicatorProps {
    score: number;
    previousScore?: number;
    round: number;
}

function getScoreColor(score: number): string {
    if (score < 40) return "bg-red-500";
    if (score < 70) return "bg-amber-500";
    return "bg-teal";
}

function getScoreTextColor(score: number): string {
    if (score < 40) return "text-red-500";
    if (score < 70) return "text-amber";
    return "text-teal";
}

export default function ScoreIndicator({
    score,
    previousScore,
    round,
}: ScoreIndicatorProps) {
    const delta = previousScore !== undefined ? score - previousScore : 0;

    return (
        <div className="flex flex-col gap-2 w-full max-w-sm mx-auto sm:max-w-md">
            <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">
                    Round {round} of 3
                </span>
                <div className="flex items-center gap-1.5">
                    <span className={`font-bold text-lg ${getScoreTextColor(score)}`}>
                        {score}%
                    </span>
                    {delta !== 0 && (
                        <span
                            className={`flex items-center gap-0.5 text-xs font-medium ${delta > 0 ? "text-teal" : "text-red-500"
                                }`}
                        >
                            {delta > 0 ? (
                                <TrendingUp className="h-3 w-3" />
                            ) : (
                                <TrendingDown className="h-3 w-3" />
                            )}
                            {delta > 0 ? "+" : ""}
                            {delta}
                        </span>
                    )}
                    {delta === 0 && previousScore !== undefined && (
                        <Minus className="h-3 w-3 text-muted-foreground" />
                    )}
                </div>
            </div>

            <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out ${getScoreColor(score)}`}
                    style={{ width: `${score}%` }}
                />
            </div>
        </div>
    );
}
