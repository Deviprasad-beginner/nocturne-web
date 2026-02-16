import { Request, Response } from "express";
import { db } from "../db";
import {
    reads,
    readSessions,
    type InsertRead,
    type Read,
    type ReadSession,
} from "@shared/schema";
import { eq, and, desc, or, gt, isNull } from "drizzle-orm";

export const readsController = {
    // Create a new read (upload or paste)
    async createRead(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            let content = "";
            let contentType: "text" | "pdf" | "epub" | "curated" = "text";
            const file = req.file;

            // Handle file upload
            if (file) {
                if (file.mimetype === "application/pdf") {
                    // Extract text from PDF using dynamic import
                    try {
                        const pdfParse = (await import("pdf-parse")).default;
                        const pdfData = await pdfParse(file.buffer);
                        content = pdfData.text;
                        contentType = "pdf";
                    } catch (error) {
                        console.error("PDF parsing error:", error);
                        return res.status(400).json({ error: "Failed to parse PDF file" });
                    }
                } else if (file.mimetype === "text/plain" || file.originalname.endsWith(".txt")) {
                    // Read text file
                    content = file.buffer.toString("utf-8");
                    contentType = "text";
                }
            } else if (req.body.content) {
                // Handle pasted text
                content = req.body.content;
                contentType = "text";
            }

            if (!content || content.trim().length === 0) {
                return res.status(400).json({ error: "No content provided" });
            }

            const { title, author, intention, estimatedReadTimeMinutes, isEphemeral } = req.body;

            // Calculate estimated read time if not provided (avg 200 words per min)
            const wordCount = content.split(/\s+/).length;
            const calculatedReadTime = estimatedReadTimeMinutes || Math.ceil(wordCount / 200);

            // Calculate expiration for ephemeral reads (24 hours)
            const expiresAt = isEphemeral ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

            const newRead = await db
                .insert(reads)
                .values({
                    title: title || "Untitled",
                    author: author || null,
                    content,
                    contentType,
                    estimatedReadTimeMinutes: calculatedReadTime,
                    intention: intention || "think",
                    ownerId: req.user.id,
                    visibility: "private",
                    moderationStatus: "approved",
                    isEphemeral: isEphemeral || false,
                    expiresAt,
                })
                .returning();

            res.status(201).json(newRead[0]);
        } catch (error) {
            console.error("Error creating read:", error);
            res.status(500).json({ error: "Failed to create read" });
        }
    },

    // Get user's private bookshelf
    async getUserReads(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const userReads = await db
                .select()
                .from(reads)
                .where(
                    and(
                        eq(reads.ownerId, req.user.id),
                        eq(reads.visibility, "private"),
                        or(
                            isNull(reads.expiresAt),
                            gt(reads.expiresAt, new Date())
                        )
                    )
                )
                .orderBy(desc(reads.lastAccessedAt), desc(reads.createdAt));

            res.json(userReads);
        } catch (error) {
            console.error("Error fetching user reads:", error);
            res.status(500).json({ error: "Failed to fetch reads" });
        }
    },

    // Get a specific read with session data
    async getRead(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const readId = parseInt(req.params.id);

            const [read] = await db
                .select()
                .from(reads)
                .where(eq(reads.id, readId));

            if (!read) {
                return res.status(404).json({ error: "Read not found" });
            }

            // Check ownership for private reads
            if (read.visibility === "private" && read.ownerId !== req.user.id) {
                return res.status(403).json({ error: "Forbidden" });
            }

            // Get or create reading session
            let [session] = await db
                .select()
                .from(readSessions)
                .where(
                    and(
                        eq(readSessions.readId, readId),
                        eq(readSessions.userId, req.user.id)
                    )
                );

            if (!session) {
                [session] = await db
                    .insert(readSessions)
                    .values({
                        readId,
                        userId: req.user.id,
                        intention: read.intention,
                        lastPosition: 0,
                        lastPositionType: "percentage",
                    })
                    .returning();
            }

            // Update last accessed time
            await db
                .update(reads)
                .set({ lastAccessedAt: new Date() })
                .where(eq(reads.id, readId));

            res.json({ read, session });
        } catch (error) {
            console.error("Error fetching read:", error);
            res.status(500).json({ error: "Failed to fetch read" });
        }
    },

    // Update reading progress
    async updateProgress(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const readId = parseInt(req.params.id);
            const { position, positionType, timeSpentSeconds, completed } = req.body;

            const [session] = await db
                .select()
                .from(readSessions)
                .where(
                    and(
                        eq(readSessions.readId, readId),
                        eq(readSessions.userId, req.user.id)
                    )
                );

            if (!session) {
                return res.status(404).json({ error: "Session not found" });
            }

            await db
                .update(readSessions)
                .set({
                    lastPosition: position,
                    lastPositionType: positionType || "percentage",
                    totalTimeSeconds: (session.totalTimeSeconds || 0) + (timeSpentSeconds || 0),
                    completed: completed || false,
                    lastActivityAt: new Date(),
                })
                .where(eq(readSessions.id, session.id));

            res.json({ success: true });
        } catch (error) {
            console.error("Error updating progress:", error);
            res.status(500).json({ error: "Failed to update progress" });
        }
    },

    // Delete a read
    async deleteRead(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const readId = parseInt(req.params.id);

            const [read] = await db
                .select()
                .from(reads)
                .where(eq(reads.id, readId));

            if (!read) {
                return res.status(404).json({ error: "Read not found" });
            }

            if (read.ownerId !== req.user.id) {
                return res.status(403).json({ error: "Forbidden" });
            }

            await db.delete(reads).where(eq(reads.id, readId));

            res.json({ success: true });
        } catch (error) {
            console.error("Error deleting read:", error);
            res.status(500).json({ error: "Failed to delete read" });
        }
    },

    // Get tonight's curated reads (Phase 2)
    async getTonightReads(req: Request, res: Response) {
        try {
            const curatedReads = await db
                .select()
                .from(reads)
                .where(
                    and(
                        eq(reads.visibility, "curated"),
                        eq(reads.moderationStatus, "approved")
                    )
                )
                .orderBy(desc(reads.createdAt))
                .limit(5);

            // Get reader count for each (simplified - actual implementation would use real-time data)
            const readsWithCounts = curatedReads.map((read) => ({
                ...read,
                readerCountLabel: "quiet", // Placeholder for now
            }));

            res.json(readsWithCounts);
        } catch (error) {
            console.error("Error fetching tonight's reads:", error);
            res.status(500).json({ error: "Failed to fetch curated reads" });
        }
    },
};
