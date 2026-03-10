import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function BottomCTA() {
    return (
        <>
            {/* Emotional hook */}
            <section className="relative z-10 w-full max-w-2xl mx-auto px-4 py-20 sm:py-28 text-center">
                <p className="text-lg sm:text-xl md:text-2xl font-semibold text-muted-foreground leading-relaxed mb-4">
                    Climate change isn&apos;t a future problem.
                </p>
                <p
                    className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-10"
                    style={{ fontFamily: "var(--font-display), sans-serif" }}
                >
                    It&apos;s happening{" "}
                    <span className="landing-gradient-text">right now.</span>
                </p>
                <Link
                    href="/sim"
                    className="landing-cta-glow inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-all hover:brightness-110 hover:scale-105 active:scale-95"
                >
                    Launch the Simulator
                    <ArrowRight className="h-5 w-5" />
                </Link>
            </section>

            {/* Footer */}
            <footer className="relative z-10 w-full border-t border-border/30 dark:border-border/20">
                <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
                        <Leaf className="h-4 w-4 text-primary" />
                        Stemma
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Built for ASEAN students learning about climate action.
                    </p>
                    <ThemeToggle />
                </div>
            </footer>
        </>
    );
}
