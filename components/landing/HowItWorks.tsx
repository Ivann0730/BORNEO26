"use client";

import { useState, useEffect } from "react";
import { MapPin, Newspaper, Brain, Gavel, FileBarChart } from "lucide-react";

const STEPS = [
    {
        icon: MapPin,
        label: "Drop a Pin",
        description: "Tap anywhere on the ASEAN map or search for a city to anchor your simulation.",
    },
    {
        icon: Newspaper,
        label: "Read the Headline",
        description: "We surface real climate news happening right now in your chosen area — flooding, heatwaves, deforestation — powered by live data.",
    },
    {
        icon: Brain,
        label: "Make Your Prediction",
        description: "Before any action, predict which sectors will be impacted most. Your foresight is scored by AI at the end.",
    },
    {
        icon: Gavel,
        label: "Decide Across 5 Rounds",
        description: "Allocate policy, funding, and resources each round. Watch 3D arrows and map effects visualize your impact in real time.",
    },
    {
        icon: FileBarChart,
        label: "Get Your Report Card",
        description: "Receive an AI-generated verdict, sector-by-sector breakdown, and a shareable report — see how you compare with peers.",
    },
];

const CYCLE_MS = 4000;

export default function HowItWorks() {
    const [active, setActive] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActive((prev) => (prev + 1) % STEPS.length);
        }, CYCLE_MS);
        return () => clearInterval(timer);
    }, []);

    return (
        <section
            id="how-it-works"
            className="relative z-10 w-full max-w-5xl mx-auto px-4 py-20 sm:py-28"
        >
            <h2
                className="text-2xl sm:text-3xl font-bold text-center mb-4 tracking-tight"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
                How It Works
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground text-center max-w-xl mx-auto mb-12">
                Five steps from curiosity to climate literacy.
            </p>

            {/* Timeline connector */}
            <div className="relative">
                {/* Horizontal connector line (desktop only) */}
                <div className="hidden sm:block absolute top-6 left-[10%] right-[10%] h-px bg-border/40 z-0" />

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-3">
                    {STEPS.map((step, i) => {
                        const isActive = i === active;
                        return (
                            <button
                                key={i}
                                onClick={() => setActive(i)}
                                className={`
                                    group relative flex flex-col items-center text-center gap-3
                                    rounded-2xl border p-4 sm:p-5 transition-all duration-300 cursor-pointer
                                    ${isActive
                                        ? "border-primary/50 bg-primary/5 dark:bg-primary/10 shadow-lg shadow-primary/10 scale-[1.03]"
                                        : "border-border bg-card/50 dark:bg-card/30 hover:border-primary/20 hover:bg-card/70"
                                    }
                                `}
                            >
                                {/* Step number */}
                                <span
                                    className={`
                                        absolute -top-2.5 left-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest
                                        ${isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground"
                                        }
                                    `}
                                >
                                    Step {i + 1}
                                </span>

                                {/* Icon */}
                                <div
                                    className={`
                                        flex items-center justify-center h-12 w-12 rounded-xl transition-colors
                                        ${isActive
                                            ? "bg-primary/15 dark:bg-primary/20 text-primary"
                                            : "bg-muted text-muted-foreground"
                                        }
                                    `}
                                >
                                    <step.icon className="h-6 w-6" />
                                </div>

                                {/* Label */}
                                <h3 className="font-bold text-sm flex items-center gap-1">
                                    {step.label}
                                    {isActive && (
                                        <span className="landing-blink text-primary text-base">▎</span>
                                    )}
                                </h3>

                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {step.description}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
