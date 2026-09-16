/**
 * Design Tokens — single source of truth for the Nocturne mobile design system.
 *
 * All color, spacing, radius, and typography values live here.
 * Import this instead of hardcoding values in screens or components.
 */

export const Colors = {
    /** Pure black background — OLED friendly */
    bg: '#000000',
    /** Elevated surface (cards, modals) */
    surface: '#0a0a0a',
    /** Second-level surface (inputs, nested cards) */
    surface2: '#111111',
    /** Subtle separator lines */
    border: 'rgba(255, 255, 255, 0.06)',
    /** Slightly stronger border for focused/active states */
    borderActive: 'rgba(255, 255, 255, 0.12)',

    /** Primary text — headings, important labels */
    text: '#F5F5F7',
    /** Secondary text — descriptions, subtitles */
    textSecondary: '#8E8E93',
    /** Tertiary text — timestamps, footnotes */
    textTertiary: '#48484A',
    /** Placeholder text in inputs */
    placeholder: '#3A3A3C',

    /** Brand indigo — primary accent */
    indigo: '#818CF8',
    /** Purple accent */
    purple: '#A78BFA',
    /** Pink accent */
    pink: '#FB7185',
    /** Amber/gold accent */
    amber: '#FBBF24',
    /** Green accent — success, active states */
    green: '#34D399',
    /** Blue accent */
    blue: '#60A5FA',
    /** Orange accent */
    orange: '#FB923C',
    /** Cyan accent */
    cyan: '#22D3EE',
    /** Red accent — errors, destructive */
    red: '#EF4444',
} as const;

export const Spacing = {
    /** 4px */
    xs: 4,
    /** 8px */
    sm: 8,
    /** 12px */
    md: 12,
    /** 16px */
    lg: 16,
    /** 20px */
    xl: 20,
    /** 24px */
    xxl: 24,
    /** 32px */
    xxxl: 32,
} as const;

export const Radius = {
    /** Chip, tag */
    sm: 8,
    /** Button, input */
    md: 12,
    /** Card */
    lg: 16,
    /** Large card, modal */
    xl: 20,
    /** Pill shape */
    full: 9999,
} as const;

export const Typography = {
    /** Large screen title */
    title: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
    /** Section header */
    headline: { fontSize: 20, fontWeight: '600' as const, letterSpacing: -0.3 },
    /** Card title */
    subhead: { fontSize: 16, fontWeight: '600' as const },
    /** Body text */
    body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
    /** Small labels */
    caption: { fontSize: 12, fontWeight: '500' as const },
    /** Extra small — timestamps, badges */
    footnote: { fontSize: 10, fontWeight: '500' as const },
} as const;

/**
 * Spring animation presets matching Apple's HIG animation curves.
 * Use with Animated.spring().
 */
export const Springs = {
    /** Snappy interactions — button press, chip select */
    snappy: { tension: 300, friction: 20, useNativeDriver: true },
    /** Default screen transitions */
    default: { tension: 170, friction: 26, useNativeDriver: true },
    /** Gentle entrance — cards fading in */
    gentle: { tension: 120, friction: 14, useNativeDriver: true },
} as const;

/**
 * Stagger delay between list items in milliseconds.
 */
export const STAGGER_MS = 50;
