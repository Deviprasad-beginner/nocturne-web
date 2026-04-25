/**
 * useMoodAnalysis hook
 * Debounces text input and calls /api/v1/reads/analyze-mood
 * to suggest the best reading mode.
 */
import { useState, useEffect, useRef } from "react";
import type { ReadingMode } from "@/lib/reading-modes";

export interface MoodAnalysisResult {
    suggestedMode: ReadingMode;
    confidence: number; // 0–100
    reasoning: string;
    wordCount: number;
    estimatedReadMinutes: number;
}

export function useMoodAnalysis(text: string, debounceMs = 1400) {
    const [result, setResult] = useState<MoodAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const trimmed = text.trim();

        // Reset if text too short
        if (trimmed.split(/\s+/).length < 20) {
            setResult(null);
            setError(null);
            return;
        }

        // Clear previous timer
        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(async () => {
            // Cancel any in-flight request
            if (abortRef.current) abortRef.current.abort();
            abortRef.current = new AbortController();

            setIsAnalyzing(true);
            setError(null);

            try {
                // Send first 800 words only to keep it snappy
                const sample = trimmed.split(/\s+/).slice(0, 800).join(" ");

                const res = await fetch("/api/v1/reads/analyze-mood", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ textSample: sample }),
                    signal: abortRef.current.signal,
                });

                if (!res.ok) throw new Error("Analysis failed");

                const data: MoodAnalysisResult = await res.json();
                setResult(data);
            } catch (e: any) {
                if (e.name !== "AbortError") {
                    setError("Could not analyse mood");
                }
            } finally {
                setIsAnalyzing(false);
            }
        }, debounceMs);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [text, debounceMs]);

    return { result, isAnalyzing, error };
}
