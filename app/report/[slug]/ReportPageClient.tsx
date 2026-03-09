"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Award, RefreshCw, ArrowRight, AlertTriangle, Users, Target, Activity, CheckCircle2, Coins } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import DecisionTreeView from "@/components/report/DecisionTreeView";
import ShareCard from "@/components/report/ShareCard";
import NameInput from "@/components/report/NameInput";
import type { ReportSession, PeerReport } from "@/types";

interface ReportPageClientProps {
    report: ReportSession;
    peerReports?: PeerReport[];
}


function getScoreColor(score: number): string {
    if (score < 40) return "text-red-500";
    if (score < 70) return "text-amber";
    return "text-teal";
}

export default function ReportPageClient({ report: initial, peerReports = [] }: ReportPageClientProps) {
    const [report, setReport] = useState(initial);
    const [showNameInput, setShowNameInput] = useState(!report.userName);

    const isFailed = report.finalScore <= 15;

    function handleNameSubmit(name: string) {
        setReport((prev) => ({ ...prev, userName: name }));
        setShowNameInput(false);
    }

    const initialScore = report.decisions.length > 0
        ? report.decisions[0].newScore - report.decisions[0].scoreDelta
        : report.finalScore;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="mx-auto max-w-2xl px-4 pt-20 pb-12 flex flex-col gap-8">
                {/* Header */}
                <div className="text-center flex flex-col gap-3">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{report.location.name}, {report.location.country}</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold leading-snug px-4">
                        {report.headline.title}
                    </h1>


                    {/* Score */}
                    <div className="flex items-center justify-center gap-2">
                        {isFailed ? (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                        ) : (
                            <Award className="h-5 w-5 text-primary" />
                        )}
                        <span className={`text-3xl font-bold ${getScoreColor(report.finalScore)}`}>
                            {report.finalScore}%
                        </span>
                    </div>

                    {isFailed && (
                        <p className="text-sm text-red-500 font-medium">
                            Community trust collapsed — simulation ended early.
                        </p>
                    )}

                    {report.verdict && (
                        <p className="text-sm text-muted-foreground italic max-w-md mx-auto">
                            {report.verdict}
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
                        initialScore={initialScore}
                        isFailed={isFailed}
                    />
                </section>

                {/* Policy Capital History */}
                {report.policyCapitalHistory && report.policyCapitalHistory.length > 0 && (
                    <section className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Coins className="h-5 w-5 text-amber-500" />
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                Policy Capital Usage
                            </h2>
                        </div>
                        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
                            <div className="flex items-end justify-between h-32 gap-2 mt-4 px-2">
                                {report.policyCapitalHistory.map((history, i) => {
                                    // Handle negative capital visually
                                    const isNegative = history.ending < 0;
                                    const positiveEndingHeight = isNegative ? 0 : Math.min(100, history.ending);
                                    const costHeight = Math.min(100, history.roundCost);
                                    const negativeHeight = isNegative ? Math.min(100, Math.abs(history.ending)) : 0;

                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-[120%] group relative">
                                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded shadow-sm whitespace-nowrap z-10 pointer-events-none text-center">
                                                Round {i + 1}<br />Cost: {history.roundCost}
                                            </div>

                                            <div className="w-full max-w-[40px] flex flex-col justify-end items-center h-full relative">
                                                {/* Zero line reference */}
                                                <div className="absolute w-[120%] h-px bg-border bottom-0 -z-10" />

                                                {/* Cost bar (Deducted this round) */}
                                                {costHeight > 0 && (
                                                    <div
                                                        className="w-full bg-red-400/20 border-x border-t border-red-500/30 rounded-t-sm animate-in fade-in slide-in-from-bottom"
                                                        style={{ height: `${costHeight}%`, marginBottom: isNegative ? '0' : '2px' }}
                                                    />
                                                )}

                                                {/* Remaining Positive Capital */}
                                                {positiveEndingHeight > 0 && (
                                                    <div
                                                        className="w-full bg-amber-500 rounded-sm rounded-t-none transition-all duration-500"
                                                        style={{ height: `${positiveEndingHeight}%` }}
                                                    />
                                                )}

                                                {/* Negative Capital (Debt) - drawn below the 0 line */}
                                                {isNegative && (
                                                    <div
                                                        className="w-full bg-red-500/50 rounded-b-sm rounded-t-none transition-all duration-500 mt-0.5 border-x border-b border-red-500/80"
                                                        style={{ height: `${negativeHeight}%`, position: 'absolute', top: '100%' }}
                                                    />
                                                )}
                                            </div>

                                            <span className={`text-xs font-semibold mt-2 ${isNegative ? 'mb-4' : ''} text-muted-foreground`}>R{i + 1}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-8 flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3">
                                <span>Starting: <span className="font-bold text-foreground">100</span></span>
                                <span>Ending: <span className={`font-bold ${report.policyCapitalHistory[report.policyCapitalHistory.length - 1].ending < 0 ? 'text-red-500' : 'text-foreground'}`}>{report.policyCapitalHistory[report.policyCapitalHistory.length - 1].ending}</span></span>
                            </div>
                        </div>
                    </section>
                )}

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
                                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                                            <span className="text-sm font-medium">{sector}</span>
                                        </div>
                                    ))}
                                </div>
                                {report.predictionRisk && (
                                    <div className="mt-2 pt-3 border-t border-border/50">
                                        <h4 className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">Predicted Risk</h4>
                                        <p className="text-sm italic text-foreground/80">"{report.predictionRisk}"</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-3 bg-card p-5 rounded-2xl border border-border shadow-sm">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">Actual Impact (By Frequency)</h3>
                                <div className="flex flex-col gap-2">
                                    {(() => {
                                        const actualImpacts = report.decisions.flatMap(d => d.affectedSectors.map(s => s.sector));
                                        const impactCounts = actualImpacts.reduce((acc, sector) => {
                                            acc[sector] = (acc[sector] || 0) + 1;
                                            return acc;
                                        }, {} as Record<string, number>);
                                        const actualTop3 = Object.entries(impactCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);

                                        if (actualTop3.length === 0) {
                                            return <span className="text-sm text-muted-foreground italic py-2">No sectors impacted during this simulation.</span>;
                                        }

                                        return actualTop3.map((sector, i) => {
                                            const wasPredicted = report.predictionRanking?.includes(sector);
                                            return (
                                                <div key={sector} className="flex items-center gap-3 bg-muted/30 p-2 rounded-lg border border-border/50">
                                                    <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                                                    <span className="text-sm font-medium">{sector}</span>
                                                    {wasPredicted && (
                                                        <span className="ml-auto text-xs bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                                                            <CheckCircle2 className="h-3 w-3" /> Predicted
                                                        </span>
                                                    )}
                                                </div>
                                            )
                                        });
                                    })()}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* People Involved (Personas) */}
                {report.sectorStakeholders && report.sectorStakeholders.length > 0 && (
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="h-5 w-5 text-primary" />
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                How your decisions affected the people involved
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {report.sectorStakeholders.sort((a, b) => b.approval - a.approval).map(s => (
                                <div key={s.sectorId} className="flex flex-col bg-card rounded-2xl border border-border p-4 shadow-sm gap-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl shrink-0">{s.avatarEmoji}</span>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="text-sm font-bold truncate leading-tight">{s.name}</span>
                                            <span className="text-xs text-muted-foreground truncate leading-tight">{s.role}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${s.approval < 30 ? "bg-red-500" : s.approval > 70 ? "bg-emerald-500" : "bg-primary"}`}
                                                style={{ width: `${s.approval}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-mono font-bold w-8 text-right">{s.approval}%</span>
                                    </div>
                                    {s.lastQuote && (
                                        <p className="text-xs italic text-foreground/80 bg-muted/40 p-2.5 rounded-lg border border-border/50">
                                            "{s.lastQuote}"
                                        </p>
                                    )}
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
                                        style={{ left: `${Math.max(5, Math.min(95, p.final_score))}%`, bottom: `${Math.max(5, Math.min(95, p.final_satisfaction))}%` }}
                                        title={`Peer: Score ${p.final_score}%, Satisfaction ${p.final_satisfaction}%, ${p.decision_count} decisions`}
                                    />
                                ))}

                                {/* User Dot */}
                                <div
                                    className="absolute w-4 h-4 rounded-full bg-primary border-2 border-background shadow-[0_0_10px_rgba(20,184,166,0.6)] -ml-2 -mb-2 z-20 transition-transform hover:scale-125"
                                    style={{ left: `${Math.max(5, Math.min(95, report.finalScore))}%`, bottom: `${Math.max(5, Math.min(95, report.decisions[report.decisions.length - 1]?.newSatisfaction ?? 50))}%` }}
                                >
                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                                        You ({report.finalScore}%)
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col gap-2">
                                <h4 className="text-xs font-semibold uppercase text-muted-foreground">Peer Decision Approaches</h4>
                                <ul className="text-xs text-foreground/80 space-y-2 list-disc list-inside">
                                    {peerReports.slice(0, 3).map((p, i) => (
                                        <li key={i} className="leading-relaxed">
                                            A peer who scored <span className="font-semibold text-foreground">{p.final_score}%</span> made {p.decision_count} decisions, starting with: <span className="italic">"{p.decisions_summary[0]}..."</span>
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
