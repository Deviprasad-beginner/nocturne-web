import { Request, Response } from "express";
import { ReflectionsService } from "../services/reflections.service";
import type { IStorage } from "../storage";

export class ReflectionsController {
    private reflectionsService: ReflectionsService;

    constructor(storage: IStorage) {
        this.reflectionsService = new ReflectionsService(storage);
    }

    /**
     * GET /api/reflections/prompt
     * Get today's active nightly prompt
     */
    getPrompt = async (req: Request, res: Response) => {
        try {
            const prompt = await this.reflectionsService.getActivePrompt();
            res.json(prompt);
        } catch (error) {
            console.error("Error getting prompt:", error);
            res.status(500).json({ error: "Failed to get nightly prompt" });
        }
    };

    /**
     * POST /api/reflections/respond
     * Submit a response to a prompt
     */
    submitResponse = async (req: Request, res: Response) => {
        try {
            const { promptId, content } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }

            if (!promptId || !content) {
                return res.status(400).json({ error: "Prompt ID and content are required" });
            }

            const reflection = await this.reflectionsService.submitResponse(
                userId,
                promptId,
                content
            );

            res.json(reflection);
        } catch (error) {
            console.error("Error submitting response:", error);
            res.status(500).json({ error: "Failed to submit response" });
        }
    };

    /**
     * GET /api/reflections/history
     * Get user's reflection history
     */
    getHistory = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }

            const limit = parseInt(req.query.limit as string) || 20;
            const reflections = await this.reflectionsService.getUserReflectionHistory(userId, limit);

            res.json(reflections);
        } catch (error) {
            console.error("Error getting history:", error);
            res.status(500).json({ error: "Failed to get reflection history" });
        }
    };

    /**
     * POST /api/reflections/personal
     * Request a personal AI reflection
     */
    requestPersonal = async (req: Request, res: Response) => {
        try {
            const { query } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }

            if (!query) {
                return res.status(400).json({ error: "Query is required" });
            }

            const reflection = await this.reflectionsService.requestPersonalReflection(userId, query);

            res.json(reflection);
        } catch (error) {
            console.error("Error requesting personal reflection:", error);
            res.status(500).json({ error: "Failed to generate personal reflection" });
        }
    };

    /**
     * GET /api/reflections/personal
     * Get user's personal reflections
     */
    getPersonalHistory = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({ error: "Authentication required" });
            }

            const limit = parseInt(req.query.limit as string) || 20;
            const reflections = await this.reflectionsService.getPersonalReflections(userId, limit);

            res.json(reflections);
        } catch (error) {
            console.error("Error getting personal reflections:", error);
            res.status(500).json({ error: "Failed to get personal reflections" });
        }
    };
}
