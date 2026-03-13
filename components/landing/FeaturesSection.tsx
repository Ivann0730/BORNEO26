"use client";

import { useEffect, useRef, useState } from "react";
import {
    Globe,
    Layers3,
    Users,
    Zap,
    BarChart3,
    Share2,
} from "lucide-react";

const FEATURES = [
    {
        icon: Globe,
        title: "Real-World Headlines",
        description: "Every simulation starts with actual climate news — sourced live from ASEAN, not hypotheticals.",
        color: "text-cyan-400",
    },
    {
        icon: Layers3,
        title: "3D Mapbox Visualization",
        description: "Watch policies reshape the city in real time on a full 3D Mapbox map with animated zone effects.",
        color: "text-emerald-400",
    },
    {
        icon: Users,
        title: "Sector Stakeholders",
        description: "Track approval across 7 city sectors — residential, commercial, industrial, and more — as your decisions land.",
        color: "text-violet-400",
    },
    {
        icon: Zap,
        title: "AI-Powered Outcomes",
        description: "Gemini analyzes each decision for ecological, economic, and social impact — with nuanced sector-level consequences.",
        color: "text-amber-400",
    },
    {
        icon: BarChart3,
        title: "Prediction Scoring",
        description: "Test your climate intuition: predict which sectors will be impacted before you act, and get scored by AI.",
        color: "text-rose-400",
    },
    {
        icon: Share2,
        title: "Shareable Reports",
        description: "Get a detailed verdict, decision path timeline, and a unique shareable link to compare with classmates.",
        color: "text-sky-400",
    },
];

export default function FeaturesSection() {
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
            className="relative z-10 w-full max-w-5xl mx-auto px-4 py-16 sm:py-24"
        >
            <h2
                className="text-2xl sm:text-3xl font-bold text-center mb-4 tracking-tight"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
                Built for{" "}
                <span className="landing-gradient-text">Climate Literacy</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground text-center max-w-lg mx-auto mb-12">
                Every feature is designed to make learning about climate action tangible, immersive, and personal.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {FEATURES.map((feat, i) => (
                    <div
                        key={feat.title}
                        className={`
                            landing-fade-up rounded-2xl border border-border/40 dark:border-border/30
                            bg-card/40 dark:bg-card/30 backdrop-blur-sm p-5 sm:p-6
                            transition-all duration-300 hover:border-primary/30 hover:bg-card/60 hover:shadow-lg hover:shadow-primary/5
                            ${isVisible ? "opacity-100" : "opacity-0"}
                        `}
                        style={{ animationDelay: `${i * 100}ms` }}
                    >
                        <div className={`flex items-center justify-center h-10 w-10 rounded-lg bg-muted mb-3 ${feat.color}`}>
                            <feat.icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-sm mb-1.5">{feat.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {feat.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
