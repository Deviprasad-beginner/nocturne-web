import { GeminiWhisperAnalyzer } from "./gemini/analyzer";
import { GeminiEmbeddingProvider } from "./gemini/embeddings";
import { AIAnalyzer, EmbeddingProvider } from "./types";

// Export the selected providers. This makes it easy to swap them out in the future.
export const aiAnalyzer: AIAnalyzer = new GeminiWhisperAnalyzer();
export const embeddingProvider: EmbeddingProvider = new GeminiEmbeddingProvider();

export * from "./types";
