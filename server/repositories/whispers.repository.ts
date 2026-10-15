/**
 * Whispers Repository - Data Access Layer (Wrapper)
 */

import { db } from "../db";
import { whispers, type Whisper, type InsertWhisper } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import * as WhisperRepo from "./whisper.repository";

export class WhispersRepository {
  async getAll(): Promise<Whisper[]> {
    return WhisperRepo.getWhispers(100);
  }

  async getById(id: string): Promise<Whisper | undefined> {
    const result = await db.select().from(whispers).where(eq(whispers.id, id)).limit(1);
    return result[0];
  }

  async getByAuthorId(authorId: string): Promise<Whisper[]> {
    return WhisperRepo.getUserWhispers(authorId);
  }

  async create(data: InsertWhisper): Promise<Whisper> {
    return WhisperRepo.createWhisper(data);
  }

  async delete(id: string): Promise<void> {
    await db.delete(whispers).where(eq(whispers.id, id));
  }
}

export const whispersRepository = new WhispersRepository();
export * from "./whisper.repository";
