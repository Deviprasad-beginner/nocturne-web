/**
 * AnimatedCard — press-interactive card with entrance animation.
 *
 * Combines:
 *  1. FadeInView entrance (fade + slide up)
 *  2. Press-in scale effect (0.97) on touch — the standard iOS card behaviour
 *  3. Nocturne dark card styling from design tokens
 *
 * Drop-in replacement for NightCard in screens that need animation.
 */

import React, { useRef, type ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { Colors, Radius, Spacing, Springs, STAGGER_MS } from '../lib/tokens';
import { FadeInView } from './FadeInView';

interface AnimatedCardProps {
    children: ReactNode;
    /** Accent colour for the left border indicator */
    accent?: string;
    /** Index in a list — controls stagger delay */
    index?: number;
    /** Called when the card is tapped */
    onPress?: () => void;
    /** Extra styles merged onto the card */
    style?: ViewStyle;
}

export function AnimatedCard({
    children,
    accent,
    index = 0,
    onPress,
    style,
}: AnimatedCardProps) {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.97,
            ...Springs.snappy,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            ...Springs.snappy,
        }).start();
    };

    const card = (
        <Animated.View
            style={[
                styles.card,
                accent ? { borderLeftColor: accent, borderLeftWidth: 2 } : undefined,
                { transform: [{ scale }] },
                style,
            ]}
        >
            {children}
        </Animated.View>
    );

    const wrapped = onPress ? (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            {card}
        </Pressable>
    ) : (
        card
    );

    return (
        <FadeInView delay={index * STAGGER_MS}>
            {wrapped}
        </FadeInView>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.surface,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
    },
});
