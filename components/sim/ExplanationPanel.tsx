"use client";

import { MessageCircle, ArrowRight } from "lucide-react";
import ClimateTermTooltip from "./ClimateTermTooltip";
import type { ClimateTerm } from "@/types";

interface ExplanationPanelProps {
    explanation: string;
    climateTerms: ClimateTerm[];
    alternativeDecision?: string;
    onContinue: () => void;
    isLastRound: boolean;
    sectorName?: string;
    stepInfo?: { current: number; total: number };
}

function highlightTerms(text: string, terms: ClimateTerm[]) {
    if (terms.length === 0) return <span>{text}</span>;

    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    for (const term of terms) {
        const idx = remaining.toLowerCase().indexOf(term.term.toLowerCase());
        if (idx === -1) continue;

        if (idx > 0) {
            parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
        }

        parts.push(
            <ClimateTermTooltip key={key++} term={term.term} definition={term.definition}>
                {remaining.slice(idx, idx + term.term.length)}
            </ClimateTermTooltip>
        );

        remaining = remaining.slice(idx + term.term.length);
    }

    if (remaining) {
        parts.push(<span key={key++}>{remaining}</span>);
    }

    return <>{parts}</>;
}

export default function ExplanationPanel({
    explanation,
    climateTerms,
    alternativeDecision,
    onContinue,
    isLastRound,
    sectorName,
    stepInfo,
}: ExplanationPanelProps) {
    return (
        <div className="flex flex-col gap-4 w-full max-w-sm mx-auto sm:max-w-md animate-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-start gap-2">
                        <MessageCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                            {sectorName ? `Sector: ${sectorName}` : "What happened overall"}
                        </span>
                    </div>
                    {stepInfo && (
                        <span className="text-xs font-medium text-muted-foreground">
                            {stepInfo.current} / {stepInfo.total}
                        </span>
                    )}
                </div>
                <p className="text-sm leading-relaxed">
                    {highlightTerms(explanation, climateTerms)}
                </p>
            </div>

            {alternativeDecision && (
                <div className="rounded-xl border border-dashed border-accent/40 bg-accent/5 p-4">
                    <p className="text-xs font-medium text-accent mb-1">
                        Another approach
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {alternativeDecision}
                    </p>
                </div>
            )}

            <button
                onClick={onContinue}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-95"
            >
                {stepInfo?.current !== stepInfo?.total
                    ? "Next Effect"
                    : isLastRound
                    ? "See Your Report"
                    : "Next Decision"}
                <ArrowRight className="h-4 w-4" />
            </button>
        </div>
    );
}
