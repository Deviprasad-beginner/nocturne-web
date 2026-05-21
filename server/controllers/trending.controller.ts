import { Request, Response } from "express";
import type { IStorage } from "../storage";

export class TrendingController {
    constructor(private storage: IStorage) {}

    getTopics = async (req: Request, res: Response) => {
        try {
            const trendingTopics = await this.storage.getTrendingTopics();
            res.json({
                success: true,
                data: trendingTopics
            });
        } catch (error: any) {
            console.error("Error fetching trending topics:", error);
            res.status(500).json({
                success: false,
                error: { message: error.message }
            });
        }
    };
}
