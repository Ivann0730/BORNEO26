"use client";

import { TrendingUp, TrendingDown, Minus, Leaf, Briefcase, Users } from "lucide-react";
import { MAX_DECISIONS } from "@/lib/constants";

interface ScoreIndicatorProps {
    ecology: number;
    economy: number;
    society: number;
    previousEcology?: number;
    previousEconomy?: number;
    previousSociety?: number;
    round: number;
}

export default function ScoreIndicator({
    ecology,
    economy,
    society,
    previousEcology,
    previousEconomy,
    previousSociety,
    round,
}: ScoreIndicatorProps) {
    const deltaEcology = previousEcology !== undefined ? ecology - previousEcology : 0;
    const deltaEconomy = previousEconomy !== undefined ? economy - previousEconomy : 0;
    const deltaSociety = previousSociety !== undefined ? society - previousSociety : 0;

    return (
        <div className="fixed top-0 left-0 right-0 z-[1000] bg-background/90 backdrop-blur-md border-b border-border/50 px-4 py-2 sm:py-3 shadow-sm">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 sm:gap-8">
                <div className="text-xs font-bold whitespace-nowrap flex-shrink-0 opacity-80">
                    Round {round} <span className="hidden sm:inline">of {MAX_DECISIONS}</span>
                    <span className="sm:hidden">/{MAX_DECISIONS}</span>
                </div>

                <div className="flex flex-1 gap-3 sm:gap-6 items-center">
                    {/* Ecology */}
                    <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-green-500 text-xs font-bold leading-none">
                            <span className="text-[10px] tracking-wider uppercase opacity-80 hidden md:block">Ecology</span>
                            <div className="flex items-center gap-1 w-full justify-end md:w-auto">
                                <Leaf className="h-3.5 w-3.5" />
                                <span>{ecology}%</span>
                                <DeltaIndicator delta={deltaEcology} showMinus={previousEcology !== undefined} />
                            </div>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-green-500/20 relative overflow-hidden">
                            <div className="absolute inset-y-0 left-0 bg-green-500 transition-all duration-700 ease-out" style={{ width: `${ecology}%` }} />
                        </div>
                    </div>

                    {/* Economy */}
                    <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-blue-500 text-xs font-bold leading-none">
                            <span className="text-[10px] tracking-wider uppercase opacity-80 hidden md:block">Economy</span>
                            <div className="flex items-center gap-1 w-full justify-end md:w-auto">
                                <Briefcase className="h-3.5 w-3.5" />
                                <span>{economy}%</span>
                                <DeltaIndicator delta={deltaEconomy} showMinus={previousEconomy !== undefined} />
                            </div>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-blue-500/20 relative overflow-hidden">
                            <div className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-700 ease-out" style={{ width: `${economy}%` }} />
                        </div>
                    </div>

                    {/* Society */}
                    <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-red-500 text-xs font-bold leading-none">
                            <span className="text-[10px] tracking-wider uppercase opacity-80 hidden md:block">Society</span>
                            <div className="flex items-center gap-1 w-full justify-end md:w-auto">
                                <Users className="h-3.5 w-3.5" />
                                <span>{society}%</span>
                                <DeltaIndicator delta={deltaSociety} showMinus={previousSociety !== undefined} />
                            </div>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-red-500/20 relative overflow-hidden">
                            <div className="absolute inset-y-0 left-0 bg-red-500 transition-all duration-700 ease-out" style={{ width: `${society}%` }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DeltaIndicator({ delta, showMinus }: { delta: number, showMinus: boolean }) {
    if (delta === 0) {
        return showMinus ? <Minus className="h-2.5 w-2.5 text-muted-foreground ml-0.5" /> : null;
    }
    
    const isPositive = delta > 0;
    return (
        <span className={`flex items-center text-[10px] font-medium ml-0.5 ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {isPositive ? <TrendingUp className="h-2.5 w-2.5 mr-[1px]" /> : <TrendingDown className="h-2.5 w-2.5 mr-[1px]" />}
            {isPositive ? "+" : ""}{delta}
        </span>
    );
}
