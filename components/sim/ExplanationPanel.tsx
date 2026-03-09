"use client";

import { useEffect, useState } from "react";
import { MessageCircle, ArrowRight, Users } from "lucide-react";
import ClimateTermTooltip from "./ClimateTermTooltip";
import type { ClimateTerm, SectorStakeholder } from "@/types";

interface ExplanationPanelProps {
    explanation: string;
    climateTerms: ClimateTerm[];
    alternativeDecision?: string;
    onContinue: () => void;
    isLastRound: boolean;
    sectorName?: string;
    stepInfo?: { current: number; total: number };

    // New props for persona
    persona?: SectorStakeholder;
    decisionText?: string;
    onStakeholderReact?: (sectorId: string, quote: string, delta: number) => void;

    // For summary panel
    allStakeholders?: SectorStakeholder[];
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
    persona,
    decisionText,
    onStakeholderReact,
    allStakeholders,
}: ExplanationPanelProps) {
    const [localQuote, setLocalQuote] = useState<string | null>(persona?.lastQuote || null);
    const [localDelta, setLocalDelta] = useState<number | null>(null);
    const [isLoadingQuote, setIsLoadingQuote] = useState(false);

    useEffect(() => {
        if (!persona || !sectorName || !decisionText || !onStakeholderReact) return;
        if (persona.lastQuote) {
            setLocalQuote(persona.lastQuote);
            return;
        }

        let isMounted = true;
        setIsLoadingQuote(true);

        fetch("/api/stakeholder-react", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sectorId: sectorName,
                personaName: persona.name,
                personaRole: persona.role,
                decision: decisionText,
                sectorOutcome: explanation,
                currentApproval: persona.approval
            })
        }).then(res => res.json())
            .then(data => {
                if (!isMounted) return;
                setLocalQuote(data.quote);
                setLocalDelta(data.approvalDelta);
                setIsLoadingQuote(false);
                onStakeholderReact(sectorName, data.quote, data.approvalDelta);
            })
            .catch(() => {
                if (!isMounted) return;
                setIsLoadingQuote(false);
            });

        return () => { isMounted = false; };
    }, [persona, sectorName, decisionText, explanation, onStakeholderReact]);

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

            {persona && (
                <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl bg-muted rounded-full w-12 h-12 flex items-center justify-center shrink-0">
                            {persona.avatarEmoji}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-foreground text-sm">{persona.name}</span>
                            <span className="text-xs text-muted-foreground">{persona.role}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-1">
                        <div className="flex justify-between text-xs font-medium px-0.5">
                            <span className="text-muted-foreground">Approval</span>
                            <span className="text-foreground flex items-center gap-1">
                                {localDelta !== null && (
                                    <span className={localDelta > 0 ? "text-emerald-500" : localDelta < 0 ? "text-red-500" : "text-muted-foreground"}>
                                        {localDelta > 0 ? "+" : ""}{localDelta}
                                    </span>
                                )}
                                {persona.approval}%
                            </span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ease-out ${persona.approval < 30 ? "bg-red-500" : persona.approval > 70 ? "bg-emerald-500" : "bg-primary"}`}
                                style={{ width: `${persona.approval}%` }}
                            />
                        </div>
                    </div>

                    <div className="mt-2 bg-muted/50 rounded-lg p-3 relative min-h-[60px] flex items-center">
                        {isLoadingQuote ? (
                            <div className="flex text-xs text-muted-foreground items-center gap-2 animate-pulse w-full justify-center">
                                <span className="w-2 h-2 rounded-full bg-primary/50" />
                                <span>Waiting for reaction...</span>
                            </div>
                        ) : localQuote ? (
                            <p className="text-sm text-foreground/90 italic font-medium">"{localQuote}"</p>
                        ) : (
                            <p className="text-sm text-muted-foreground italic text-center w-full">No comment.</p>
                        )}
                    </div>
                </div>
            )}

            {allStakeholders && allStakeholders.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <Users className="h-4 w-4 text-primary" />
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">Stakeholder Summary</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {allStakeholders.map(s => (
                            <div key={s.sectorId} className="flex items-center gap-2.5 bg-muted/40 rounded-lg p-2.5 border border-border/50 transition-colors hover:bg-muted/80">
                                <span className="text-2xl drop-shadow-sm shrink-0">{s.avatarEmoji}</span>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-xs font-semibold truncate leading-tight text-foreground/90">{s.name}</span>
                                    <span className="text-[10px] text-muted-foreground truncate leading-tight">{s.sectorId}</span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 pl-1">
                                    <div className={`w-1.5 h-1.5 rounded-full ${s.approval < 30 ? "bg-red-500" : s.approval > 70 ? "bg-emerald-500" : "bg-primary"}`} />
                                    <span className="font-mono text-xs font-bold w-7 text-right">
                                        {s.approval}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
