import { Router } from "express";
import { db } from "../../../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Mark onboarding as complete for current user
router.post("/complete", async (req, res) => {
    try {
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({
                success: false,
                error: { message: "Authentication required" }
            });
        }

        const userId = req.user.id;

        // Update user's hasSeenOnboarding to true
        await db
            .update(users)
            .set({ hasSeenOnboarding: true })
            .where(eq(users.id, userId));

        res.json({
            success: true,
            message: "Onboarding completed"
        });
    } catch (error: any) {
        console.error("Error completing onboarding:", error);
        res.status(500).json({
            success: false,
            error: { message: error.message }
        });
    }
});

export default router;
