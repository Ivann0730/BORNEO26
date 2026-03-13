"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Leaf, Briefcase, Users, AlertTriangle } from "lucide-react";
import type { DecisionResult, SectorStakeholder } from "@/types";

interface DecisionTreeViewProps {
    decisions: DecisionResult[];
    initialScore: number;
    initialEconomy?: number;
    initialSociety?: number;
    isFailed?: boolean;
    sectorStakeholders?: SectorStakeholder[]; // Used for emoji lookup if needed
}

export default function DecisionTreeView({
    decisions,
    initialScore, // initialEcology
    initialEconomy = 50,
    initialSociety = 50,
    isFailed = false,
    sectorStakeholders = [],
}: DecisionTreeViewProps) {
    const [expandedReactors, setExpandedReactors] = useState<Record<number, boolean>>({});

    const toggleReactor = (index: number) => {
        setExpandedReactors(prev => ({ ...prev, [index]: !prev[index] }));
    };

    // Calculate sparkline points
    const sparklineData = useMemo(() => {
        const points = [{ eco: initialScore, econ: initialEconomy, soc: initialSociety }];
        let currentEco = initialScore;
        let currentEcon = initialEconomy;
        let currentSoc = initialSociety;

        decisions.forEach(d => {
            currentEco = d.newEcology;
            currentEcon = d.newEconomy;
            currentSoc = d.newSociety ?? currentSoc; // Use newSociety if available, otherwise just carry forward
            points.push({ eco: currentEco, econ: currentEcon, soc: currentSoc });
        });
        return points;
    }, [initialScore, initialEconomy, initialSociety, decisions]);

    return (
        <div className="w-full flex flex-col gap-6 bg-card sm:p-6 p-4 rounded-2xl border border-border mt-2">
            
            {/* Sparkline Header */}
            <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-full px-8">
                    <span>Start</span>
                    <span>End</span>
                </div>
                <div className="relative w-full h-24 sm:h-32 bg-muted/20 border border-border/50 rounded-xl px-8 py-2 mb-4">
                    {/* Y-axis grid lines */}
                    <div className="absolute inset-x-8 top-1/4 border-t border-border/30 border-dashed" />
                    <div className="absolute inset-x-8 top-2/4 border-t border-border/30 border-dashed" />
                    <div className="absolute inset-x-8 top-3/4 border-t border-border/30 border-dashed" />
                    
                    {/* SVG Sparklines */}
                    <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                        {/* Ecology Line */}
                        <polyline fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={sparklineData.map((p, i) => `${(i / (sparklineData.length - 1)) * 100},${100 - p.eco}`).join(' ')} />
                        {/* Economy Line */}
                        <polyline fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 4" points={sparklineData.map((p, i) => `${(i / (sparklineData.length - 1)) * 100},${100 - p.econ}`).join(' ')} />
                        {/* Society Line */}
                        <polyline fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 4" points={sparklineData.map((p, i) => `${(i / (sparklineData.length - 1)) * 100},${100 - p.soc}`).join(' ')} />
                        
                        {/* Data Points */}
                        {sparklineData.map((p, i) => {
                            const cx = (i / (sparklineData.length - 1)) * 100;
                            return (
                                <g key={i}>
                                    <circle cx={cx} cy={100 - p.eco} r="1.5" fill="#10b981" />
                                    <circle cx={cx} cy={100 - p.econ} r="1.5" fill="#3b82f6" />
                                    <circle cx={cx} cy={100 - p.soc} r="1.5" fill="#f97316" />
                                </g>
                            );
                        })}
                    </svg>

                    {/* Round Indicators */}
                    <div className="absolute left-8 right-8 -bottom-5 flex justify-between text-[10px] font-bold text-muted-foreground/50">
                        {sparklineData.map((_, i) => (
                            <span key={i} className="flex justify-center w-4 -ml-2">{i === 0 ? "S" : i}</span>
                        ))}
                    </div>

                    {/* Sparkline Legend */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5 text-[9px] font-bold bg-card/80 backdrop-blur px-2 py-1.5 rounded border border-border/50">
                        <div className="text-emerald-500 flex items-center gap-1"><div className="w-2 h-0.5 bg-emerald-500" /> Ecology <span className="font-normal opacity-60 text-[7px]">Env. Health</span></div>
                        <div className="text-blue-500 flex items-center gap-1"><div className="w-2 h-0.5 bg-blue-500" style={{ borderBottom: '2px dashed currentColor' }} /> Economy <span className="font-normal opacity-60 text-[7px]">Fiscal Health</span></div>
                        <div className="text-orange-500 flex items-center gap-1"><div className="w-2 h-0.5 bg-orange-500" style={{ borderBottom: '2px dotted currentColor' }} /> Society <span className="font-normal opacity-60 text-[7px]">Public Trust</span></div>
                    </div>
                </div>
            </div>

            {/* Vertical Path */}
            <div className="relative ml-4 sm:ml-6 pl-6 sm:pl-8 flex flex-col gap-8 mt-4">
                {/* The Spine */}
                <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-border/50 -translate-x-1/2" />

                {decisions.map((d, i) => {
                    const isExpanded = expandedReactors[i];
                    // We check if "Ecological Drag" was likely active in this round
                    // To do this simply, we check if the previous round's ecology was < 30.
                    // For round 1, we use initialScore.
                    const prevEcology = i === 0 ? initialScore : decisions[i - 1].newEcology;
                    const distressActive = prevEcology < 30;

                    // Calculate society delta for this decision if we have it
                    // The old structure didn't always have it, but standard is `societyDelta`
                    const socDelta = d.societyDelta ?? 0;
                    
                    // Fallback to average of trustDelta if societyDelta not populated directly
                    const avgTrustDelta = d.affectedSectors && d.affectedSectors.length > 0 
                        ? Math.round(d.affectedSectors.reduce((acc, curr) => acc + curr.trustDelta, 0) / d.affectedSectors.length)
                        : 0;
                    
                    const finalSocDelta = d.societyDelta !== undefined ? d.societyDelta : avgTrustDelta;

                    return (
                        <div key={i} className="relative flex flex-col gap-2">
                            {/* Round Badge on Spine */}
                            <div className="absolute -left-6 sm:-left-8 -translate-x-1/2 top-4 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-card border-2 border-primary text-[10px] sm:text-xs font-black shadow-sm z-10 shrink-0">
                                R{d.round}
                            </div>

                            {/* Decision Card */}
                            <div className="bg-card border border-border rounded-xl shadow-sm text-sm p-4 sm:p-5 flex flex-col gap-3 relative overflow-hidden transition-colors hover:border-primary/30">
                                
                                {distressActive && (
                                    <div className="absolute top-0 right-0 bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-1 flex items-center gap-1 rounded-bl-lg border-b border-l border-red-500/20">
                                        <AlertTriangle className="h-3 w-3" />
                                        Ecological Drag
                                    </div>
                                )}

                                <p className="text-foreground/90 leading-relaxed font-medium pb-2 pr-16 sm:pr-0">
                                    {d.interpretation}
                                </p>

                                {/* Delta Pills */}
                                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-bold ${d.ecologyDelta >= 0 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"}`}>
                                        <Leaf className="h-3 w-3" />
                                        Ecology {d.ecologyDelta > 0 ? "+" : ""}{d.ecologyDelta}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-bold ${d.economyDelta >= 0 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"}`}>
                                        <Briefcase className="h-3 w-3" />
                                        Economy {d.economyDelta > 0 ? "+" : ""}{d.economyDelta}
                                    </span>
                                    {(finalSocDelta !== 0 || d.affectedSectors?.length > 0) && (
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-bold ${finalSocDelta >= 0 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"}`}>
                                            <Users className="h-3 w-3" />
                                            Society {finalSocDelta > 0 ? "+" : ""}{finalSocDelta}
                                        </span>
                                    )}
                                </div>
                                
                                {/* Who Reacted Row */}
                                {d.affectedSectors && d.affectedSectors.length > 0 && (
                                    <div className="mt-1 pt-2 border-t border-border/50">
                                        <button 
                                            onClick={() => toggleReactor(i)}
                                            className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>Who reacted</span>
                                                <div className="flex -space-x-1">
                                                    {d.affectedSectors.slice(0, 3).map((sec, idx) => {
                                                        const emoji = sectorStakeholders?.find(s => s.sectorId === sec.sector)?.avatarEmoji || "👤";
                                                        return (
                                                            <div key={idx} className="relative w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] group-hover:block transition-all shadow-sm">
                                                                {emoji}
                                                                <div className={`absolute -top-1 -right-1 text-[8px] font-bold px-1 rounded-full ${sec.trustDelta >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                                    {sec.trustDelta > 0 ? "+" : ""}{sec.trustDelta}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </button>

                                        {isExpanded && (
                                            <div className="flex flex-col gap-2 mt-3 pl-1 animate-in slide-in-from-top-2 duration-200">
                                                {d.affectedSectors.map((sec, idx) => {
                                                    const emoji = sectorStakeholders?.find(s => s.sectorId === sec.sector)?.avatarEmoji || "👤";
                                                    return (
                                                        <div key={idx} className="flex gap-2 p-2 rounded bg-muted/30 border border-border/30 text-xs text-foreground/80 leading-relaxed">
                                                            <span className="text-lg leading-none shrink-0">{emoji}</span>
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                                                                    <span className="uppercase tracking-wider text-[10px]">{sec.sector}</span>
                                                                    <span className={`${sec.trustDelta >= 0 ? "text-emerald-500" : "text-red-500"} text[10px]`}>
                                                                        {sec.trustDelta > 0 ? "+" : ""}{sec.trustDelta}
                                                                    </span>
                                                                </div>
                                                                <span className="italic">{sec.explanation}</span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
