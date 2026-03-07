"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("stemma-theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const dark = stored === "dark" || (!stored && prefersDark);
        setIsDark(dark);
        document.documentElement.classList.toggle("dark", dark);
    }, []);

    function toggle() {
        const next = !isDark;
        setIsDark(next);
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("stemma-theme", next ? "dark" : "light");
    }

    return (
        <button
            onClick={toggle}
            className="flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-card transition-all hover:bg-muted active:scale-95"
            aria-label="Toggle theme"
        >
            {isDark ? (
                <Sun className="h-4 w-4" />
            ) : (
                <Moon className="h-4 w-4" />
            )}
        </button>
    );
}
