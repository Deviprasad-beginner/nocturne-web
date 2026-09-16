import * as repo from '../repositories/midnight-cafe.repository';
import type { InsertMidnightCafe, InsertCafeReply } from '@shared/schema';

export class MidnightCafeService {
    async getMidnightCafe(limit?: number) {
        return repo.getMidnightCafe(limit);
    }

    async getMidnightCafeById(id: number) {
        return repo.getMidnightCafeById(id);
    }

    async createMidnightCafe(cafe: InsertMidnightCafe) {
        return repo.createMidnightCafe(cafe);
    }

    async deleteCafePost(id: number) {
        return repo.deleteCafePost(id);
    }

    async getCafeReplies(cafeId: number) {
        return repo.getCafeReplies(cafeId);
    }

    async createCafeReply(reply: InsertCafeReply) {
        const newReply = await repo.createCafeReply(reply);
        await repo.incrementCafeReplies(reply.cafeId);
        return newReply;
    }
}

export const midnightCafeService = new MidnightCafeService();
