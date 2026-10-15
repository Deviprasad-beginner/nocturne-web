import { useMemo } from 'react';

export interface Reply {
    id: number;
    createdAt: Date | string;
    // ... other properties
}

export function useThreadVelocity(replies: Reply[]) {
    return useMemo(() => {
        if (!replies || replies.length === 0) {
            return { repliesPerMinute: 0, isFastMoving: false };
        }

        const now = Date.now();
        const FIVE_MINUTES_MS = 5 * 60 * 1000;
        const fiveMinutesAgo = now - FIVE_MINUTES_MS;

        // Count replies in the last 5 minutes
        let recentRepliesCount = 0;
        for (const reply of replies) {
            const replyTime = new Date(reply.createdAt).getTime();
            if (replyTime >= fiveMinutesAgo && replyTime <= now) {
                recentRepliesCount++;
            }
        }

        const repliesPerMinute = recentRepliesCount / 5;
        // Velocity Bridge spec: > 10 replies in 5 minutes
        const isFastMoving = recentRepliesCount > 10;

        return {
            repliesPerMinute,
            isFastMoving,
            recentRepliesCount
        };
    }, [replies]);
}
