"use client";

import { useEffect, useRef, useState } from "react";
import { Brain, ArrowUpDown, MessageSquareText } from "lucide-react";

const PILLARS = [
    {
        icon: Brain,
        label: "Prediction Accuracy",
        description: "Before making decisions, you predict which sectors will be impacted. AI scores your foresight at the end.",
        example: "\"I predicted Residential, Commercial, and Industrial — AI scored me 2/3.\"",
    },
    {
        icon: ArrowUpDown,
        label: "Triple Pillar Balance",
        description: "Every round, your policies shift three real-time scores — Ecology, Economy, and Society. The goal is a delicate equilibrium.",
        example: "\"Ecology ↑15 but Economy ↓10 — was it worth it?\"",
    },
    {
        icon: MessageSquareText,
        label: "AI Verdict & Report",
        description: "After 5 rounds, Gemini generates a personalized verdict analyzing your strategy, trade-offs, and sector-by-sector outcomes.",
        example: "\"You prioritized ecology but left economy vulnerable — a classic green paradox.\"",
    },
];

export default function EvaluationSection() {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold: 0.15 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={ref}
            className="relative z-10 w-full max-w-4xl mx-auto px-4 py-16 sm:py-24"
        >
            <h2
                className="text-2xl sm:text-3xl font-bold text-center mb-4 tracking-tight"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
                How You&apos;re{" "}
                <span className="landing-gradient-text">Evaluated</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground text-center max-w-lg mx-auto mb-12">
                No quizzes. No multiple choice. Your decisions <em>are</em> the test.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PILLARS.map((pillar, i) => (
                    <div
                        key={pillar.label}
                        className={`
                            landing-fade-up rounded-2xl border border-border/40 dark:border-border/30
                            bg-card/40 dark:bg-card/30 backdrop-blur-sm p-5 sm:p-6
                            flex flex-col gap-3
                            ${isVisible ? "opacity-100" : "opacity-0"}
                        `}
                        style={{ animationDelay: `${i * 150}ms` }}
                    >
                        <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-primary/10 text-primary">
                            <pillar.icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-sm">{pillar.label}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {pillar.description}
                        </p>
                        <div className="mt-auto pt-2 border-t border-border/20">
                            <p className="text-[11px] text-muted-foreground/70 italic leading-relaxed">
                                {pillar.example}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
