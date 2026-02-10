import { Router } from "express";
import { readsController } from "../../../controllers/reads.controller";
import { requireAuth } from "../../../middleware/auth.middleware";
import { uploadSingle } from "../../../middleware/upload.middleware";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Upload file or paste text
router.post("/", uploadSingle, readsController.createRead);
router.get("/mine", readsController.getUserReads);
router.get("/tonight", readsController.getTonightReads);
router.get("/:id", readsController.getRead);
router.patch("/:id/progress", readsController.updateProgress);
router.delete("/:id", readsController.deleteRead);

export default router;
