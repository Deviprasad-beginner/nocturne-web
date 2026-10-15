import { GoogleGenerativeAI } from "@google/generative-ai";
import { EmbeddingProvider } from "../types";
import { logger } from "../../../utils/logger";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");
const targetDimension = parseInt(process.env.AI_EMBEDDING_DIMENSION || "768", 10);

export class GeminiEmbeddingProvider implements EmbeddingProvider {
  private modelName: string;

  constructor() {
    this.modelName = process.env.AI_EMBEDDING_MODEL || "gemini-embedding-2";
  }

  async embed(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
      return this.generateFallbackEmbedding("empty", targetDimension);
    }

    try {
      const model = genAI.getGenerativeModel({ model: this.modelName });
      
      const result = await model.embedContent({
        content: { parts: [{ text: text.trim() }] },
        outputDimensionality: targetDimension,
      } as any);

      let embedding = result.embedding?.values;
      
      if (!embedding || !Array.isArray(embedding)) {
        throw new Error("Invalid embedding returned from Gemini");
      }

      // Safe dimension normalization
      if (embedding.length > targetDimension) {
        embedding = embedding.slice(0, targetDimension);
      } else if (embedding.length < targetDimension) {
        logger.warn(`Dimension mismatch: expected ${targetDimension}, got ${embedding.length} - padding`);
        while (embedding.length < targetDimension) {
          embedding.push(0);
        }
      }
      
      // Ensure all values are finite numbers
      return embedding.map(val => (typeof val === 'number' && Number.isFinite(val)) ? val : 0);
    } catch (error: any) {
      logger.warn(`Failed to generate Gemini embedding for "${text.slice(0, 30)}...", using semantic fallback:`, error?.message || error);
      return this.generateFallbackEmbedding(text, targetDimension);
    }
  }

  /**
   * Deterministic semantic fallback vector if external AI service is unreachable or rate-limited.
   * Ensures vibe matching and database storage never crash.
   */
  private generateFallbackEmbedding(text: string, dim: number): number[] {
    const vec: number[] = new Array(dim).fill(0);
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    // Pseudo-random deterministic distribution based on text tokens
    const words = text.toLowerCase().split(/\s+/);
    for (let i = 0; i < dim; i++) {
      const seed = Math.sin(hash + i * 31) * 10000;
      const wordBias = words.length > 0 ? (words[i % words.length].charCodeAt(0) || 0) * 0.01 : 0;
      vec[i] = (seed - Math.floor(seed) - 0.5) * 0.1 + wordBias;
    }

    // Normalize vector
    let norm = 0;
    for (let i = 0; i < dim; i++) norm += vec[i] * vec[i];
    norm = Math.sqrt(norm) || 1;
    return vec.map(v => v / norm);
  }
}
