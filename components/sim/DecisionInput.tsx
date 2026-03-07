"use client";

import { useState } from "react";
import { Mic, MicOff, Send, Type, Loader2 } from "lucide-react";
import { useVoice } from "@/hooks/useVoice";

interface DecisionInputProps {
    onSubmit: (text: string) => void;
    isSubmitting: boolean;
    disabled?: boolean;
}

export default function DecisionInput({
    onSubmit,
    isSubmitting,
    disabled = false,
}: DecisionInputProps) {
    const [mode, setMode] = useState<"text" | "voice">("text");
    const [textValue, setTextValue] = useState("");
    const { isListening, transcript, isSupported, startListening, stopListening } =
        useVoice();

    function handleSubmit() {
        const value = mode === "voice" ? transcript : textValue;
        if (!value.trim()) return;
        onSubmit(value.trim());
        setTextValue("");
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

    const hasContent = mode === "voice" ? transcript.trim().length > 0 : textValue.trim().length > 0;

    return (
        <div className="flex flex-col gap-3 w-full max-w-sm mx-auto sm:max-w-md">
            {/* Mode toggle */}
            <div className="flex items-center justify-center gap-1 rounded-xl bg-muted p-1">
                <button
                    onClick={() => setMode("text")}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-all ${mode === "text"
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <Type className="h-3.5 w-3.5" />
                    Type
                </button>
                {isSupported && (
                    <button
                        onClick={() => setMode("voice")}
                        className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-all ${mode === "voice"
                                ? "bg-card text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Mic className="h-3.5 w-3.5" />
                        Speak
                    </button>
                )}
            </div>

            {/* Input area */}
            {mode === "text" ? (
                <div className="flex items-end gap-2">
                    <textarea
                        value={textValue}
                        onChange={(e) => setTextValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your policy decision..."
                        disabled={disabled || isSubmitting}
                        rows={2}
                        className="flex-1 resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-50"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={!hasContent || disabled || isSubmitting}
                        className="flex items-center justify-center h-11 w-11 rounded-xl bg-primary text-primary-foreground transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3">
                    <div className="w-full min-h-[60px] rounded-xl border border-border bg-card px-4 py-3 text-sm">
                        {transcript || (
                            <span className="text-muted-foreground">
                                {isListening ? "Listening..." : "Tap the mic to start"}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={isListening ? stopListening : startListening}
                            disabled={disabled || isSubmitting}
                            className={`flex items-center justify-center h-14 w-14 rounded-full transition-all active:scale-95 ${isListening
                                    ? "bg-destructive text-white animate-pulse"
                                    : "bg-primary text-primary-foreground"
                                }`}
                        >
                            {isListening ? (
                                <MicOff className="h-6 w-6" />
                            ) : (
                                <Mic className="h-6 w-6" />
                            )}
                        </button>
                        {hasContent && (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-95"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                Submit
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
