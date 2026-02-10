import { getAIService, type ShiftMode } from "./ai.service";
import { IStorage } from "../storage";
import type {
    NightlyPrompt,
    InsertNightlyPrompt,
    UserReflection,
    InsertUserReflection,
    PersonalReflection,
    InsertPersonalReflection
} from "@shared/schema";

export class ReflectionsService {
    constructor(private storage: IStorage) { }

    /**
     * Get the active (non-expired) nightly prompt, or generate a new one
     */
    async getActivePrompt(): Promise<NightlyPrompt> {
        const activePrompt = await this.storage.getActivePrompt();

        if (activePrompt) {
            return activePrompt;
        }

        // No active prompt, generate a new one
        return await this.generateNewPrompt();
    }

    /**
     * Generate a new nightly prompt using a random shift mode
     */
    async generateNewPrompt(): Promise<NightlyPrompt> {
        const shiftModes: ShiftMode[] = [
            "reverse_causality",
            "silence_variable",
            "assumption_test",
            "skipped_detail",
            "two_futures"
        ];

        // Pick a random shift mode
        const randomMode = shiftModes[Math.floor(Math.random() * shiftModes.length)];

        const aiService = getAIService();
        const content = await aiService.generateNightlyPrompt(randomMode);

        // Prompt expires in 24 hours
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const promptData: InsertNightlyPrompt = {
            content,
            shiftMode: randomMode,
            expiresAt
        };

        return await this.storage.createNightlyPrompt(promptData);
    }

    /**
     * Submit a user's response to a prompt and get AI evaluation
     */
    async submitResponse(userId: number, promptId: number, responseContent: string): Promise<UserReflection> {
        // Get the prompt to provide context to AI
        const prompt = await this.storage.getNightlyPrompt(promptId);

        if (!prompt) {
            throw new Error("Prompt not found");
        }

        // Get AI evaluation
        const aiService = getAIService();
        const aiEvaluation = await aiService.evaluateUserResponse(prompt.content, responseContent);

        const reflectionData: InsertUserReflection = {
            userId,
            promptId,
            responseContent
        };

        return await this.storage.createUserReflection(reflectionData, { text: aiEvaluation });
    }

    /**
     * Get a user's reflection history
     */
    async getUserReflectionHistory(userId: number, limit = 20): Promise<UserReflection[]> {
        return await this.storage.getUserReflections(userId, limit);
    }

    /**
     * Request a personal AI reflection
     */
    async requestPersonalReflection(userId: number, userQuery: string): Promise<PersonalReflection> {
        const aiService = getAIService();
        const aiReflection = await aiService.generatePersonalReflection(userQuery);

        return await this.storage.createPersonalReflection({
            userId,
            userQuery
        }, aiReflection);
    }

    /**
     * Get a user's personal reflections
     */
    async getPersonalReflections(userId: number, limit = 20): Promise<PersonalReflection[]> {
        return await this.storage.getPersonalReflections(userId, limit);
    }
}
