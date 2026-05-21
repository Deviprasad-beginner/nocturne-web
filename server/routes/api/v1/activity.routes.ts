import { Router } from "express";
import { ActivityController } from "../../../controllers/activity.controller";
import { storage } from "../../../storage";

const router = Router();
const activityController = new ActivityController(storage);

// Get recent activity across the platform
router.get("/recent", activityController.getRecent);

// Get activity stats
router.get("/stats", activityController.getStats);

export default router;
