/**
 * Whispers Screen — anonymous whisper feed with compose and reactions.
 * Adapted from web whispers page.
 */

import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity,
    RefreshControl, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { haptics } from '../lib/haptics';
import { Colors, Spacing, Radius, Typography } from '../lib/tokens';
import { FadeInView } from '../components/FadeInView';
import { AnimatedCard } from '../components/AnimatedCard';
import api from '../lib/api';
import { queryClient } from '../lib/queryClient';

// ── Types ────────────────────────────────────────────────────────────────────

interface Whisper {
    id: number;
    content: string;
    mood?: string | null;
    resonateCount: number;
    echoCount: number;
    absorbCount: number;
    createdAt: string;
}

type ReactionType = 'resonate' | 'echo' | 'absorb';

// ── Reaction config ──────────────────────────────────────────────────────────

const REACTIONS: { type: ReactionType; icon: string; color: string; label: string }[] = [
    { type: 'resonate', icon: 'radio', color: Colors.indigo, label: 'Resonate' },
    { type: 'echo', icon: 'repeat', color: Colors.purple, label: 'Echo' },
    { type: 'absorb', icon: 'droplet', color: Colors.cyan, label: 'Absorb' },
];

const MOOD_EMOJIS: Record<string, string> = {
    melancholy: '🌧', reflective: '🌙', hopeful: '🌅', anxious: '⚡',
    peaceful: '🍃', nostalgic: '📷', wonder: '✨', grateful: '🙏',
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function WhispersScreen() {
    const navigation = useNavigation();
    const [newWhisper, setNewWhisper] = useState('');
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [showCompose, setShowCompose] = useState(false);
    const [reactedIds, setReactedIds] = useState<Set<string>>(new Set());
    const [refreshing, setRefreshing] = useState(false);

    const MAX_CHARS = 200;

    // Fetch whispers
    const { data: whispers = [], isLoading } = useQuery<Whisper[]>({
        queryKey: ['whispers'],
        queryFn: () => api.get('/whispers').then(r => r.data ?? []),
    });

    // Create whisper
    const createMutation = useMutation({
        mutationFn: (data: { content: string; mood?: string | null }) =>
            api.post('/whispers', data).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['whispers'] });
            setNewWhisper('');
            setSelectedMood(null);
            setShowCompose(false);
            haptics.medium();
        },
    });

    // React to whisper
    const reactMutation = useMutation({
        mutationFn: (data: { id: number; type: ReactionType }) =>
            api.post(`/whispers/${data.id}/react`, { type: data.type }).then(r => r.data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['whispers'] }),
    });

    const handleSubmit = () => {
        const trimmed = newWhisper.trim();
        if (!trimmed || trimmed.length > MAX_CHARS) return;
        createMutation.mutate({ content: trimmed, mood: selectedMood });
    };

    const handleReact = (id: number, type: ReactionType) => {
        const key = `${id}-${type}`;
        if (reactedIds.has(key)) return;
        haptics.light();
        setReactedIds(prev => new Set(prev).add(key));
        reactMutation.mutate({ id, type });
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        queryClient.invalidateQueries({ queryKey: ['whispers'] }).then(() => setRefreshing(false));
    }, []);

    const getTimeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h`;
        return `${Math.floor(hrs / 24)}d`;
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={20} color={Colors.text} />
                </TouchableOpacity>
                <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={styles.headerTitle}>Whispers</Text>
                    <Text style={styles.headerSub}>Anonymous thoughts in the wind</Text>
                </View>
                <TouchableOpacity
                    onPress={() => { haptics.select(); setShowCompose(!showCompose); }}
                    style={styles.composeToggle}
                >
                    <Feather name={showCompose ? 'x' : 'edit-3'} size={18} color={Colors.purple} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    style={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.purple} />
                    }
                >
                    {/* Compose */}
                    {showCompose && (
                        <FadeInView delay={0}>
                            <View style={styles.composeCard}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Whisper something into the night..."
                                    placeholderTextColor={Colors.placeholder}
                                    multiline
                                    maxLength={MAX_CHARS}
                                    value={newWhisper}
                                    onChangeText={setNewWhisper}
                                />

                                {/* Mood Chips */}
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodRow}>
                                    {Object.entries(MOOD_EMOJIS).map(([mood, emoji]) => (
                                        <TouchableOpacity
                                            key={mood}
                                            style={[styles.moodChip, selectedMood === mood && styles.moodChipActive]}
                                            onPress={() => { haptics.light(); setSelectedMood(selectedMood === mood ? null : mood); }}
                                        >
                                            <Text style={styles.moodEmoji}>{emoji}</Text>
                                            <Text style={[styles.moodText, selectedMood === mood && { color: Colors.purple }]}>
                                                {mood}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                <View style={styles.composeFooter}>
                                    <Text style={styles.charCount}>{newWhisper.length}/{MAX_CHARS}</Text>
                                    <TouchableOpacity
                                        style={[styles.sendBtn, !newWhisper.trim() && { opacity: 0.4 }]}
                                        onPress={handleSubmit}
                                        disabled={!newWhisper.trim() || createMutation.isPending}
                                    >
                                        <Feather name="wind" size={14} color={Colors.text} />
                                        <Text style={styles.sendText}>
                                            {createMutation.isPending ? 'Sending...' : 'Whisper'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </FadeInView>
                    )}

                    {/* Feed */}
                    {isLoading ? (
                        <View style={styles.loadingWrap}>
                            {[0, 1, 2].map(i => (
                                <View key={i} style={[styles.skeleton, { opacity: 0.3 - i * 0.08 }]} />
                            ))}
                        </View>
                    ) : whispers.length === 0 ? (
                        <FadeInView delay={100}>
                            <View style={styles.emptyState}>
                                <Feather name="wind" size={48} color={Colors.textTertiary} />
                                <Text style={styles.emptyTitle}>Silence fills the night</Text>
                                <Text style={styles.emptySub}>Be the first to whisper something</Text>
                            </View>
                        </FadeInView>
                    ) : (
                        whispers.map((w, idx) => (
                            <AnimatedCard key={w.id} index={idx} style={styles.whisperCard}>
                                {/* Mood + Time */}
                                <View style={styles.whisperHeader}>
                                    {w.mood && (
                                        <View style={styles.moodBadge}>
                                            <Text style={styles.moodBadgeEmoji}>{MOOD_EMOJIS[w.mood] || '✨'}</Text>
                                            <Text style={styles.moodBadgeText}>{w.mood}</Text>
                                        </View>
                                    )}
                                    <Text style={styles.timeText}>{getTimeAgo(w.createdAt)}</Text>
                                </View>

                                {/* Content */}
                                <Text style={styles.whisperContent}>{w.content}</Text>

                                {/* Reactions */}
                                <View style={styles.reactionsRow}>
                                    {REACTIONS.map(r => {
                                        const count = (w as any)[`${r.type}Count`] || 0;
                                        const reacted = reactedIds.has(`${w.id}-${r.type}`);
                                        return (
                                            <TouchableOpacity
                                                key={r.type}
                                                style={[styles.reactionBtn, reacted && { backgroundColor: r.color + '15' }]}
                                                onPress={() => handleReact(w.id, r.type)}
                                            >
                                                <Feather name={r.icon as any} size={14} color={reacted ? r.color : Colors.textTertiary} />
                                                <Text style={[styles.reactionCount, reacted && { color: r.color }]}>
                                                    {count}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </AnimatedCard>
                        ))
                    )}

                    <View style={{ height: 120 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.bg },
    scroll: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    },
    backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { ...Typography.headline, color: Colors.text },
    headerSub: { ...Typography.footnote, color: Colors.textTertiary, marginTop: 2 },
    composeToggle: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: Colors.purple + '15', alignItems: 'center', justifyContent: 'center',
    },

    composeCard: {
        marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
        backgroundColor: Colors.surface, borderRadius: Radius.lg,
        borderWidth: 1, borderColor: Colors.purple + '30', padding: Spacing.lg,
    },
    input: {
        ...Typography.body, color: Colors.text,
        minHeight: 70, textAlignVertical: 'top',
        backgroundColor: Colors.surface2, borderRadius: Radius.md,
        padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
    },
    moodRow: { marginTop: Spacing.md },
    moodChip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
        borderRadius: Radius.full, backgroundColor: Colors.surface2,
        borderWidth: 1, borderColor: Colors.border, marginRight: Spacing.sm,
    },
    moodChipActive: { borderColor: Colors.purple + '60', backgroundColor: Colors.purple + '10' },
    moodEmoji: { fontSize: 14 },
    moodText: { ...Typography.caption, color: Colors.textTertiary },
    composeFooter: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginTop: Spacing.md,
    },
    charCount: { ...Typography.footnote, color: Colors.textTertiary },
    sendBtn: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        backgroundColor: Colors.purple + '20', paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm, borderRadius: Radius.full,
        borderWidth: 1, borderColor: Colors.purple + '40',
    },
    sendText: { ...Typography.caption, color: Colors.text },

    whisperCard: { marginHorizontal: Spacing.lg },
    whisperHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    moodBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full,
        backgroundColor: Colors.surface2,
    },
    moodBadgeEmoji: { fontSize: 12 },
    moodBadgeText: { ...Typography.footnote, color: Colors.textSecondary },
    timeText: { ...Typography.footnote, color: Colors.textTertiary },

    whisperContent: {
        ...Typography.body, color: Colors.text, marginTop: Spacing.md,
        lineHeight: 22, fontStyle: 'italic',
    },

    reactionsRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
    reactionBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
        borderRadius: Radius.full, backgroundColor: Colors.surface2,
    },
    reactionCount: { ...Typography.footnote, color: Colors.textTertiary },

    loadingWrap: { padding: Spacing.lg, gap: Spacing.md },
    skeleton: {
        height: 90, backgroundColor: Colors.surface, borderRadius: Radius.lg,
        marginHorizontal: Spacing.lg,
    },
    emptyState: { alignItems: 'center', paddingTop: 100, gap: Spacing.md },
    emptyTitle: { ...Typography.headline, color: Colors.textSecondary },
    emptySub: { ...Typography.body, color: Colors.textTertiary },
});
