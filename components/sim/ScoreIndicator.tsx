"use client";

import { TrendingUp, TrendingDown, Minus, Users } from "lucide-react";
import { MAX_DECISIONS } from "@/lib/constants";

interface ScoreIndicatorProps {
    score: number;
    previousScore?: number;
    satisfaction: number;
    round: number;
}

function getScoreColor(score: number): string {
    if (score < 40) return "bg-red-500";
    if (score < 70) return "bg-amber-500";
    return "bg-teal";
}

function getSatColor(sat: number): string {
    if (sat < 30) return "bg-red-500";
    if (sat < 60) return "bg-amber-500";
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
    satisfaction,
    round,
}: ScoreIndicatorProps) {
    const delta =
        previousScore !== undefined ? score - previousScore : 0;

    return (
        <div className="fixed top-0 left-0 right-0 z-[1000] bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-2">
            <div className="max-w-2xl mx-auto flex flex-col gap-1.5">
                {/* Top row: round + scores */}
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">
                            Round {round} of {MAX_DECISIONS}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Score */}
                        <div className="flex items-center gap-1">
                            <span
                                className={`font-bold text-base ${getScoreTextColor(score)}`}
                            >
                                {score}%
                            </span>
                            {delta !== 0 && (
                                <span
                                    className={`flex items-center gap-0.5 text-[10px] font-medium ${
                                        delta > 0 ? "text-teal" : "text-red-500"
                                    }`}
                                >
                                    {delta > 0 ? (
                                        <TrendingUp className="h-2.5 w-2.5" />
                                    ) : (
                                        <TrendingDown className="h-2.5 w-2.5" />
                                    )}
                                    {delta > 0 ? "+" : ""}
                                    {delta}
                                </span>
                            )}
                            {delta === 0 && previousScore !== undefined && (
                                <Minus className="h-2.5 w-2.5 text-muted-foreground" />
                            )}
                        </div>
                        {/* Satisfaction */}
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span className="text-xs font-medium">
                                {satisfaction}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Progress bars */}
                <div className="flex gap-2">
                    <div className="flex-1 relative h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-600 ease-out ${getScoreColor(score)}`}
                            style={{ width: `${score}%` }}
                        />
                    </div>
                    <div className="w-16 relative h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-600 ease-out ${getSatColor(satisfaction)}`}
                            style={{ width: `${satisfaction}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
