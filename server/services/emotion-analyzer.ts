import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import Sentiment from "sentiment";

let genAI: GoogleGenerativeAI | null = null;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

export interface EmotionalAnalysisResult {
    detectedEmotion: string;
    sentimentScore: number;
    reflectionDepthScore: number;
    vibeTags?: string[];
}

const analysisSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        detectedEmotion: {
            type: SchemaType.STRING,
            description: "The primary emotion detected (e.g., lonely, joy, nostalgia, ambition, anxiety, sadness, love)",
        },
        sentimentScore: {
            type: SchemaType.NUMBER,
            description: "A score from -100 to 100 where -100 is highly negative, 0 is neutral, and 100 is highly positive.",
        },
        reflectionDepthScore: {
            type: SchemaType.NUMBER,
            description: "A score from 0 to 100 indicating how deeply reflective or introspective the text is.",
        },
        vibeTags: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "1 to 3 short tags that capture the vibe of the text (e.g., 'Late Night Thoughts', 'Existential', 'Chill')."
        }
    },
    required: ["detectedEmotion", "sentimentScore", "reflectionDepthScore", "vibeTags"]
};

export async function analyzeEmotion(text: string): Promise<EmotionalAnalysisResult> {
    if (!text || text.trim() === '') {
        return {
            detectedEmotion: "neutral",
            sentimentScore: 0,
            reflectionDepthScore: 0,
            vibeTags: []
        };
    }

    try {
        if (!genAI) {
            console.warn("GEMINI_API_KEY is not set. Returning default emotion analysis.");
            return fallbackAnalyzeEmotion(text);
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            }
        });

        const prompt = `Analyze the following text from a late-night social app called Nocturne, where users share quiet, vulnerable, or random thoughts. Text: "${text}"`;
        
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);

        return {
            detectedEmotion: parsed.detectedEmotion || "neutral",
            sentimentScore: parsed.sentimentScore || 0,
            reflectionDepthScore: parsed.reflectionDepthScore || 0,
            vibeTags: parsed.vibeTags || []
        };

    } catch (error) {
        console.error('Error analyzing emotion with Gemini:', error);
        return fallbackAnalyzeEmotion(text);
    }
}

const sentiment = new Sentiment();
const emotionKeywords: Record<string, string[]> = {
    lonely: ["alone", "empty", "silent", "solitude", "isolation", "quiet"],
    nostalgia: ["memory", "old", "past", "childhood", "remote", "remember"],
    ambition: ["goal", "future", "build", "dream", "career", "success"],
    anxiety: ["fear", "worried", "stress", "panic", "nervous", "dread"],
    joy: ["happy", "smile", "laugh", "excited", "content", "peace"],
    sadness: ["cry", "tears", "gloomy", "depressed", "blue", "pain"],
    love: ["heart", "love", "passion", "desire", "romance", "adore"],
};

function fallbackAnalyzeEmotion(text: string): EmotionalAnalysisResult {
    const sentimentResult = sentiment.analyze(text);
    const sentimentScore = sentimentResult.score;

    let detectedEmotion = "neutral";
    for (const emotion in emotionKeywords) {
        if (emotionKeywords[emotion].some(word => text.toLowerCase().includes(word))) {
            detectedEmotion = emotion;
            break;
        }
    }

    const lengthScore = Math.min(text.length / 120, 5); 
    const intensityScore = Math.min(Math.abs(sentimentScore), 5); 
    const reflectionDepthScore = Math.round((lengthScore + intensityScore) * 10); 

    return {
        detectedEmotion,
        sentimentScore: Math.round(sentimentScore * 10),
        reflectionDepthScore,
        vibeTags: [detectedEmotion]
    };
}
