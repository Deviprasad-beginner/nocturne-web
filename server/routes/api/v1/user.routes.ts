/**
 * User Routes
 */

import { Router } from "express";
import { userController } from "../../../controllers/user.controller";
import { requireAuth } from "../../../middleware/auth.middleware";

const router = Router();

// All user routes require authentication
router.use(requireAuth);

// GET /api/v1/users/me/whispers - Get current user's whispers
router.get("/me/whispers", userController.getMyWhispers);

// GET /api/v1/users/me/cafe - Get current user's cafe posts
router.get("/me/cafe", userController.getMyCafePosts);

// GET /api/v1/users/me/favorites - Get current user's favorite stations
router.get("/me/favorites", userController.getMyFavorites);

export default router;
