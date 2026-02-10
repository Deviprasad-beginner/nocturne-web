import express from "express";
import { communityService } from "../services/communityService";
import { insertAmFounderSchema, insertStarlitSpeakerSchema, insertMoonMessengerSchema } from "@shared/schema";

const router = express.Router();

// ============================================================================
// 3AM FOUNDER
// ============================================================================
router.get("/founder", async (req, res) => {
    try {
        const founders = await communityService.getFounderPosts();
        res.json(founders);
    } catch (error) {
        console.error("Error getting founders:", error);
        res.status(500).json({ error: "Failed to fetch founders" });
    }
});

router.post("/founder", async (req, res) => {
    try {
        const founderData = insertAmFounderSchema.parse({
            ...req.body,
            authorId: req.user?.id
        });
        const founder = await communityService.createFounderPost(founderData);
        res.status(201).json({ success: true, data: founder });
    } catch (error) {
        console.error("Error creating founder post:", error);
        res.status(400).json({ error: "Invalid founder data" });
    }
});

router.patch("/founder/:id/upvote", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await communityService.incrementFounderUpvotes(id);
        res.json({ success: true });
    } catch (error) {
        console.error("Error incrementing upvotes:", error);
        res.status(500).json({ error: "Failed to increment upvotes" });
    }
});

router.patch("/founder/:id/comments", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await communityService.incrementFounderComments(id);
        res.json({ success: true });
    } catch (error) {
        console.error("Error incrementing comments:", error);
        res.status(500).json({ error: "Failed to increment comments" });
    }
});

// ============================================================================
// STARLIT SPEAKER (Voice Rooms)
// ============================================================================
router.get("/speaker", async (req, res) => {
    try {
        const speakers = await communityService.getSpeakerRooms();
        res.json(speakers);
    } catch (error) {
        console.error("Error getting speakers:", error);
        res.status(500).json({ error: "Failed to fetch speakers" });
    }
});

router.post("/speaker", async (req, res) => {
    try {
        const speakerData = insertStarlitSpeakerSchema.parse(req.body);
        const speaker = await communityService.createSpeakerRoom(speakerData);
        res.status(201).json(speaker);
    } catch (error) {
        console.error("Error creating speaker:", error);
        res.status(400).json({ error: "Invalid speaker data" });
    }
});

router.patch("/speaker/:id/participants", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { participants } = req.body;
        await communityService.updateSpeakerParticipants(id, participants);
        res.json({ success: true });
    } catch (error) {
        console.error("Error updating participants:", error);
        res.status(500).json({ error: "Failed to update participants" });
    }
});

// ============================================================================
// MOON MESSENGER (Anonymous Chat)
// ============================================================================
router.get("/messenger/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;
        const messages = await communityService.getMessages(sessionId);
        res.json(messages);
    } catch (error) {
        console.error("Error getting messages:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

router.post("/messenger", async (req, res) => {
    try {
        const messageData = insertMoonMessengerSchema.parse(req.body);
        const message = await communityService.createMessage(messageData);
        res.status(201).json(message);
    } catch (error) {
        console.error("Error creating message:", error);
        res.status(400).json({ error: "Invalid message data" });
    }
});

router.get("/messenger", async (req, res) => {
    try {
        const sessions = await communityService.getActiveSessions();
        res.json(sessions);
    } catch (error) {
        console.error("Error getting sessions:", error);
        res.status(500).json({ error: "Failed to fetch sessions" });
    }
});

export default router;
