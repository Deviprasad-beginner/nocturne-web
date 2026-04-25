import { Router } from "express";
import { consciousnessController } from "../../../controllers/consciousness.controller";

const router = Router();

// GET /api/v1/consciousness - Get global state
router.get("/", consciousnessController.getState);

export default router;
