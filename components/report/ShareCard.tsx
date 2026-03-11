"use client";

import { useRef } from "react";
import html2canvas from "html2canvas";
import { Download, Link2, Leaf, Briefcase, Users } from "lucide-react";
import type { ReportSession } from "@/types";

interface ShareCardProps {
    report: ReportSession;
}

function getEcologyColor(val: number): string {
    if (val <= 30) return "text-red-400";
    if (val <= 60) return "text-amber-400";
    return "text-green-400";
}

function getEconomyColor(val: number): string {
    if (val <= 10) return "text-red-400";
    if (val <= 40) return "text-amber-400";
    return "text-blue-400";
}

function getSocietyColor(val: number): string {
    if (val <= 15) return "text-red-400";
    if (val <= 45) return "text-amber-400";
    return "text-orange-400";
}

export default function ShareCard({ report }: ShareCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    async function handleDownload() {
        if (!cardRef.current) return;
        try {
            // BUG-02: use useCORS + allowTaint for cross-origin safety
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                allowTaint: false,
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
            {/* Capture target — self-contained, no map tiles */}
            <div
                ref={cardRef}
                className="relative w-full max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#0d1b2a] via-[#1b2a3b] to-[#14B8A6]/40 p-6 flex flex-col justify-between text-white"
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
                    <div className="flex items-center gap-2">
                        {report.userName && (
                            <p className="text-sm font-semibold">
                                {report.userName}
                            </p>
                        )}
                    </div>
                    {/* Ecology */}
                    <div className="flex items-center gap-2">
                        <Leaf className={`h-4 w-4 ${getEcologyColor(report.finalEcology)}`} />
                        <span className="text-xl font-bold">
                            {report.finalEcology}%
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 ml-0.5">Ecology</span>
                    </div>
                    {/* Economy */}
                    <div className="flex items-center gap-2">
                        <Briefcase className={`h-4 w-4 ${getEconomyColor(report.finalEconomy)}`} />
                        <span className="text-xl font-bold">
                            {report.finalEconomy}%
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 ml-0.5">Economy</span>
                    </div>
                    {/* Society */}
                    <div className="flex items-center gap-2">
                        <Users className={`h-4 w-4 ${getSocietyColor(report.finalSociety)}`} />
                        <span className="text-xl font-bold">
                            {report.finalSociety}%
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 ml-0.5">Society</span>
                    </div>
                    {report.verdict && (
                        <p className="text-xs opacity-80 italic mt-3 leading-snug">
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
