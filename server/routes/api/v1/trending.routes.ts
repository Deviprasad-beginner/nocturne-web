import { Router } from "express";
import { TrendingController } from "../../../controllers/trending.controller";
import { storage } from "../../../storage";

const router = Router();
const trendingController = new TrendingController(storage);

// Get trending topics based on user engagement
router.get("/topics", trendingController.getTopics);

export default router;
