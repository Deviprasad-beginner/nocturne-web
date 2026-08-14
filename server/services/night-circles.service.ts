/**
 * Night Circles Service 2.0
 * Anonymous intimate discussion circles with lifecycle management, emotion tracking, and AI seed prompts
 */

import { db } from "../db";
import {
    nightCircles, circleMembers, circleMessages,
    type NightCircle, type InsertNightCircle, type CircleMember, type CircleMessage,
} from "@shared/schema";
import { eq, desc, and, sql, ne } from "drizzle-orm";
import { NotFoundError } from "../utils/errors";
import { logger } from "../utils/logger";
import { analyzeEmotion } from "./emotion-analyzer";

// ─── Anonymous identity pool ─────────────────────────────────────────────────

const ALIASES = [
    "Silent Moon", "Night Wanderer", "Unknown Voice", "Midnight Soul",
    "Fading Echo", "Lone Star", "Shadow Thinker", "Void Listener",
];

const AVATARS = ["moon_1", "moon_2", "moon_3", "star_1", "star_2", "void_1"];

// AI seed messages shown when circle has < 2 members
const AI_SEED_MESSAGES = [
    "What keeps you awake tonight?",
    "What are you feeling right now?",
    "What changed you recently?",
    "What are you carrying that no one else knows about?",
    "If this moment had a color, what would it be?",
];

// ─── Lifecycle state engine ───────────────────────────────────────────────────

type CircleState = "forming" | "active" | "deep_phase" | "closing" | "ended";

function deriveState(memberCount: number, isJoining: boolean): CircleState {
    if (memberCount === 0) return "ended";
    if (memberCount === 1 && !isJoining) return "closing";
    if (memberCount <= 2) return "forming";
    if (memberCount <= 3) return "active";
    return "deep_phase";
}

// ─── Emotion aggregation ─────────────────────────────────────────────────────

const EMOTION_VIBE_MAP: Record<string, number> = {
    calm: 20, lonely: 30, curious: 50, deep: 70, emotional: 80, chaotic: 95, neutral: 40,
};

// ─── Service class ────────────────────────────────────────────────────────────

export class NightCirclesService {

    // ── Assign a unique alias to a user joining a circle ──────────────────────
    private async assignAlias(circleId: number): Promise<{ alias: string; avatar: string }> {
        const currentMembersResult = await db
            .select({ alias: circleMembers.alias })
            .from(circleMembers)
            .where(and(eq(circleMembers.circleId, circleId), eq(circleMembers.state, "active")));

        const usedAliases = new Set(currentMembersResult.map(m => m.alias));
        const available = ALIASES.filter(a => !usedAliases.has(a));
        const alias = available.length > 0
            ? available[Math.floor(Math.random() * available.length)]
            : `Night Soul ${Math.floor(Math.random() * 99)}`;

        const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
        return { alias, avatar };
    }

    // ── Get all active (non-ended) circles ────────────────────────────────────
    async getAllCircles(): Promise<NightCircle[]> {
        try {
            const now = new Date();
            return await db
                .select()
                .from(nightCircles)
                .where(
                    and(
                        eq(nightCircles.isActive, true),
                        ne(nightCircles.state, "ended")
                    )
                )
                .orderBy(desc(nightCircles.createdAt));
        } catch (error) {
            logger.error("Error fetching night circles", error);
            return [];
        }
    }

    // ── Get a single circle by ID ─────────────────────────────────────────────
    async getCircleById(id: number): Promise<NightCircle> {
        const [circle] = await db.select().from(nightCircles).where(eq(nightCircles.id, id));
        if (!circle) throw new NotFoundError(`Circle ${id} not found`);
        return circle;
    }

    // ── Quick Join: match engine ───────────────────────────────────────────────
    async quickJoin(
        userId: number | undefined,
        mood?: string,
        preferredMode: "silent" | "listener" | "speaker" = "listener",
        preferredEmotion?: string,
        size: "group" | "duo" = "group"
    ): Promise<{ circle: NightCircle; member: CircleMember; isAiSeed: boolean }> {
        // Priority: emotional match → available capacity → activity level → lifecycle

        let best: NightCircle | null = null;
        const targetMaxMembers = size === "duo" ? 2 : 8;

        if (preferredEmotion) {
            // Find a circle matching the desired emotion with capacity and correct size
            const matches = await db.select().from(nightCircles)
                .where(
                    and(
                        eq(nightCircles.primaryEmotion, preferredEmotion),
                        ne(nightCircles.state, "ended"),
                        ne(nightCircles.state, "closing"),
                        eq(nightCircles.maxMembers, targetMaxMembers),
                        sql`COALESCE(${nightCircles.currentMembers}, 0) < COALESCE(${nightCircles.maxMembers}, ${targetMaxMembers})`
                    )
                ).limit(1);
            if (matches.length > 0) best = matches[0];
        }

        if (!best) {
            // Fallback: Pick any forming or active circle with capacity of the correct size
            const matches = await db.select().from(nightCircles)
                .where(
                    and(
                        ne(nightCircles.state, "ended"),
                        ne(nightCircles.state, "closing"),
                        eq(nightCircles.maxMembers, targetMaxMembers),
                        sql`COALESCE(${nightCircles.currentMembers}, 0) < COALESCE(${nightCircles.maxMembers}, ${targetMaxMembers})`
                    )
                ).orderBy(desc(nightCircles.state)).limit(1);
            if (matches.length > 0) best = matches[0];
        }

        // If no circles exist, create one automatically
        if (!best) {
            best = await this.createCircle({
                name: size === "duo" ? `Two Souls in the Night` : `Circle ${Math.floor(Math.random() * 900) + 100}`,
                description: size === "duo" ? "An intimate one-on-one connection" : "A space formed in the night",
                maxMembers: targetMaxMembers,
            });
        }

        const member = await this.joinCircle(best.id, userId, preferredMode);

        // Reload circle after member update
        const updatedCircle = await this.getCircleById(best.id);

        const isAiSeed = (updatedCircle.currentMembers ?? 0) < 2;
        return { circle: updatedCircle, member, isAiSeed };
    }

    // ── Create a new circle ───────────────────────────────────────────────────
    async createCircle(data: InsertNightCircle): Promise<NightCircle> {
        logger.info("Creating new night circle", { name: data.name });

        const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours
        const [circle] = await db.insert(nightCircles).values({
            ...data,
            state: "forming",
            expiresAt,
        }).returning();

        return circle;
    }

    // ── Join a circle: assign alias, record membership, update lifecycle ───────
    async joinCircle(
        circleId: number,
        userId: number | undefined,
        mode: "silent" | "listener" | "speaker" = "listener"
    ): Promise<CircleMember> {
        return await db.transaction(async (tx) => {
            const [circle] = await tx.select().from(nightCircles).where(eq(nightCircles.id, circleId));

            if (!circle) {
                throw new Error("Circle not found");
            }
            if ((circle.currentMembers ?? 0) >= (circle.maxMembers ?? 8)) {
                throw new Error("Circle is at full capacity");
            }

            const { alias, avatar } = await this.assignAlias(circleId);

            const [member] = await tx.insert(circleMembers).values({
                circleId,
                userId: userId ?? null,
                alias,
                avatar,
                mode,
                state: "active",
            }).returning();

            const newCount = (circle.currentMembers ?? 0) + 1;
            const newState = deriveState(newCount, true);

            await tx.update(nightCircles)
                .set({
                    currentMembers: newCount,
                    state: newState,
                    isActive: newState !== "ended",
                })
                .where(eq(nightCircles.id, circleId));

            logger.info(`User joined circle ${circleId} as "${alias}" [${mode}]`);
            return member;
        });
    }

    // ── Leave a circle: decrement member count, update lifecycle ──────────────
    async leaveCircle(circleId: number, userId: number): Promise<void> {
        await db.transaction(async (tx) => {
            const [member] = await tx
                .select()
                .from(circleMembers)
                .where(
                    and(
                        eq(circleMembers.circleId, circleId),
                        eq(circleMembers.userId, userId),
                        eq(circleMembers.state, "active")
                    )
                )
                .limit(1);

            if (!member) return;

            await tx.update(circleMembers)
                .set({ state: "inactive", leftAt: new Date() })
                .where(eq(circleMembers.id, member.id));

            const [circle] = await tx.select().from(nightCircles).where(eq(nightCircles.id, circleId));
            if (circle) {
                const newCount = Math.max(0, (circle.currentMembers ?? 1) - 1);
                const newState = deriveState(newCount, false);

                await tx.update(nightCircles)
                    .set({
                        currentMembers: newCount,
                        state: newState,
                        isActive: newState !== "ended",
                    })
                    .where(eq(nightCircles.id, circleId));

                logger.info(`User left circle ${circleId} (alias: ${member.alias})`);
            }
        });
    }

    // ── Send a message and update circle emotion ──────────────────────────────
    async sendMessage(
        circleId: number,
        senderAlias: string,
        content: string,
        imageUrl?: string
    ): Promise<CircleMessage> {
        const emotion = analyzeEmotion(content || "image");

        const [message] = await db.insert(circleMessages).values({
            circleId,
            senderAlias,
            content: content || "",
            imageUrl,
            sentimentScore: emotion.sentimentScore,
        }).returning();

        // Recalculate circle emotion from recent 20 messages
        const recent = await db
            .select({ sentimentScore: circleMessages.sentimentScore })
            .from(circleMessages)
            .where(eq(circleMessages.circleId, circleId))
            .orderBy(desc(circleMessages.createdAt))
            .limit(20);

        const avg = recent.length > 0
            ? Math.round(recent.reduce((s, m) => s + (m.sentimentScore ?? 0), 0) / recent.length)
            : 0;

        // Map average sentiment to an emotion label
        let primary = "calm";
        if (avg > 3) primary = "curious";
        else if (avg > 1) primary = "deep";
        else if (avg < -3) primary = "emotional";
        else if (avg < -1) primary = "lonely";
        const vibeScore = EMOTION_VIBE_MAP[primary] ?? 40;

        await db.update(nightCircles)
            .set({ primaryEmotion: primary, vibeScore })
            .where(eq(nightCircles.id, circleId));

        return message;
    }

    // ── Get messages for a circle ─────────────────────────────────────────────
    async getMessages(circleId: number, limit = 50): Promise<CircleMessage[]> {
        return await db
            .select()
            .from(circleMessages)
            .where(eq(circleMessages.circleId, circleId))
            .orderBy(desc(circleMessages.createdAt))
            .limit(limit);
    }

    // ── Get active members in a circle ────────────────────────────────────────
    async getMembers(circleId: number): Promise<CircleMember[]> {
        return await db
            .select()
            .from(circleMembers)
            .where(and(eq(circleMembers.circleId, circleId), eq(circleMembers.state, "active")));
    }

    // ── Get a random AI seed message ─────────────────────────────────────────
    getAiSeedMessage(): string {
        return AI_SEED_MESSAGES[Math.floor(Math.random() * AI_SEED_MESSAGES.length)];
    }

    // ── Delete expired circles ────────────────────────────────────────────────
    async cleanupExpired(): Promise<number> {
        const now = new Date();
        const result = await db.update(nightCircles)
            .set({ state: "ended", isActive: false })
            .where(
                and(
                    sql`${nightCircles.expiresAt} < ${now}`,
                    ne(nightCircles.state, "ended")
                )
            )
            .returning();

        return result.length;
    }
}

export const nightCirclesService = new NightCirclesService();
