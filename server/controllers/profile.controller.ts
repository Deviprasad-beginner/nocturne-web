import { Request, Response } from "express";
import type { IStorage } from "../storage";

export class ProfileController {
    constructor(private storage: IStorage) {}

    getStats = async (req: Request, res: Response) => {
        try {
            if (!req.isAuthenticated() || !req.user) {
                return res.status(401).json({
                    success: false,
                    error: { message: "Authentication required" }
                });
            }

            const userId = req.user.id;
            const stats = await this.storage.getUserProfileStats(userId);

            res.json({
                success: true,
                data: stats
            });
        } catch (error: any) {
            console.error("Error fetching user stats:", error);
            res.status(500).json({
                success: false,
                error: { message: error.message }
            });
        }
    };

    getAchievements = async (req: Request, res: Response) => {
        try {
            if (!req.isAuthenticated() || !req.user) {
                return res.status(401).json({
                    success: false,
                    error: { message: "Authentication required" }
                });
            }

            const userId = req.user.id;
            const achievements = await this.storage.getUserAchievements(userId);

            res.json({
                success: true,
                data: achievements
            });
        } catch (error: any) {
            console.error("Error fetching achievements:", error);
            res.status(500).json({
                success: false,
                error: { message: error.message }
            });
        }
    };
}
