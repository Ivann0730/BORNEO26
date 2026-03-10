import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] px-4 pt-20 pb-8 text-center">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 dark:bg-primary/10 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold tracking-wide uppercase mb-8">
                <span className="relative flex h-2 w-2">
                    <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-50" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <Leaf className="h-3.5 w-3.5 text-primary" />
                <span className="text-primary">Live Climate Sim</span>
            </div>

            {/* Giant headline */}
            <h1
                className="font-bold leading-[1.05] tracking-tight mb-6"
                style={{ fontSize: "clamp(2.5rem, 11vw, 8rem)", fontFamily: "var(--font-display), sans-serif" }}
            >
                You&apos;re{" "}
                <span className="landing-gradient-text">in charge</span>
                {" "}now.
            </h1>

            {/* Subheadline */}
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-lg mx-auto leading-relaxed mb-10">
                Drop a pin anywhere in Southeast Asia. Read real headlines.
                Make the policy calls. Watch the map respond.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                    href="/sim"
                    className="landing-cta-glow inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-all hover:brightness-110 hover:scale-105 active:scale-95"
                >
                    Start Simulating
                    <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                    href="#how-it-works"
                    className="inline-flex items-center gap-2 rounded-2xl border border-border bg-transparent px-8 py-4 text-base font-semibold text-foreground transition-all hover:bg-card/60 active:scale-95"
                >
                    How It Works
                </Link>
            </div>
        </section>
    );
}
