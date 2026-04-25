/**
 * Read Analysis Controller
 * Analyses text and suggests the best reading mode (learn/feel/think/sleep)
 * using Gemini AI with sentiment-library fallback.
 */
import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Lazy-init Gemini so we don't crash if no API key
let genAI: GoogleGenerativeAI | null = null;
function getGenAI() {
    if (!genAI && process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAI;
}

type ReadingMode = "learn" | "feel" | "think" | "sleep";

interface AnalysisResult {
    suggestedMode: ReadingMode;
    confidence: number;
    reasoning: string;
    wordCount: number;
    estimatedReadMinutes: number;
}

// ─── Gemini Analysis ──────────────────────────────────────────────────────────
async function analyseWithGemini(textSample: string): Promise<Omit<AnalysisResult, "wordCount" | "estimatedReadMinutes">> {
    const ai = getGenAI();
    if (!ai) throw new Error("No Gemini key");

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a reading-experience curator. Analyse the following text excerpt and decide which reading mode fits best.

Reading modes:
- "learn"  — informational, factual, educational, technical, how-to, news
- "feel"   — emotional, literary fiction, personal narrative, poetry, memoir
- "think"  — philosophical, speculative, essay, reflective, complex ideas
- "sleep"  — soothing, slow, minimalist, meditative, bedtime stories, calming

Respond ONLY with valid JSON in this exact shape (no markdown):
{"mode":"<one of: learn feel think sleep>","confidence":<0-100>,"reasoning":"<1 sentence>"}

Text:
"""
${textSample.slice(0, 1200)}
"""`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    // Strip markdown fences if model added them anyway
    const cleaned = raw.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    const validModes: ReadingMode[] = ["learn", "feel", "think", "sleep"];
    const mode: ReadingMode = validModes.includes(parsed.mode) ? parsed.mode : "think";

    return {
        suggestedMode: mode,
        confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 70)),
        reasoning: String(parsed.reasoning || "Based on content style and tone."),
    };
}

// ─── Sentiment Fallback ───────────────────────────────────────────────────────
function analyseWithSentiment(textSample: string): Omit<AnalysisResult, "wordCount" | "estimatedReadMinutes"> {
    const text = textSample.toLowerCase();

    // Keyword scoring per mode
    const scores: Record<ReadingMode, number> = {
        learn: 0,
        feel: 0,
        think: 0,
        sleep: 0,
    };

    const learnWords = ["research", "data", "study", "analysis", "result", "method", "process", "system", "algorithm", "technology", "science", "evidence", "theory", "model", "function"];
    const feelWords = ["love", "heart", "tears", "emotion", "beautiful", "pain", "joy", "remember", "dream", "soul", "hope", "grief", "longing", "warmth", "tenderness"];
    const thinkWords = ["perhaps", "therefore", "consciousness", "meaning", "existence", "philosophy", "question", "understand", "paradox", "truth", "reality", "perspective", "wonder", "contemplat"];
    const sleepWords = ["quiet", "gentle", "soft", "slowly", "drift", "calm", "breathe", "still", "moonlight", "whisper", "peace", "rest", "fade", "tender", "silence"];

    const countMatches = (words: string[]) =>
        words.reduce((sum, w) => sum + (text.split(w).length - 1), 0);

    scores.learn = countMatches(learnWords);
    scores.feel = countMatches(feelWords);
    scores.think = countMatches(thinkWords);
    scores.sleep = countMatches(sleepWords);

    const sorted = (Object.entries(scores) as [ReadingMode, number][]).sort(([, a], [, b]) => b - a);
    const [top, second] = sorted;
    const totalSignals = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
    const confidence = Math.min(85, Math.round((top[1] / totalSignals) * 100) + 30);

    const reasoningMap: Record<ReadingMode, string> = {
        learn: "The text has informational and factual patterns typical of educational content.",
        feel: "The text contains emotionally rich language suggesting an immersive reading experience.",
        think: "The text uses reflective and philosophical language inviting deep contemplation.",
        sleep: "The text has a calm, slow-paced and soothing quality ideal for winding down.",
    };

    return {
        suggestedMode: top[0],
        confidence,
        reasoning: reasoningMap[top[0]],
    };
}

// ─── Controller ───────────────────────────────────────────────────────────────
export const readAnalysisController = {
    async analyzeMood(req: Request, res: Response) {
        try {
            const { textSample } = req.body as { textSample: string };

            if (!textSample || typeof textSample !== "string") {
                return res.status(400).json({ error: "textSample is required" });
            }

            const words = textSample.trim().split(/\s+/).filter(Boolean);
            const wordCount = words.length;
            const estimatedReadMinutes = Math.max(1, Math.ceil(wordCount / 200));

            let core: Omit<AnalysisResult, "wordCount" | "estimatedReadMinutes">;

            try {
                core = await analyseWithGemini(textSample);
            } catch (geminiErr) {
                console.warn("[analyzeMood] Gemini unavailable, falling back to keyword analysis:", geminiErr);
                core = analyseWithSentiment(textSample);
            }

            const result: AnalysisResult = {
                ...core,
                wordCount,
                estimatedReadMinutes,
            };

            res.json(result);
        } catch (error) {
            console.error("[analyzeMood] Error:", error);
            res.status(500).json({ error: "Failed to analyze mood" });
        }
    },
};
