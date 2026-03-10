"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
    { value: 12, suffix: "", label: "Countries" },
    { value: 50, suffix: "+", label: "Scenarios" },
    { value: 100, suffix: "+", label: "Schools" },
    { value: 10, suffix: "k+", label: "Students" },
];

function useCountUp(target: number, isVisible: boolean) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isVisible) return;
        let frame: number;
        const start = performance.now();
        const duration = 1600;

        function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setCount(Math.round(eased * target));
            if (progress < 1) frame = requestAnimationFrame(tick);
        }

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [target, isVisible]);

    return count;
}

function StatItem({ value, suffix, label, isVisible, delay }: {
    value: number;
    suffix: string;
    label: string;
    isVisible: boolean;
    delay: number;
}) {
    const count = useCountUp(value, isVisible);

    return (
        <div
            className="landing-fade-up flex flex-col items-center gap-1"
            style={{ animationDelay: `${delay}ms` }}
        >
            <span
                className="text-3xl sm:text-4xl font-bold text-primary tracking-tight"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
                {count}{suffix}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground font-medium tracking-wide uppercase">
                {label}
            </span>
        </div>
    );
}

export default function StatsBar() {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold: 0.3 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className="relative z-10 w-full max-w-3xl mx-auto px-4"
        >
            <div className="rounded-2xl border border-border/40 dark:border-border/30 bg-card/40 dark:bg-card/30 backdrop-blur-md shadow-xl p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
                {STATS.map((stat, i) => (
                    <StatItem
                        key={stat.label}
                        value={stat.value}
                        suffix={stat.suffix}
                        label={stat.label}
                        isVisible={isVisible}
                        delay={i * 150}
                    />
                ))}
            </div>
        </div>
    );
}
