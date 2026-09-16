import { Request, Response } from "express";
import { db } from "../db";
import { bookDiscussions, bookQuotes, users } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export const booksSocialController = {
    // Get community reviews/discussions for a book
    async getDiscussions(req: Request, res: Response) {
        try {
            const { bookId } = req.params;
            const discussions = await db
                .select({
                    id: bookDiscussions.id,
                    bookId: bookDiscussions.bookId,
                    bookTitle: bookDiscussions.bookTitle,
                    content: bookDiscussions.content,
                    rating: bookDiscussions.rating,
                    createdAt: bookDiscussions.createdAt,
                    author: {
                        id: users.id,
                        username: users.username,
                        displayName: users.displayName,
                    }
                })
                .from(bookDiscussions)
                .leftJoin(users, eq(bookDiscussions.authorId, users.id))
                .where(eq(bookDiscussions.bookId, bookId))
                .orderBy(desc(bookDiscussions.createdAt));
            return res.json({ data: discussions });
        } catch (error: any) {
            console.error("Error fetching discussions:", error);
            return res.status(500).json({ error: "Failed to fetch book discussions" });
        }
    },

    // Create a new night review/POV
    async createDiscussion(req: Request, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ error: "Unauthorized" });
            const { bookId } = req.params;
            const { bookTitle, content, rating, authorName } = req.body;

            if (!content) return res.status(400).json({ error: "Content is required" });

            const [discussion] = await db.insert(bookDiscussions).values({
                bookId,
                bookTitle: bookTitle || "Unknown Book",
                author: authorName,
                content,
                rating,
                authorId: req.user.id,
            }).returning();

            return res.status(201).json({ data: discussion });
        } catch (error: any) {
            console.error("Error creating discussion:", error);
            return res.status(500).json({ error: "Failed to post review" });
        }
    },

    // Get quotes shared by the community for a book
    async getQuotes(req: Request, res: Response) {
        try {
            const { bookId } = req.params;
            const quotes = await db
                .select({
                    id: bookQuotes.id,
                    bookId: bookQuotes.bookId,
                    quoteText: bookQuotes.quoteText,
                    notes: bookQuotes.notes,
                    createdAt: bookQuotes.createdAt,
                    author: {
                        id: users.id,
                        username: users.username,
                        displayName: users.displayName,
                    }
                })
                .from(bookQuotes)
                .leftJoin(users, eq(bookQuotes.authorId, users.id))
                .where(eq(bookQuotes.bookId, bookId))
                .orderBy(desc(bookQuotes.createdAt));
            return res.json({ data: quotes });
        } catch (error: any) {
            console.error("Error fetching quotes:", error);
            return res.status(500).json({ error: "Failed to fetch book quotes" });
        }
    },

    // Share a new quote from the reader
    async shareQuote(req: Request, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ error: "Unauthorized" });
            const { bookId } = req.params;
            const { bookTitle, quoteText, notes } = req.body;

            if (!quoteText) return res.status(400).json({ error: "Quote text is required" });

            const [quote] = await db.insert(bookQuotes).values({
                bookId,
                bookTitle: bookTitle || "Unknown Book",
                quoteText,
                notes,
                authorId: req.user.id,
            }).returning();

            return res.status(201).json({ data: quote });
        } catch (error: any) {
            console.error("Error sharing quote:", error);
            return res.status(500).json({ error: "Failed to share quote" });
        }
    }
};
