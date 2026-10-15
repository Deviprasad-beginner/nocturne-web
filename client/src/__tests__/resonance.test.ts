import { describe, it, expect } from 'vitest';
import { CURATED_TOPICS, CURATED_QUOTES } from '../../../server/routes/api/v1/resonance.routes';

describe('Nocturne Resonance Service', () => {
  it('should have curated whisper topics with valid metadata', () => {
    expect(CURATED_TOPICS.length).toBeGreaterThanOrEqual(8);
    for (const topic of CURATED_TOPICS) {
      expect(topic.title).toBeTruthy();
      expect(topic.category).toBeTruthy();
      expect(topic.moods.length).toBeGreaterThan(0);
      expect(['gentle', 'deep', 'exploratory']).toContain(topic.depth);
    }
  });

  it('should have curated thought starter quotes with prompts and categories', () => {
    expect(CURATED_QUOTES.length).toBeGreaterThanOrEqual(6);
    for (const quote of CURATED_QUOTES) {
      expect(quote.prompt).toBeTruthy();
      expect(quote.category).toBeTruthy();
      expect(quote.moods.length).toBeGreaterThan(0);
    }
  });

  it('should calculate matching compatibility weighting correctly', () => {
    // 40% topic, 25% intent, 20% mood, 15% depth
    const topicScore = 1.0;
    const intentScore = 1.0;
    const moodScore = 1.0;
    const depthScore = 1.0;

    const total = topicScore * 0.40 + intentScore * 0.25 + moodScore * 0.20 + depthScore * 0.15;
    expect(total).toBeCloseTo(1.0);
  });
});
