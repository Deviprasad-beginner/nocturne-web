import { Request, Response } from "express";
import type { IStorage } from "../storage";
import { logger } from "../utils/logger";

export class ActivityController {
    constructor(private storage: IStorage) {}

    getRecent = async (req: Request, res: Response) => {
        const MAX_RETRIES = 2;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const combined = await this.storage.getRecentActivity(20);
                return res.json({ success: true, data: combined });
            } catch (error: any) {
                const isNetworkError = ["ENOTFOUND", "ECONNREFUSED", "ETIMEDOUT"].includes(error.code);

                if (isNetworkError && attempt < MAX_RETRIES) {
                    logger.warn(`[activity/recent] Network error on attempt ${attempt}, retrying...`);
                    await new Promise((r) => setTimeout(r, 1000));
                    continue;
                }

                logger.error(`[activity/recent] Failed after ${attempt} attempt(s): ${error.message}`);
                return res.json({ success: true, data: [] });
            }
        }
    };

    getStats = async (req: Request, res: Response) => {
        try {
            const stats = await this.storage.getActivityStats();
            res.json({
                success: true,
                data: stats,
            });
        } catch (error: any) {
            logger.error("Error fetching activity stats:", error);
            res.json({ success: true, data: { diaries_today: 0, whispers_today: 0, cafe_today: 0, active_users_today: 0 } });
        }
    };
}
