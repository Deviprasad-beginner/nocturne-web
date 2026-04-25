import { Router } from "express";
import { readsController } from "../controllers/reads.controller";

const router = Router();

// All routes require authentication
router.post("/", readsController.createRead);
router.get("/mine", readsController.getUserReads);
router.get("/tonight", readsController.getTonightReads);
router.get("/:id", readsController.getRead);
router.patch("/:id/progress", readsController.updateProgress);
router.delete("/:id", readsController.deleteRead);

export default router;
