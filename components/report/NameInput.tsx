"use client";

import { useState } from "react";
import { User, ArrowRight } from "lucide-react";

interface NameInputProps {
    onSubmit: (name: string) => void;
}

export default function NameInput({ onSubmit }: NameInputProps) {
    const [name, setName] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (name.trim()) {
            onSubmit(name.trim());
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 w-full max-w-sm mx-auto"
        >
            <label className="flex items-center gap-2 text-sm font-semibold">
                <User className="h-4 w-4 text-primary" />
                Add your name to the report
            </label>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    maxLength={100}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                />
                <button
                    type="submit"
                    disabled={!name.trim()}
                    className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary text-primary-foreground transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </form>
    );
}
