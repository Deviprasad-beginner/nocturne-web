export interface WhisperAnalysis {
  themes: string[];
  tone: string[];
  intent: string;
  energy: string;
  reflectionDepth: number; // 0.0 to 1.0
  vulnerability: number; // 0.0 to 1.0
  socialIntent: string;
  vibeTags: string[];
  summary: string;
}

export interface AIAnalyzer {
  analyzeWhisper(text: string): Promise<WhisperAnalysis>;
}

export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}
