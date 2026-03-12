"use client";

import { useEffect, useState } from "react";
import { Leaf, Database, Cpu, Globe, Zap, BarChart3 } from "lucide-react";

const LOADING_STEPS = [
    { icon: Globe, text: "Mapping geographic boundaries..." },
    { icon: Database, text: "Fetching local environmental data..." },
    { icon: Cpu, text: "Simulating climatic feedback loops..." },
    { icon: BarChart3, text: "Calculating economic projections..." },
    { icon: Zap, text: "Analyzing stakeholder sentiment..." },
];

export default function AnalysisLoading() {
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const CurrentIcon = LOADING_STEPS[stepIndex].icon;

    return (
        <div className="flex flex-col items-center justify-center p-8 gap-6 min-h-[240px] animate-in fade-in duration-500">
            {/* Logo/Icon Container */}
            <div className="relative">
                {/* Pulsing ring */}
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                
                {/* Glowing background */}
                <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full" />

                <div className="relative bg-card border border-primary/30 rounded-full w-20 h-20 flex items-center justify-center shadow-2xl overflow-hidden group">
                    {/* Interior rotating subtle border */}
                    <div className="absolute inset-0 border-2 border-dashed border-primary/20 animate-[spin_10s_linear_infinite]" />
                    
                    <Leaf className="w-10 h-10 text-primary animate-bounce fill-primary/10" strokeWidth={2.5} />
                </div>
            </div>

            <div className="flex flex-col items-center text-center gap-3 max-w-[280px]">
                <h3 className="text-lg font-bold text-foreground tracking-tight">
                    Generating Simulation
                </h3>
                
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 shadow-inner min-w-[240px] justify-center transition-all duration-300">
                    <CurrentIcon className="w-3.5 h-3.5 text-primary animate-pulse" />
                    <span className="text-xs font-semibold text-muted-foreground transition-all duration-500 animate-in fade-in slide-in-from-right-2">
                        {LOADING_STEPS[stepIndex].text}
                    </span>
                </div>
            </div>

            {/* Progress Bar (Indeterminate) */}
            <div className="w-48 h-1 bg-muted rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-primary/30" />
                <div className="h-full bg-primary animate-[shimmer_2s_infinite_linear]" 
                     style={{ 
                         width: "40%", 
                         backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" 
                     }} 
                />
            </div>

            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.2em] font-black animate-pulse">
                Computing Scenarios
            </p>

            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-150%); }
                    100% { transform: translateX(250%); }
                }
            `}</style>
        </div>
    );
}
