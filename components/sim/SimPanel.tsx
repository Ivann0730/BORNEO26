"use client";

import { ReactNode } from "react";

interface SimPanelProps {
    children: ReactNode;
    className?: string;
}

/**
 * UI-02: Responsive sim panel — side drawer on desktop, bottom sheet on mobile.
 * Touch gestures on the panel do not propagate to the map beneath.
 */
export default function SimPanel({ children, className = "" }: SimPanelProps) {
    return (
        <div
            className={`pointer-events-auto
                /* Mobile: bottom sheet */
                fixed bottom-0 left-0 right-0 max-h-[75vh] overflow-y-auto
                rounded-t-2xl

                /* Desktop: bottom right modal */
                md:bottom-6 md:top-auto md:left-auto md:right-6
                md:w-[400px] md:h-auto md:max-h-[calc(100vh-120px)]
                md:rounded-2xl md:border

                bg-[linear-gradient(135deg,#0d1b2a_0%,#1b2a3b_50%,#0d1b2a_100%)]
                backdrop-blur-xl border-t border-border/40
                shadow-2xl z-[900]
                ${className}`}
            onTouchMove={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
        >
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-2 pb-1 md:hidden">
                <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>

            <div className="p-4 flex flex-col gap-4">{children}</div>
        </div>
    );
}
