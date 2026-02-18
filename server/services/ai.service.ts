import { GoogleGenerativeAI } from "@google/generative-ai";

// Shift engine modes for nightly prompts
export type ShiftMode =
    | "reverse_causality"  // outcome first, cause second
    | "silence_variable"   // inaction caused change
    | "assumption_test"    // false belief caused outcome
    | "skipped_detail"     // minor factor mattered
    | "two_futures"       // two plausible outcomes, one real
    | "diary";            // open-ended, atmospheric

interface AIConfig {
    apiKey: string;
    model: string;
}

export interface IAIService {
    generateNightlyPrompt(shiftMode: ShiftMode): Promise<string>;
    evaluateUserResponse(promptText: string, userResponse: string): Promise<string>;
    generatePersonalReflection(query: string): Promise<string>;
    analyzeSentiment(text: string): Promise<string>;
}

export class MockAIService implements IAIService {
    async generateNightlyPrompt(shiftMode: ShiftMode): Promise<string> {
        const prompts = [
            "What is a silence you are keeping that is actually speaking louder than words?",
            "If you could send a message to your younger self, what one belief would you ask them to question?",
            "Reflect on a small detail you ignored today that might be more significant than it seems.",
            "Imagine two futures: one where you stay the same, and one where you change one small habit. Which feels lighter?",
            "Look at where you are right now. Trace it back to a single decision you made three years ago."
        ];
        return prompts[Math.floor(Math.random() * prompts.length)];
    }

    async evaluateUserResponse(promptText: string, userResponse: string): Promise<string> {
        const responses = [
            "Your perspective holds a quiet truth. It is often in the spaces between our thoughts that clarity emerges.",
            "There is a weight to your words that suggests you have carried this thought for some time. Acknowledging it is the first step.",
            "The way you connect these ideas shows a deep self-awareness. Trust that inner voice; it speaks with reason.",
            "It is interesting how we frame our own narratives. Your reflection suggests a willingness to see beyond the surface.",
            "There is a calmness in your reasoning. Sometimes, just naming the feeling is enough to understand it."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    async generatePersonalReflection(query: string): Promise<string> {
        const responses = [
            "The question itself often holds the map to the answer. Allow yourself to sit with the uncertainty a little longer.",
            "Consider if what you are seeking is a solution, or simply permission to feel what you are already feeling.",
            "Sometimes the path forward is not about adding more, but about stripping away what is no longer true for you.",
            "Your curiosity is a compass. Follow it gently, without the need to arrive at a destination immediately.",
            "What would happen if you let go of the need to know the answer right now? There is wisdom in waiting."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    async analyzeSentiment(text: string): Promise<string> {
        const sentiments = ["Reflective", "Calm", "Hopeful", "Melancholic", "Deep", "Anxious", "Peaceful"];
        return sentiments[Math.floor(Math.random() * sentiments.length)];
    }
}

export class AIService implements IAIService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(config: AIConfig) {
        this.genAI = new GoogleGenerativeAI(config.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: config.model });
    }

    /**
     * Generate a nightly reflection prompt using the shift engine
     * @param shiftMode The cognitive framework to use
     * @returns The generated prompt
     */
    async generateNightlyPrompt(shiftMode: ShiftMode): Promise<string> {
        try {
            const systemPrompt = this.getShiftModePrompt(shiftMode);
            const prompt = `${systemPrompt}\n\nGenerate a single nightly reflection prompt...`; // (truncated for brevity in diff, but I will use full string in actual tool call)
            // Re-using the exact prompt string from original file to ensure no regression
            const fullPrompt = `${systemPrompt}

Generate a single nightly reflection prompt that follows this cognitive framework. The prompt should:
- Be calm and contemplative
- Encourage quiet thinking
- Be 1-2 sentences only
- Contain no emojis or exclamation marks
- Not be motivational or hype-driven
- Feel slightly unfinished, inviting thought

Output only the prompt text, nothing else.`;

            const result = await this.model.generateContent(fullPrompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.error("Gemini API Error (generateNightlyPrompt):", error);
            // Fallback to mock
            return new MockAIService().generateNightlyPrompt(shiftMode);
        }
    }

    async evaluateUserResponse(promptText: string, userResponse: string): Promise<string> {
        try {
            const prompt = `You are an AI in a night-time reflection app called Nocturne...`; // (truncated)
            const fullPrompt = `You are an AI in a night-time reflection app called Nocturne. Your role is to support quiet thinking, not to judge or advise.

The user responded to this prompt:
"${promptText}"

Their response:
"${userResponse}"

Provide a brief, calm reflection on their response. Follow these strict rules:
- Compare meaning, not keywords
- Value reasoning more than correctness
- Use non-judgmental, observational language
- Never say "wrong", "incorrect", or "failed"
- Avoid praise inflation or criticism
- No emojis, no exclamation marks
- Short paragraph only (2-3 sentences)
- Quiet, neutral, human tone
- Slightly unfinished

Output only your reflection, nothing else.`;

            const result = await this.model.generateContent(fullPrompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.error("Gemini API Error (evaluateUserResponse):", error);
            return new MockAIService().evaluateUserResponse(promptText, userResponse);
        }
    }

    async generatePersonalReflection(query: string): Promise<string> {
        try {
            const fullPrompt = `You are an AI in a night-time reflection app called Nocturne. Your role is to support quiet thinking.

The user asked:
"${query}"

Provide a thoughtful reflection. Follow these strict rules:
- Calm over excitement
- Reflection over reaction
- Silence over noise
- Insight over information
- No emojis, no exclamation marks
- No lists unless absolutely required
- Short paragraph only (2-3 sentences)
- Quiet, neutral, human tone
- Slightly unfinished
- Never diagnose, advise, or moralize
- Never sound like a teacher, judge, or therapist

Output only your reflection, nothing else.`;

            const result = await this.model.generateContent(fullPrompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.error("Gemini API Error (generatePersonalReflection):", error);
            return new MockAIService().generatePersonalReflection(query);
        }
    }

    /**
     * Get the system prompt for a specific shift mode
     */
    private getShiftModePrompt(mode: ShiftMode): string {
        const prompts: Record<ShiftMode, string> = {
            reverse_causality: "Create a prompt that asks the user to inspect a specific recent event where the outcome is known, and trace it back to a single moment of cause. Focus on the internal decision, not external events.",

            silence_variable: "Create a prompt that asks the user to inspect a moment of silence or inaction from today. What was felt but not said? What action was avoided?",

            assumption_test: "Create a prompt that asks the user to inspect a belief they held today that might be wrong. Ask them to look at the evidence against their own assumption.",

            skipped_detail: "Create a prompt that asks the user to inspect a small, specific detail from today that they initially ignored. Why did it matter?",

            two_futures: "Create a prompt that asks the user to inspect their current trajectory versus a slightly different one. Focus on the feeling of the path, not just the result.",

            diary: "Create a wide, open-ended prompt about the feeling of the night itself. Focus on the atmosphere, the silence, or the act of keeping a secret. It should feel like an invitation to unload a burden."
        };

        return prompts[mode];
    }

    /**
     * Analyze the sentiment of a text
     * @param text The user's reflection text
     * @returns A short sentiment tag (e.g. "Reflective", "Anxious", "Calm")
     */
    async analyzeSentiment(text: string): Promise<string> {
        const prompt = `Analyze the sentiment/tone of this reflection:
"${text}"

Output ONLY a single word or short phrase descriptions of the tone (e.g., "Reflective", "Heavy", "Hopeful", "Scattered", "Calm"). 
Choose the most accurate one.
No explanation.`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    }
}

// Export a singleton instance
let aiServiceInstance: IAIService | null = null;

export function getAIService(): IAIService {
    if (!aiServiceInstance) {
        const apiKey = process.env.GEMINI_API_KEY || "";
        const model = process.env.GEMINI_MODEL || "gemini-pro";

        if (!apiKey) {
            console.warn("⚠️ No valid GEMINI_API_KEY found. Using Mock AI Service.");
            aiServiceInstance = new MockAIService();
        } else {
            try {
                aiServiceInstance = new AIService({ apiKey, model });
            } catch (error) {
                console.error("Failed to initialize AI service, falling back to mock:", error);
                aiServiceInstance = new MockAIService();
            }
        }
    }

    return aiServiceInstance;
}
