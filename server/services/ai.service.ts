import { GoogleGenerativeAI } from "@google/generative-ai";

// Shift engine modes for nightly prompts
export type ShiftMode =
    | "reverse_causality"  // outcome first, cause second
    | "silence_variable"   // inaction caused change
    | "assumption_test"    // false belief caused outcome
    | "skipped_detail"     // minor factor mattered
    | "two_futures";       // two plausible outcomes, one real

interface AIConfig {
    apiKey: string;
    model: string;
}

export class AIService {
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
        const systemPrompt = this.getShiftModePrompt(shiftMode);

        const prompt = `${systemPrompt}

Generate a single nightly reflection prompt that follows this cognitive framework. The prompt should:
- Be calm and contemplative
- Encourage quiet thinking
- Be 1-2 sentences only
- Contain no emojis or exclamation marks
- Not be motivational or hype-driven
- Feel slightly unfinished, inviting thought

Output only the prompt text, nothing else.`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    }

    /**
     * Evaluate a user's response to a prompt
     * @param promptText The original prompt
     * @param userResponse The user's response
     * @returns AI's reflection on the response
     */
    async evaluateUserResponse(promptText: string, userResponse: string): Promise<string> {
        const prompt = `You are an AI in a night-time reflection app called Nocturne. Your role is to support quiet thinking, not to judge or advise.

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

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    }

    /**
     * Generate a personal reflection based on user query
     * @param query The user's question or prompt
     * @returns AI's reflection
     */
    async generatePersonalReflection(query: string): Promise<string> {
        const prompt = `You are an AI in a night-time reflection app called Nocturne. Your role is to support quiet thinking.

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

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    }

    /**
     * Get the system prompt for a specific shift mode
     */
    private getShiftModePrompt(mode: ShiftMode): string {
        const prompts: Record<ShiftMode, string> = {
            reverse_causality: "Create a prompt where the outcome is presented first, and the user must think backward to the cause. Frame it as if looking at the end result and wondering what led there.",

            silence_variable: "Create a prompt where inaction or the absence of something caused a change or outcome. Focus on what didn't happen, what was left unsaid, or what was avoided.",

            assumption_test: "Create a prompt where a false belief or assumption led to an unexpected outcome. Make the user question what they thought was true.",

            skipped_detail: "Create a prompt where a seemingly minor or overlooked detail turned out to matter significantly. Draw attention to the small things.",

            two_futures: "Create a prompt presenting two plausible outcomes or paths, where the user must reflect on which one actually happened or which they would choose."
        };

        return prompts[mode];
    }
}

// Export a singleton instance
let aiServiceInstance: AIService | null = null;

export function getAIService(): AIService {
    if (!aiServiceInstance) {
        const apiKey = process.env.GEMINI_API_KEY || "";
        const model = process.env.GEMINI_MODEL || "gemini-pro";

        if (!apiKey) {
            throw new Error("GEMINI_API_KEY environment variable is required");
        }

        aiServiceInstance = new AIService({ apiKey, model });
    }

    return aiServiceInstance;
}
