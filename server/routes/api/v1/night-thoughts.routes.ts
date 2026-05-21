import { Router } from "express";
import { nightThoughtsController } from "../../../controllers/night-thoughts.controller";

const router = Router();

// GET /api/v1/thoughts - Get all night thoughts with optional filters
router.get("/", nightThoughtsController.getAll);

// GET /api/v1/thoughts/:id - Get a single thought by ID
router.get("/:id", nightThoughtsController.getById);

// POST /api/v1/thoughts - Create a new night thought
router.post("/", nightThoughtsController.create);

// PATCH /api/v1/thoughts/:id - Update a thought
router.patch("/:id", nightThoughtsController.update);

// DELETE /api/v1/thoughts/:id - Delete a thought
router.delete("/:id", nightThoughtsController.delete);

// POST /api/v1/thoughts/:id/heart - Add a heart to a thought
router.post("/:id/heart", nightThoughtsController.addHeart);

// GET /api/v1/thoughts/:id/replies - Fetch all replies for a thought
router.get("/:id/replies", nightThoughtsController.getReplies);

// POST /api/v1/thoughts/:id/replies - Post a new reply to a thought
router.post("/:id/replies", nightThoughtsController.addReply);

export default router;
