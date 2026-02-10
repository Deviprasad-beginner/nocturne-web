import express from "express";
import { ReflectionsController } from "../controllers/reflections.controller";
import { storage } from "../storage";

const router = express.Router();
const reflectionsController = new ReflectionsController(storage);

// GET /api/reflections/prompt - Get today's nightly prompt
router.get("/prompt", reflectionsController.getPrompt);

// POST /api/reflections/respond - Submit response to a prompt
router.post("/respond", reflectionsController.submitResponse);

// GET /api/reflections/history - Get user's reflection history
router.get("/history", reflectionsController.getHistory);

// POST /api/reflections/personal - Request personal AI reflection
router.post("/personal", reflectionsController.requestPersonal);

// GET /api/reflections/personal - Get personal reflections history
router.get("/personal", reflectionsController.getPersonalHistory);

export default router;
