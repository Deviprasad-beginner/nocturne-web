import { Router } from "express";
import { readsController } from "../../../controllers/reads.controller";
import { readAnalysisController } from "../../../controllers/read-analysis.controller";
import { requireAuth } from "../../../middleware/auth.middleware";
import { uploadSingle } from "../../../middleware/upload.middleware";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Mood analysis (no file upload needed)
router.post("/analyze-mood", readAnalysisController.analyzeMood);

// Upload file or paste text
router.post("/", uploadSingle, readsController.createRead);
router.get("/mine", readsController.getUserReads);
router.get("/tonight", readsController.getTonightReads);
router.get("/:id", readsController.getRead);
router.patch("/:id/progress", readsController.updateProgress);
router.delete("/:id", readsController.deleteRead);

export default router;
