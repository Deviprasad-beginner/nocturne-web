/**
 * Books Routes — powered by Gutendex (Project Gutenberg)
 */

import { Router } from "express";
import { booksController } from "../../../controllers/books.controller";

const router = Router();

// GET /api/v1/books/search?query=&page=&topic=
router.get("/search", booksController.search);

// GET /api/v1/books/featured
router.get("/featured", booksController.featured);
// GET /api/v1/books/openlibrary/search
router.get("/openlibrary/search", booksController.openLibrarySearch);

// GET /api/v1/books/:id
router.get("/:id", booksController.getBook);

export default router;
