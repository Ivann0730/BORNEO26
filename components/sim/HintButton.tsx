"use client";

import { useState } from "react";
import { Lightbulb, ChevronDown } from "lucide-react";

interface HintButtonProps {
    hints: string[];
    onHintUsed?: () => void;
}

export default function HintButton({
    hints,
    onHintUsed,
}: HintButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (hints.length === 0) return null;

    function handleToggle() {
        if (!isOpen && onHintUsed) {
            onHintUsed();
        }
        setIsOpen((prev) => !prev);
    }

    return (
        <div className="flex flex-col gap-2 w-full max-w-sm mx-auto sm:max-w-md">
            <button
                onClick={handleToggle}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
            >
                <Lightbulb className="h-3.5 w-3.5" />
                <span>Need a hint? 💡</span>
                <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>

            <div
                className={`overflow-hidden transition-all duration-300 ease-out ${
                    isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="flex flex-col gap-2 pt-1 border-t border-border mt-3">
                    <p className="text-xs text-muted-foreground italic mb-1">
                        Think about approaches like:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {hints.map((hint, i) => (
                            <div
                                key={i}
                                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground/90 cursor-default select-text"
                            >
                                {hint}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
