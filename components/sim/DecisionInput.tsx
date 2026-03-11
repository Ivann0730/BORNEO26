"use client";

import { useState } from "react";
import { Mic, MicOff, Send, Type, Loader2 } from "lucide-react";
import { useVoice } from "@/hooks/useVoice";

interface DecisionInputProps {
    onSubmit: (text: string) => void;
    isSubmitting: boolean;
    disabled?: boolean;
    inputMode: "guided" | "freeform";
    onInputModeChange: (mode: "guided" | "freeform") => void;
}

export default function DecisionInput({
    onSubmit,
    isSubmitting,
    disabled = false,
    inputMode,
    onInputModeChange,
}: DecisionInputProps) {
    const [inputType, setInputType] = useState<"text" | "voice">("text");
    const [textValue, setTextValue] = useState("");
    const [guidedFields, setGuidedFields] = useState({ who: "", what: "", action: "" });

    const { isListening, transcript, isSupported, startListening, stopListening } =
        useVoice();

    function handleModeSwitch(newMode: "guided" | "freeform") {
        setTextValue("");
        setGuidedFields({ who: "", what: "", action: "" });
        onInputModeChange(newMode);
    }

    function handleSubmit() {
        if (inputMode === "guided") {
            if (!guidedFields.who.trim() && !guidedFields.what.trim() && !guidedFields.action.trim()) return;
            const combined = `Affected parties: ${guidedFields.who}\nResource/trade-off: ${guidedFields.what}\nProposed action: ${guidedFields.action}`;
            onSubmit(combined);
            setGuidedFields({ who: "", what: "", action: "" });
        } else {
            const value = inputType === "voice" ? transcript : textValue;
            if (!value.trim()) return;
            onSubmit(value.trim());
            setTextValue("");
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

    const hasContent = inputMode === "guided"
        ? (guidedFields.who.trim().length > 0 || guidedFields.what.trim().length > 0 || guidedFields.action.trim().length > 0)
        : (inputType === "voice" ? transcript.trim().length > 0 : textValue.trim().length > 0);

    return (
        <div className="flex flex-col gap-3 w-full max-w-sm mx-auto sm:max-w-md">
            {/* Guided / Freeform mode toggle */}
            <div className="flex flex-col items-center gap-1 mb-1">
                <div className="flex p-0.5 rounded-full border border-border bg-card shadow-sm">
                    <button
                        onClick={() => handleModeSwitch("guided")}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${inputMode === "guided" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Guided
                    </button>
                    <button
                        onClick={() => handleModeSwitch("freeform")}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${inputMode === "freeform" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Freeform
                    </button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center px-4">
                    Guided mode helps structure your thinking. Switch to Freeform if you're confident.
                </p>
            </div>

            {inputMode === "freeform" && (
                <div className="flex items-center justify-center gap-1 rounded-xl bg-muted p-1 border border-border/50">
                    <button
                        onClick={() => setInputType("text")}
                        className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-all ${inputType === "text"
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Type className="h-3.5 w-3.5" />
                        Type
                    </button>
                    {isSupported && (
                        <button
                            onClick={() => setInputType("voice")}
                            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-all ${inputType === "voice"
                                ? "bg-card text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Mic className="h-3.5 w-3.5" />
                            Speak
                        </button>
                    )}
                </div>
            )}

            {/* Input area */}
            {inputMode === "guided" ? (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-3 border-l-2 border-primary/40 pl-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-foreground ml-1">Who does this affect?</label>
                            <input
                                type="text"
                                value={guidedFields.who}
                                onChange={(e) => setGuidedFields(prev => ({ ...prev, who: e.target.value }))}
                                placeholder="e.g. coastal fishing communities, city planners"
                                disabled={disabled || isSubmitting}
                                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-50"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-foreground ml-1">What resource or trade-off does this require?</label>
                            <input
                                type="text"
                                value={guidedFields.what}
                                onChange={(e) => setGuidedFields(prev => ({ ...prev, what: e.target.value }))}
                                placeholder="e.g. $4M in emergency funds, 6-month timeline"
                                disabled={disabled || isSubmitting}
                                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-50"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-foreground ml-1">What is your proposed action?</label>
                            <textarea
                                value={guidedFields.action}
                                onChange={(e) => setGuidedFields(prev => ({ ...prev, action: e.target.value }))}
                                placeholder="Describe your decision clearly. The more specific, the better."
                                disabled={disabled || isSubmitting}
                                rows={2}
                                className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-50"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={!hasContent || disabled || isSubmitting}
                        className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        Submit Policy
                    </button>
                </div>
            ) : inputType === "text" ? (
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
