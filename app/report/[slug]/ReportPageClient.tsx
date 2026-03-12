"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Award, RefreshCw, ArrowRight, AlertTriangle, Users, Target, Activity, CheckCircle2, Leaf, Briefcase } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import DecisionTreeView from "@/components/report/DecisionTreeView";
import ShareCard from "@/components/report/ShareCard";
import NameInput from "@/components/report/NameInput";
import type { ReportSession, PeerReport } from "@/types";

interface ReportPageClientProps {
    report: ReportSession;
    peerReports?: PeerReport[];
}

function getEcologyColor(val: number): string {
    if (val <= 30) return "text-red-500";
    if (val <= 60) return "text-amber-500";
    return "text-green-500";
}

function getEconomyColor(val: number): string {
    if (val <= 10) return "text-red-500";
    if (val <= 40) return "text-amber-500";
    return "text-blue-500";
}

function getSocietyColor(val: number): string {
    if (val <= 15) return "text-red-500";
    if (val <= 45) return "text-amber-500";
    return "text-orange-500";
}

export default function ReportPageClient({ report: initial, peerReports = [] }: ReportPageClientProps) {
    const [report, setReport] = useState(initial);
    const [showNameInput, setShowNameInput] = useState(!report.userName);

    const isFailed = report.finalSociety <= 15 || report.finalEconomy <= 10;

    function handleNameSubmit(name: string) {
        setReport((prev) => ({ ...prev, userName: name }));
        setShowNameInput(false);
    }

    const initialEcology = report.decisions.length > 0
        ? report.decisions[0].newEcology - report.decisions[0].ecologyDelta
        : report.finalEcology;

    // Handle parsing the verdict, since it might now be stringified JSON {"verdict": "...", "postMortem": "..."}
    let parsedVerdict = { verdict: report.verdict, postMortem: report.postMortem || "" };
    if (report.verdict) {
        let cleanVerdict = report.verdict.replace(/```(?:json)?/g, "").trim();
        if (cleanVerdict.startsWith("{")) {
            try {
                const parsed = JSON.parse(cleanVerdict);
                parsedVerdict = {
                    verdict: parsed.verdict || report.verdict,
                    postMortem: parsed.postMortem || report.postMortem || "",
                };
            } catch (e) {
                console.error("Failed to parse verdict JSON:", e);
            }
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="mx-auto max-w-2xl px-4 pt-20 pb-12 flex flex-col gap-8">
                {/* Header */}
                <div className="text-center flex flex-col gap-3">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>
                            {typeof report.location === 'string'
                                ? report.location
                                : `${report.location?.name || 'Unknown Location'}${report.location?.country ? `, ${report.location.country}` : ''}`}
                        </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold leading-snug px-4">
                        {report.headline.title}
                    </h1>


                    {/* Scores */}
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-2">
                        {/* Ecology */}
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2">
                                <Leaf className="h-5 w-5 text-green-500" />
                                <span className={`text-2xl font-bold ${getEcologyColor(report.finalEcology)}`}>
                                    {report.finalEcology}%
                                </span>
                            </div>
                            <span className="text-[10px] text-green-500/70 font-semibold uppercase tracking-wider">Ecology</span>
                            <span className="text-[9px] text-muted-foreground -mt-0.5">Environmental Health</span>
                        </div>
                        {/* Economy */}
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2">
                                {report.finalEconomy <= 10 ? (
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                ) : (
                                    <Briefcase className="h-5 w-5 text-blue-500" />
                                )}
                                <span className={`text-2xl font-bold ${getEconomyColor(report.finalEconomy)}`}>
                                    {report.finalEconomy}%
                                </span>
                            </div>
                            <span className="text-[10px] text-blue-500/70 font-semibold uppercase tracking-wider">Economy</span>
                            <span className="text-[9px] text-muted-foreground -mt-0.5">City Fiscal Health</span>
                        </div>
                        {/* Society */}
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2">
                                {report.finalSociety <= 15 ? (
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                ) : (
                                    <Users className="h-5 w-5 text-orange-500" />
                                )}
                                <span className={`text-2xl font-bold ${getSocietyColor(report.finalSociety)}`}>
                                    {report.finalSociety}%
                                </span>
                            </div>
                            <span className="text-[10px] text-orange-500/70 font-semibold uppercase tracking-wider">Society</span>
                            <span className="text-[9px] text-muted-foreground -mt-0.5">Public Trust</span>
                        </div>
                    </div>

                    {isFailed && (
                        <p className="text-sm text-red-500 font-medium">
                            Community trust collapsed — simulation ended early.
                        </p>
                    )}

                    {parsedVerdict.verdict && (
                        <p className="text-sm text-muted-foreground italic max-w-md mx-auto">
                            {parsedVerdict.verdict}
                        </p>
                    )}
                </div>

                {/* Name input */}
                {showNameInput && <NameInput onSubmit={handleNameSubmit} />}

                {/* Decision tree */}
                <section className="flex flex-col gap-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Your Decision Path
                    </h2>
                    <DecisionTreeView
                        decisions={report.decisions}
                        initialScore={initialEcology}
                        initialEconomy={report.decisions.length > 0 ? report.decisions[0].newEconomy - report.decisions[0].economyDelta : report.finalEconomy}
                        initialSociety={report.decisions.length > 0 ? report.decisions[0].newSociety !== undefined && report.decisions[0].societyDelta !== undefined ? report.decisions[0].newSociety - report.decisions[0].societyDelta : 50 : report.finalSociety}
                        isFailed={isFailed}
                        sectorStakeholders={report.sectorStakeholders}
                    />
                    
                    {parsedVerdict.postMortem && (
                        <div className="bg-card border border-primary/20 p-5 sm:p-6 rounded-2xl shadow-sm relative overflow-hidden mt-4">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <Activity className="w-24 h-24" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3 flex items-center gap-2">
                                <Target className="h-4 w-4 text-primary" />
                                What could you have done differently? (Post-Mortem Reflection)
                            </h3>
                            <p className="text-foreground/80 leading-relaxed text-sm">{parsedVerdict.postMortem}</p>
                        </div>
                    )}
                </section>

                {/* Predictions vs Reality */}
                {report.predictionRanking && report.predictionRanking.length > 0 && (
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Target className="h-5 w-5 text-accent" />
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                Your Predictions vs Reality
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-3 bg-card p-5 rounded-2xl border border-border shadow-sm">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">Your Predicted Top 3</h3>
                                <div className="flex flex-col gap-2">
                                    {report.predictionRanking.map((sector, i) => (
                                        <div key={sector} className="flex items-center gap-3 bg-muted/30 p-2 rounded-lg border border-border/50">
                                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                                            <span className="text-sm font-medium">{sector}</span>
                                        </div>
                                    ))}
                                </div>
                                {report.predictionRisk && (
                                    <div className="mt-2 pt-3 border-t border-border/50">
                                        <h4 className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">Predicted Risk</h4>
                                        <p className="text-sm italic text-foreground/80 leading-snug">{report.predictionRisk}</p>
                                    </div>
                                )}

                            </div>
                            <div className="flex flex-col gap-3 bg-card p-5 rounded-2xl border border-border shadow-sm">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">Actual Impact</h3>
                                <div className="flex flex-col gap-3">
                                    {report.predictionEvaluation?.actualTop3 ? (
                                        report.predictionEvaluation.actualTop3.map(({ sector, explanation }, i) => {
                                            const wasPredicted = report.predictionRanking?.includes(sector);
                                            return (
                                                <div key={sector} className="flex flex-col gap-2 bg-muted/30 p-3 rounded-lg border border-border/50">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                                                        <span className="text-sm font-semibold">{sector}</span>
                                                        {wasPredicted && (
                                                            <span className="ml-auto text-[9px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 uppercase tracking-wider">
                                                                <CheckCircle2 className="h-2.5 w-2.5" /> Matched
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                                                        {explanation}
                                                    </p>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <span className="text-sm text-muted-foreground italic py-2">No evaluation data available.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {report.predictionEvaluation && (
                            <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Evaluation Score</h3>
                                    <span className={`text-xl font-black ${report.predictionEvaluation.score >= 70 ? "text-emerald-500" : report.predictionEvaluation.score >= 40 ? "text-amber-500" : "text-red-500"}`}>{report.predictionEvaluation.score}/100</span>
                                </div>
                                <p className="text-sm italic text-foreground/80 leading-relaxed">{report.predictionEvaluation.feedback}</p>
                            </div>
                        )}
                    </section>
                )}

                {/* Impacted Sectors Detail */}
                {report.sectorStakeholders && report.sectorStakeholders.length > 0 && (
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="h-5 w-5 text-primary" />
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                Detailed Sector Analysis
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {report.sectorStakeholders.sort((a, b) => b.approval - a.approval).map(s => (
                                <div key={s.sectorId} className="flex flex-col bg-card rounded-2xl border border-border p-5 shadow-sm gap-4 transition-all hover:border-primary/30">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl shrink-0">{s.avatarEmoji}</span>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-lg font-bold leading-tight uppercase tracking-tight text-foreground">{s.sectorId}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-2">
                                                {(() => {
                                                    const initial = s.initialApproval ?? 50;
                                                    const delta = Math.round(s.approval - initial);
                                                    if (delta === 0) return null;
                                                    return (
                                                        <span className={`text-xs font-bold ${delta > 0 ? "text-emerald-500" : "text-red-500"}`}>
                                                            {delta > 0 ? "+" : ""}{delta}%
                                                        </span>
                                                    );
                                                })()}
                                                <span className={`text-xl font-mono font-black ${s.approval < 30 ? "text-red-500" : s.approval > 70 ? "text-emerald-500" : "text-primary"}`}>
                                                    {s.approval}%
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase">Sector Trust</span>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${s.approval < 30 ? "bg-red-500" : s.approval > 70 ? "bg-emerald-500" : "bg-primary"}`}
                                            style={{ width: `${s.approval}%` }}
                                        />
                                    </div>

                                    {s.quotes && s.quotes.length > 0 ? (
                                        <div className="flex flex-col gap-2 mt-2">
                                            <h4 className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Overall Impact</h4>
                                            <div className="bg-muted/40 p-3 rounded-xl border border-border/50 relative">
                                                <p className="text-xs italic leading-relaxed text-foreground/90">
                                                    {s.quotes[s.quotes.length - 1]}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (s as any).lastQuote ? (
                                        <div className="flex flex-col gap-2 mt-2">
                                            <h4 className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Overall Impact</h4>
                                            <div className="bg-muted/40 p-3 rounded-xl border border-border/50 relative">
                                                <p className="text-xs italic leading-relaxed text-foreground/90">
                                                    {(s as any).lastQuote}
                                                </p>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Peer Comparison */}
                {peerReports && peerReports.length > 0 && (
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Activity className="h-5 w-5 text-teal-500" />
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                How Others Decided
                            </h2>
                        </div>
                        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
                            <p className="text-sm text-foreground mb-4">You and {peerReports.length} others faced this exact scenario. Here is how your scores compare.</p>

                            {/* Simple SVG Scatter Plot */}
                            <div className="w-full aspect-[2/1] bg-muted/20 border-l border-b border-border relative mt-4 rounded-tr-lg rounded-br-none pb-2 pr-2">
                                {/* Axis labels */}
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Overall Score</div>
                                <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-muted-foreground uppercase font-bold tracking-wider origin-center whitespace-nowrap">Satisfaction</div>

                                {/* Grid lines */}
                                <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none">
                                    {Array.from({ length: 16 }).map((_, i) => (
                                        <div key={i} className="border-r border-t border-border/30 border-dashed" />
                                    ))}
                                </div>

                                {/* Peer Dots */}
                                {peerReports.map((p, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-3 h-3 rounded-full bg-muted-foreground/40 border border-background -ml-1.5 -mb-1.5 peer-dot group transition-transform hover:scale-150 hover:bg-muted-foreground hover:z-10"
                                        style={{ left: `${Math.max(5, Math.min(95, p.final_economy))}%`, bottom: `${Math.max(5, Math.min(95, p.final_ecology))}%` }}
                                        title={`Peer: Ecology ${p.final_ecology}%, Economy ${p.final_economy}%`}
                                    />
                                ))}

                                {/* User Dot */}
                                <div
                                    className="absolute w-4 h-4 rounded-full bg-primary border-2 border-background shadow-[0_0_10px_rgba(20,184,166,0.6)] -ml-2 -mb-2 z-20 transition-transform hover:scale-125"
                                    style={{ left: `${Math.max(5, Math.min(95, report.finalEconomy))}%`, bottom: `${Math.max(5, Math.min(95, report.finalEcology))}%` }}
                                >
                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                                        You
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col gap-2">
                                <h4 className="text-xs font-semibold uppercase text-muted-foreground">Peer Decision Approaches</h4>
                                <ul className="text-xs text-foreground/80 space-y-2 list-disc list-inside">
                                    {peerReports.slice(0, 3).map((p, i) => (
                                        <li key={i} className="leading-relaxed">
                                            A peer who scored <span className="font-semibold text-foreground">{p.final_society}%</span> in Society made {p.decision_count} decisions, starting with: <span className="italic">{p.decisions_summary[0]}...</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>
                )}

                {/* Share card */}
                <section className="flex flex-col gap-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Share Your Results
                    </h2>
                    <ShareCard report={report} />
                </section>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                    <Link
                        href="/sim"
                        className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-95"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Play Again
                    </Link>
                    <Link
                        href="/"
                        className="flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold transition-all hover:bg-muted active:scale-95"
                    >
                        Home
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </main>
        </div>
    );
}
