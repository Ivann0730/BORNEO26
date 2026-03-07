"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Award, RefreshCw, ArrowRight, AlertTriangle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import DecisionTreeView from "@/components/report/DecisionTreeView";
import ShareCard from "@/components/report/ShareCard";
import NameInput from "@/components/report/NameInput";
import type { ReportSession } from "@/types";

interface ReportPageClientProps {
    report: ReportSession;
}


function getScoreColor(score: number): string {
    if (score < 40) return "text-red-500";
    if (score < 70) return "text-amber";
    return "text-teal";
}

export default function ReportPageClient({ report: initial }: ReportPageClientProps) {
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
