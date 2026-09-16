/**
 * FadeInView — reusable entrance animation wrapper.
 *
 * Fades in and slides up from a configurable offset.
 * Accepts a `delay` prop for staggered list animations.
 *
 * Usage:
 *   <FadeInView delay={index * STAGGER_MS}>
 *     <YourContent />
 *   </FadeInView>
 */

import React, { useEffect, useRef, type ReactNode } from 'react';
import { Animated, type ViewStyle } from 'react-native';
import { Springs } from '../lib/tokens';

interface FadeInViewProps {
    children: ReactNode;
    /** Delay in ms before animation starts (for staggering) */
    delay?: number;
    /** Vertical slide distance in px. Default 16. */
    slideDistance?: number;
    /** Custom style applied to the animated container */
    style?: ViewStyle;
}

export function FadeInView({
    children,
    delay = 0,
    slideDistance = 16,
    style,
}: FadeInViewProps) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(slideDistance)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.spring(opacity, {
                    toValue: 1,
                    ...Springs.gentle,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    ...Springs.gentle,
                }),
            ]).start();
        }, delay);

        return () => clearTimeout(timer);
    }, [delay, opacity, translateY]);

    return (
        <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
            {children}
        </Animated.View>
    );
}
