/**
 * Content Safety Service
 * Detects self-harm triggers, severe harassment, and toxic patterns.
 * Provides supportive intervention resources when crisis triggers are detected.
 */

export interface SafetyCheckResult {
  isSafe: boolean;
  flag?: 'self_harm' | 'severe_toxicity' | 'harassment';
  reason?: string;
  crisisResources?: {
    message: string;
    helpline: string;
    sms: string;
    website: string;
  };
}

// Regex patterns for crisis & self-harm detection
const SELF_HARM_PATTERNS = [
  /\b(kill\s+(my|one)?self|suicide|end\s+my\s+life|slit\s+my\s+(wrist|wrists|throat)|hang\s+myself|overdose\s+on)\b/i,
  /\b(want\s+to\s+die|wish\s+i\s+was\s+dead|don'?t\s+want\s+to\s+(live|wake\s+up)\s+anymore)\b/i,
  /\b(cutting\s+myself|self[\s-]harm|hurt\s+myself)\b/i,
  /\b(goodbye\s+cruel\s+world|final\s+goodbye|planning\s+my\s+suicide)\b/i,
];

// Patterns for abusive, hateful, or severely toxic content
const TOXIC_PATTERNS = [
  /\b(kys|kill\s+yourself|go\s+die)\b/i,
  /\b(nazi|hitler|faggot|nigger|retard)\b/i,
];

export function evaluateContentSafety(content: string): SafetyCheckResult {
  if (!content || !content.trim()) {
    return { isSafe: true };
  }

  const normalized = content.trim().toLowerCase();

  // Check self-harm triggers first
  for (const pattern of SELF_HARM_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        isSafe: false,
        flag: 'self_harm',
        reason: 'Content contains potential self-harm or crisis indicators.',
        crisisResources: {
          message: 'You are not alone in the dark. Help and compassionate support are always available.',
          helpline: '988 (Suicide & Crisis Lifeline, US/Canada) or 111 (UK)',
          sms: 'Text HOME to 741741 (Crisis Text Line)',
          website: 'https://findahelpline.com',
        },
      };
    }
  }

  // Check toxic / harassment triggers
  for (const pattern of TOXIC_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        isSafe: false,
        flag: 'severe_toxicity',
        reason: 'Content contains prohibited language violating Nocturne midnight safety standards.',
      };
    }
  }

  return { isSafe: true };
}
