import { db } from "../db";
import { whispers, globalConsciousness } from "@shared/schema";
import { desc, sql } from "drizzle-orm";

export class ConsciousnessService {

    static async getGlobalState() {
        // Get the latest state
        const [state] = await db.select()
            .from(globalConsciousness)
            .orderBy(desc(globalConsciousness.lastUpdated))
            .limit(1);

        if (state) return state;

        // If no state, create initial
        const [newState] = await db.insert(globalConsciousness).values({
            activityLevel: 'low',
            connectedEntities: 1,
            currentDominantEmotion: 'neutral',
            realmStability: 100
        }).returning();

        return newState;
    }

    static async updateGlobalState() {
        // Calculate new metrics
        // For now, simple aggregation
        const recentWhispers = await db.select({
            emotion: whispers.detectedEmotion
        }).from(whispers).limit(100);

        const emotionCounts: Record<string, number> = {};
        recentWhispers.forEach(w => {
            const e = w.emotion || 'neutral';
            emotionCounts[e] = (emotionCounts[e] || 0) + 1;
        });

        let dominant = 'neutral';
        let max = 0;
        for (const [e, count] of Object.entries(emotionCounts)) {
            if (count > max) {
                max = count;
                dominant = e;
            }
        }

        const activity = recentWhispers.length > 50 ? 'high' : (recentWhispers.length > 20 ? 'moderate' : 'low');

        const [newState] = await db.insert(globalConsciousness).values({
            activityLevel: activity,
            connectedEntities: Math.floor(Math.random() * 100) + 50, // Mock for now
            currentDominantEmotion: dominant,
            realmStability: 80 + Math.floor(Math.random() * 20),
        }).returning();

        return newState;
    }
}
