import Link from "next/link";
import { ArrowRight, MapPin, Newspaper, Zap, Leaf } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";

const steps = [
  {
    icon: MapPin,
    title: "Pick a Location",
    description: "Choose anywhere in Southeast Asia to explore.",
  },
  {
    icon: Newspaper,
    title: "Read the Headline",
    description: "See real climate news affecting that area.",
  },
  {
    icon: Zap,
    title: "Make Your Decision",
    description: "Choose policies and watch the map respond.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <Leaf className="h-5 w-5 text-primary" />
          <span>Stemma</span>
        </div>
        <ThemeToggle />
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20">
        <div className="max-w-2xl mx-auto text-center flex flex-col gap-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mx-auto">
            <Leaf className="h-3.5 w-3.5" />
            Climate Policy Simulator for Students
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight tracking-tight">
            What would{" "}
            <span className="text-primary">YOU</span>{" "}
            do about climate change?
          </h1>

          {/* Sub */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Pick a place. Read the news. Make decisions. Watch the map change.
            See if you can save the day.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-2">
            <Link
              href="/sim"
              className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 hover:shadow-xl hover:shadow-primary/30 active:scale-95"
            >
              Start Simulating
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-16 sm:mt-20 max-w-3xl w-full px-4">
          {steps.map((step, i) => (
            <div
              key={i}
              className="group flex flex-col items-center text-center gap-3 rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <step.icon className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-sm">{step.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border/50">
        Built for ASEAN students learning about climate action.
      </footer>
    </div>
  );
}
