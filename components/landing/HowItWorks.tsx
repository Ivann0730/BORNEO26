"use client";

import { useState, useEffect } from "react";
import { MapPin, Newspaper, Gavel } from "lucide-react";

const STEPS = [
    {
        icon: MapPin,
        label: "Drop a Pin",
        description: "Tap anywhere on the ASEAN map to pick a location — or search for a city.",
    },
    {
        icon: Newspaper,
        label: "Read the Headline",
        description: "We surface real climate news happening right now in your chosen area.",
    },
    {
        icon: Gavel,
        label: "Make the Call",
        description: "Choose policies across 3 rounds and watch your decisions change the map.",
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
            className="relative z-10 w-full max-w-4xl mx-auto px-4 py-20 sm:py-28"
        >
            <h2
                className="text-2xl sm:text-3xl font-bold text-center mb-12 tracking-tight"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
                How It Works
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {STEPS.map((step, i) => {
                    const isActive = i === active;
                    return (
                        <button
                            key={i}
                            onClick={() => setActive(i)}
                            className={`
                                group relative flex flex-col items-center text-center gap-4
                                rounded-2xl border p-6 sm:p-8 transition-all duration-300 cursor-pointer
                                ${isActive
                                    ? "border-primary/50 bg-primary/5 dark:bg-primary/10 shadow-lg shadow-primary/10 scale-[1.02]"
                                    : "border-border bg-card/50 dark:bg-card/30 hover:border-primary/20 hover:bg-card/70"
                                }
                            `}
                        >
                            {/* Step number */}
                            <span
                                className={`
                                    absolute -top-3 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest
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
                                    flex items-center justify-center h-14 w-14 rounded-xl transition-colors
                                    ${isActive
                                        ? "bg-primary/15 dark:bg-primary/20 text-primary"
                                        : "bg-muted text-muted-foreground"
                                    }
                                `}
                            >
                                <step.icon className="h-7 w-7" />
                            </div>

                            {/* Label */}
                            <h3 className="font-bold text-base flex items-center gap-1.5">
                                {step.label}
                                {isActive && (
                                    <span className="landing-blink text-primary text-lg">▎</span>
                                )}
                            </h3>

                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {step.description}
                            </p>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
