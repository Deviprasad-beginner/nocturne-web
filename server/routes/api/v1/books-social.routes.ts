import { Router } from "express";
import { booksSocialController } from "../../../controllers/books-social.controller";
import { requireAuth } from "../../../middleware/auth.middleware";

const router = Router();

// Retrieve reviews and quotes (public can read, authenticated can post)
router.get("/:bookId/discussions", booksSocialController.getDiscussions);
router.post("/:bookId/discussions", requireAuth, booksSocialController.createDiscussion);

router.get("/:bookId/quotes", booksSocialController.getQuotes);
router.post("/:bookId/quotes", requireAuth, booksSocialController.shareQuote);

export default router;
