/**
 * User Books Routes — Nocturne Gutenberg E-Book Library
 */

import { Router } from "express";
import { userBooksController } from "../../../controllers/user-books.controller";
import { requireAuth } from "../../../middleware/auth.middleware";

const router = Router();

// Public EPUB streaming proxy — no auth needed (book is public domain)
// Must be before requireAuth middleware
router.get("/proxy", userBooksController.proxyEpub);

// All other routes require authentication
router.use(requireAuth);

// GET  /api/v1/user-books/search?query= — search Gutendex
router.get("/search", userBooksController.search);

// GET  /api/v1/user-books — get user's saved library
router.get("/", userBooksController.getLibrary);

// POST /api/v1/user-books — add a book to library
router.post("/", userBooksController.addBook);

// GET  /api/v1/user-books/:id — get a single book by id
router.get("/:id", userBooksController.getBook);

// PATCH /api/v1/user-books/:id/progress — update EpubCFI position
router.patch("/:id/progress", userBooksController.updateProgress);

// DELETE /api/v1/user-books/:id — remove book from library
router.delete("/:id", userBooksController.removeBook);

export default router;
