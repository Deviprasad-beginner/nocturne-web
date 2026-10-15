import { db } from "../db";
import { nightThoughts, NightThought } from "@shared/schema";
import { eq, ne, and, sql, desc, or } from "drizzle-orm";
import { WhisperAnalysis } from "./ai/types";
import { logger } from "../utils/logger";

const WEIGHTS = {
  semanticSimilarity: 0.55,
  topicCompatibility: 0.15,
  toneCompatibility: 0.10,
  intentCompatibility: 0.10,
  recency: 0.05,
  novelty: 0.05
};

export interface ResonanceCandidate {
  thought: NightThought;
  semanticSimilarity: number;
  resonanceScore: number;
  reasons: string[];
}

export class ResonanceEngine {
  
  /**
   * Find resonant thoughts for a newly created whisper.
   */
  async findResonance(
    targetEmbedding: number[],
    targetAnalysis: WhisperAnalysis,
    authorId: string | null
  ): Promise<ResonanceCandidate[]> {
    try {
      // 1. Fetch Candidate Thoughts (last 48 hours, public/anonymous, not own)
      // We calculate semantic similarity directly in the query using pgvector `<=>` operator (cosine distance)
      
      const timeLimit = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours
      
      // Build conditions
      const conditions = [
        sql`${nightThoughts.createdAt} > ${timeLimit.toISOString()}`,
        eq(nightThoughts.isPrivate, false),
        or(eq(nightThoughts.thoughtType, 'whisper'), eq(nightThoughts.thoughtType, 'discussion')),
      ];

      if (authorId) {
        conditions.push(or(ne(nightThoughts.authorId, authorId), sql`${nightThoughts.authorId} IS NULL`));
      }

      const candidatesQuery = await db.execute(sql`
        SELECT *, 
               1 - (embedding <=> ${JSON.stringify(targetEmbedding)}::vector) as semantic_similarity
        FROM night_thoughts
        WHERE created_at > NOW() - INTERVAL '48 hours'
          AND is_private = false
          AND (thought_type = 'whisper' OR thought_type = 'discussion')
          ${authorId ? sql`AND (author_id != ${authorId} OR author_id IS NULL)` : sql``}
          AND embedding IS NOT NULL
          AND ai_metadata IS NOT NULL
        ORDER BY semantic_similarity DESC
        LIMIT 50
      `);

      const candidates: ResonanceCandidate[] = [];

      // 2. Score Candidates
      for (const row of candidatesQuery.rows) {
        const thought = row as unknown as NightThought;
        const semanticSimilarity = Math.max(0, Number(row.semantic_similarity) || 0); // clamp 0-1
        
        // Extract candidate analysis from JSONB
        const candidateAnalysis = thought.aiMetadata as WhisperAnalysis;
        if (!candidateAnalysis) continue;

        let topicScore = 0;
        let toneScore = 0;
        let intentScore = 0;
        let recencyScore = 0;
        let noveltyScore = 1.0; // Assume novel unless we know they matched recently (placeholder)
        const reasons: string[] = [];

        // Calculate Topic Compatibility (Jaccard Index on vibeTags & themes)
        const targetTopicsArr = [...(targetAnalysis.themes || []), ...(targetAnalysis.vibeTags || [])].map(t => t.toLowerCase());
        const candidateTopicsArr = [...(candidateAnalysis.themes || []), ...(candidateAnalysis.vibeTags || [])].map(t => t.toLowerCase());
        const targetTopicsSet = new Set(targetTopicsArr);
        const candidateTopicsSet = new Set(candidateTopicsArr);

        const topicIntersection = targetTopicsArr.filter(x => candidateTopicsSet.has(x));
        const topicUnionSet = new Set([...targetTopicsArr, ...candidateTopicsArr]);
        if (topicUnionSet.size > 0) {
          topicScore = topicIntersection.length / topicUnionSet.size;
          if (topicIntersection.length > 0) {
            reasons.push(`shared themes: ${topicIntersection.slice(0, 2).join(', ')}`);
          }
        }

        // Calculate Tone Compatibility
        const targetTonesArr = (targetAnalysis.tone || []).map(t => t.toLowerCase());
        const candidateTonesArr = (candidateAnalysis.tone || []).map(t => t.toLowerCase());
        const candidateTonesSet = new Set(candidateTonesArr);
        const toneIntersection = targetTonesArr.filter(x => candidateTonesSet.has(x));
        if (targetTonesArr.length > 0 || candidateTonesArr.length > 0) {
          const toneUnionSize = new Set([...targetTonesArr, ...candidateTonesArr]).size;
          toneScore = toneUnionSize > 0 ? toneIntersection.length / toneUnionSize : 0;
          if (toneIntersection.length > 0) {
            reasons.push(`similar tone: ${toneIntersection[0]}`);
          }
        }

        // Calculate Intent Compatibility
        if (targetAnalysis.intent && candidateAnalysis.intent && 
            targetAnalysis.intent.toLowerCase() === candidateAnalysis.intent.toLowerCase()) {
          intentScore = 1.0;
          reasons.push(`shared intent: ${targetAnalysis.intent.toLowerCase()}`);
        } else if (targetAnalysis.socialIntent === candidateAnalysis.socialIntent) {
          intentScore = 0.5;
        }

        // Calculate Recency (decay over 48 hours)
        const ageMs = Date.now() - new Date(thought.createdAt || Date.now()).getTime();
        const maxAgeMs = 48 * 60 * 60 * 1000;
        recencyScore = Math.max(0, 1.0 - (ageMs / maxAgeMs));

        // Total Resonance Score
        const resonanceScore = (
          (semanticSimilarity * WEIGHTS.semanticSimilarity) +
          (topicScore * WEIGHTS.topicCompatibility) +
          (toneScore * WEIGHTS.toneCompatibility) +
          (intentScore * WEIGHTS.intentCompatibility) +
          (recencyScore * WEIGHTS.recency) +
          (noveltyScore * WEIGHTS.novelty)
        );

        // Include if semantic similarity is reasonably high and total score is decent
        if (resonanceScore > 0.60) {
          candidates.push({
            thought,
            semanticSimilarity,
            resonanceScore,
            reasons
          });
        }
      }

      // 3. Rank Candidates
      candidates.sort((a, b) => b.resonanceScore - a.resonanceScore);

      return candidates.slice(0, 5); // Return top 5 strongest resonances
    } catch (error) {
      logger.error("Error calculating resonance", error);
      return [];
    }
  }
}

export const resonanceEngine = new ResonanceEngine();
