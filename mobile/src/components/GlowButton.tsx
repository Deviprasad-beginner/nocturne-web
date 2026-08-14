/**
 * GlowButton — premium tactile button with haptic + glow press effect
 */

import React from 'react';
import {
    TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle,
    ActivityIndicator,
} from 'react-native';
import { haptics } from '../lib/haptics';

interface GlowButtonProps {
    label: string;
    onPress: () => void;
    color?: string;
    textColor?: string;
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
}

export function GlowButton({
    label, onPress, color = '#4f46e5', textColor = '#fff',
    size = 'md', loading, disabled, style,
}: GlowButtonProps) {
    const handlePress = () => {
        haptics.medium();
        onPress();
    };

    const pad = size === 'sm' ? 10 : size === 'lg' ? 18 : 14;
    const fontSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;

    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.82}
            style={[
                styles.base,
                { backgroundColor: color, paddingVertical: pad, shadowColor: color },
                (disabled || loading) && styles.disabled,
                style,
            ]}
        >
            {loading
                ? <ActivityIndicator color={textColor} size="small" />
                : <Text style={[styles.label, { color: textColor, fontSize }]}>{label}</Text>
            }
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: 14,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOpacity: 0.28,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    label: {
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    disabled: {
        opacity: 0.5,
    },
});
