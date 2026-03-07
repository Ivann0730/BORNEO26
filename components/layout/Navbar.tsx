"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 sm:px-6 bg-background/80 backdrop-blur-md border-b border-border/50">
            <Link
                href="/"
                className="flex items-center gap-2 font-bold text-lg tracking-tight"
            >
                <Leaf className="h-5 w-5 text-primary" />
                <span>Stemma</span>
            </Link>
            <ThemeToggle />
        </nav>
    );
}
