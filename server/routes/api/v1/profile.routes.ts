import { Router } from "express";
import { ProfileController } from "../../../controllers/profile.controller";
import { storage } from "../../../storage";

const router = Router();
const profileController = new ProfileController(storage);

// Get user's profile stats
router.get("/stats", profileController.getStats);

// Get user's achievements
router.get("/achievements", profileController.getAchievements);

export default router;
