import { useState, useEffect } from 'react';

interface SentimentResponse {
    sentiment: string;
    score: number;
}

export function useSentimentTracker(text: string, debounceMs: number = 2000) {
    const [sentiment, setSentiment] = useState<string>('neutral');
    const [score, setScore] = useState<number>(0.5);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [lastPolledText, setLastPolledText] = useState<string>('');

    useEffect(() => {
        // Only trigger if text has meaningfully changed
        if (!text || text.trim() === '' || text === lastPolledText) {
            return;
        }

        const handler = setTimeout(async () => {
            setIsAnalyzing(true);
            try {
                // We use our new bridge route!
                const res = await fetch('/api/v1/bridges/analyze-sentiment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                });

                if (res.ok) {
                    const json = await res.json();
                    if (json.success && json.data) {
                        setSentiment(json.data.sentiment);
                        setScore(json.data.score);
                    }
                }
            } catch (err) {
                console.error("Error analyzing sentiment:", err);
            } finally {
                setLastPolledText(text);
                setIsAnalyzing(false);
            }
        }, debounceMs);

        return () => {
            clearTimeout(handler);
        };
    }, [text, debounceMs, lastPolledText]);

    return { sentiment, score, isAnalyzing };
}
