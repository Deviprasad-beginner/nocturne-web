import Sentiment from "sentiment";

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

export interface EmotionalAnalysisResult {
    detectedEmotion: string;
    sentimentScore: number;
    reflectionDepthScore: number;
}

export function analyzeEmotion(text: string): EmotionalAnalysisResult {
    const sentimentResult = sentiment.analyze(text);
    const sentimentScore = sentimentResult.score;

    let detectedEmotion = "neutral";

    // Check for emotion keywords
    for (const emotion in emotionKeywords) {
        if (emotionKeywords[emotion].some(word =>
            text.toLowerCase().includes(word)
        )) {
            detectedEmotion = emotion;
            break;
            // Prioritize first match for now, could be enhanced to scoring
        }
    }

    // Calculate reflection depth score (0-10)
    // Logic: Longer text + higher emotional intensity = deeper reflection
    const lengthScore = Math.min(text.length / 120, 5); // Max 5 points for length
    const intensityScore = Math.min(Math.abs(sentimentScore), 5); // Max 5 points for sentiment intensity

    const reflectionDepthScore = Number((lengthScore + intensityScore).toFixed(2));

    return {
        detectedEmotion,
        sentimentScore,
        reflectionDepthScore
    };
}
