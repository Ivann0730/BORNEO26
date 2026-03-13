"use client";

import { useState } from "react";
import { Newspaper, ChevronDown } from "lucide-react";

interface HeadlineBannerProps {
    title: string;
    briefing: string;
}

export default function HeadlineBanner({ title, briefing }: HeadlineBannerProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="pointer-events-auto fixed top-[68px] left-0 right-0 z-[999] flex justify-center px-4">
            <div className="w-full max-w-2xl rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-lg overflow-hidden transition-all duration-300">
                <button
                    onClick={() => setIsOpen((v) => !v)}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left hover:bg-muted/40 transition-colors"
                >
                    <Newspaper className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-foreground truncate flex-1">
                        {title}
                    </span>
                    <ChevronDown
                        className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                </button>

                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[40vh] opacity-100" : "max-h-0 opacity-0"}`}
                >
                    <div className="px-4 pb-4 pt-1 border-t border-border/50">
                        <p className="text-xs font-semibold text-primary/70 uppercase tracking-wider mb-2">
                            Situation Briefing
                        </p>
                        <p className="text-sm leading-relaxed text-foreground/80 max-h-[30vh] overflow-y-auto pr-1">
                            {briefing}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
