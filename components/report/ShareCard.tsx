"use client";

import { useRef } from "react";
import html2canvas from "html2canvas";
import { Download, Link2, Award } from "lucide-react";
import type { ReportSession } from "@/types";

interface ShareCardProps {
    report: ReportSession;
}

function getScoreLabel(score: number): string {
    if (score >= 80) return "Climate Champion";
    if (score >= 60) return "Thoughtful Leader";
    if (score >= 40) return "Learning Leader";
    return "Getting Started";
}

export default function ShareCard({ report }: ShareCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    async function handleDownload() {
        if (!cardRef.current) return;
        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 2,
                backgroundColor: null,
            });
            const link = document.createElement("a");
            link.download = `stemma-${report.slug}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch (err) {
            console.error("Screenshot failed:", err);
        }
    }

    async function handleCopyLink() {
        const url = `${window.location.origin}/report/${report.slug}`;
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            // fallback: no clipboard
        }
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Capture target */}
            <div
                ref={cardRef}
                className="relative w-full max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-accent/80 p-6 flex flex-col justify-between text-white"
            >
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80">
                        Stemma
                    </p>
                    <p className="text-lg font-bold mt-2 leading-snug">
                        {report.headline.title}
                    </p>
                    <p className="text-xs opacity-70 mt-1">
                        {report.location.name}, {report.location.country}
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    {report.userName && (
                        <p className="text-sm font-semibold">{report.userName}</p>
                    )}
                    <div className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        <span className="text-2xl font-bold">
                            {report.finalScore}%
                        </span>
                    </div>
                    <p className="text-xs font-medium">
                        {getScoreLabel(report.finalScore)}
                    </p>
                    {report.verdict && (
                        <p className="text-xs opacity-80 italic mt-1">
                            {report.verdict}
                        </p>
                    )}
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 justify-center">
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-95"
                >
                    <Download className="h-4 w-4" />
                    Save Image
                </button>
                <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-all hover:bg-muted active:scale-95"
                >
                    <Link2 className="h-4 w-4" />
                    Copy Link
                </button>
            </div>
        </div>
    );
}
