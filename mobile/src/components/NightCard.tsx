/**
 * NightCard — dark glassmorphism card, base for all content cards
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface NightCardProps {
    children: ReactNode;
    accent?: string;   // e.g. '#818cf8' — tints the top border
    style?: ViewStyle;
}

export function NightCard({ children, accent = 'rgba(255,255,255,0.06)', style }: NightCardProps) {
    return (
        <View style={[styles.card, { borderColor: accent }, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#0d0d14',
        borderRadius: 18,
        borderWidth: 1,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
});
