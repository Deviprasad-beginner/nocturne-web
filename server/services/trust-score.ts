import { User } from "@shared/schema";

/**
 * Calculate user trust score based on their activity and behavior.
 * Score ranges from 0 to 100.
 */
export function calculateTrustScore(user: User): number {
    let score = 0;

    // Base score from streaks (consistency)
    score += (user.nightStreak || 0) * 2;

    // Engagement score (positive interactions)
    score += (user.meaningfulReplies || 0) * 3;

    // Penalty for reports (negative behavior)
    score -= (user.reportCount || 0) * 5;

    // Account age bonus (loyalty) logic could go here
    if (user.createdAt) {
        const daysSinceJoined = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        score += Math.min(daysSinceJoined / 7, 10); // Max 10 points for account age
    }

    // Activity bonus if user has a profile picture
    if (user.profileImageUrl) {
        score += 5;
    }

    // Clamp score between 0 and 100
    return Math.round(Math.max(0, Math.min(score, 100)));
}
