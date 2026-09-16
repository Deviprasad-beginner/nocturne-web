/**
 * Night Thoughts Screen — ephemeral thought feed with compose, reactions, and sunrise expiry.
 * Adapted from the web night-thoughts page with native spring animations.
 */

import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity,
    RefreshControl, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { haptics } from '../lib/haptics';
import { Colors, Spacing, Radius, Typography } from '../lib/tokens';
import { FadeInView } from '../components/FadeInView';
import { AnimatedCard } from '../components/AnimatedCard';
import api from '../lib/api';
import { queryClient } from '../lib/queryClient';

// ── Types ────────────────────────────────────────────────────────────────────

interface NightThought {
    id: number;
    content: string;
    type?: string | null;
    expiresAt?: string | null;
    likes: number;
    userId?: number;
    username?: string;
    createdAt: string;
}

// ── Thought type styling ─────────────────────────────────────────────────────

const TYPE_STYLES: Record<string, { icon: string; color: string; label: string }> = {
    confession: { icon: 'eye-off', color: Colors.pink, label: 'Confession' },
    dream: { icon: 'cloud', color: Colors.purple, label: 'Dream' },
    wonder: { icon: 'star', color: Colors.amber, label: 'Wonder' },
    rant: { icon: 'zap', color: Colors.orange, label: 'Rant' },
    gratitude: { icon: 'heart', color: Colors.green, label: 'Gratitude' },
    default: { icon: 'feather', color: Colors.indigo, label: 'Thought' },
};

const THOUGHT_TYPES = ['confession', 'dream', 'wonder', 'rant', 'gratitude'];

// ── Component ──────────────────────────────────────────────────────────────────

export default function NightThoughtsScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [newThought, setNewThought] = useState('');
    const [selectedType, setSelectedType] = useState('default');
    const [refreshing, setRefreshing] = useState(false);
    const [showCompose, setShowCompose] = useState(false);

    const MAX_CHARS = 280;

    // Fetch thoughts
    const { data: thoughts = [], isLoading } = useQuery<NightThought[]>({
        queryKey: ['night-thoughts'],
        queryFn: () => api.get('/night-thoughts').then(r => r.data ?? []),
    });

    // Create thought
    const createMutation = useMutation({
        mutationFn: (data: { content: string; type: string }) =>
            api.post('/night-thoughts', data).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['night-thoughts'] });
            setNewThought('');
            setSelectedType('default');
            setShowCompose(false);
            haptics.medium();
        },
    });

    // Like thought
    const likeMutation = useMutation({
        mutationFn: (id: number) => api.post(`/night-thoughts/${id}/like`).then(r => r.data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['night-thoughts'] }),
    });

    const handleSubmit = () => {
        const trimmed = newThought.trim();
        if (!trimmed || trimmed.length > MAX_CHARS) return;
        createMutation.mutate({ content: trimmed, type: selectedType });
    };

    const handleLike = (id: number) => {
        haptics.light();
        likeMutation.mutate(id);
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        queryClient.invalidateQueries({ queryKey: ['night-thoughts'] }).then(() => setRefreshing(false));
    }, []);

    const getTypeStyle = (type?: string | null) => TYPE_STYLES[type || 'default'] || TYPE_STYLES.default;

    const getTimeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={20} color={Colors.text} />
                </TouchableOpacity>
                <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={styles.headerTitle}>Night Thoughts</Text>
                    <Text style={styles.headerSub}>Gone by sunrise</Text>
                </View>
                <TouchableOpacity
                    onPress={() => { haptics.select(); setShowCompose(!showCompose); }}
                    style={styles.composeBtn}
                >
                    <Feather name={showCompose ? 'x' : 'plus'} size={20} color={Colors.indigo} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.indigo} />
                    }
                >
                    {/* Compose Area */}
                    {showCompose && (
                        <FadeInView delay={0}>
                            <View style={styles.composeCard}>
                                {/* Type Chips */}
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
                                    {THOUGHT_TYPES.map(t => {
                                        const ts = TYPE_STYLES[t];
                                        const isActive = selectedType === t;
                                        return (
                                            <TouchableOpacity
                                                key={t}
                                                style={[styles.typeChip, isActive && { backgroundColor: ts.color + '20', borderColor: ts.color + '60' }]}
                                                onPress={() => { haptics.light(); setSelectedType(t); }}
                                            >
                                                <Feather name={ts.icon as any} size={12} color={isActive ? ts.color : Colors.textTertiary} />
                                                <Text style={[styles.typeChipText, isActive && { color: ts.color }]}>{ts.label}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>

                                {/* Text Input */}
                                <TextInput
                                    style={styles.input}
                                    placeholder="What's on your mind tonight?"
                                    placeholderTextColor={Colors.placeholder}
                                    multiline
                                    maxLength={MAX_CHARS}
                                    value={newThought}
                                    onChangeText={setNewThought}
                                />

                                <View style={styles.composeFooter}>
                                    <Text style={[
                                        styles.charCount,
                                        newThought.length > MAX_CHARS * 0.9 && { color: Colors.pink },
                                    ]}>
                                        {newThought.length}/{MAX_CHARS}
                                    </Text>
                                    <TouchableOpacity
                                        style={[styles.sendBtn, !newThought.trim() && { opacity: 0.4 }]}
                                        onPress={handleSubmit}
                                        disabled={!newThought.trim() || createMutation.isPending}
                                    >
                                        <Text style={styles.sendBtnText}>
                                            {createMutation.isPending ? 'Sending...' : 'Release into the night'}
                                        </Text>
                                        <Feather name="send" size={14} color={Colors.text} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </FadeInView>
                    )}

                    {/* Thoughts Feed */}
                    {isLoading ? (
                        <View style={styles.loadingWrap}>
                            {[0, 1, 2].map(i => (
                                <View key={i} style={[styles.skeleton, { opacity: 0.3 - i * 0.08 }]} />
                            ))}
                        </View>
                    ) : thoughts.length === 0 ? (
                        <FadeInView delay={100}>
                            <View style={styles.emptyState}>
                                <Feather name="moon" size={48} color={Colors.textTertiary} />
                                <Text style={styles.emptyTitle}>The night is quiet</Text>
                                <Text style={styles.emptySubtitle}>Be the first to share a thought tonight</Text>
                            </View>
                        </FadeInView>
                    ) : (
                        thoughts.map((thought, idx) => {
                            const ts = getTypeStyle(thought.type);
                            return (
                                <AnimatedCard key={thought.id} index={idx} style={styles.thoughtCard}>
                                    {/* Type Badge */}
                                    <View style={styles.thoughtHeader}>
                                        <View style={[styles.typeBadge, { backgroundColor: ts.color + '15' }]}>
                                            <Feather name={ts.icon as any} size={12} color={ts.color} />
                                            <Text style={[styles.typeBadgeText, { color: ts.color }]}>{ts.label}</Text>
                                        </View>
                                        <Text style={styles.timeAgo}>{getTimeAgo(thought.createdAt)}</Text>
                                    </View>

                                    {/* Content */}
                                    <Text style={styles.thoughtContent}>{thought.content}</Text>

                                    {/* Footer */}
                                    <View style={styles.thoughtFooter}>
                                        <TouchableOpacity
                                            style={styles.likeBtn}
                                            onPress={() => handleLike(thought.id)}
                                        >
                                            <Feather name="heart" size={14} color={Colors.pink} />
                                            <Text style={styles.likeCount}>{thought.likes || 0}</Text>
                                        </TouchableOpacity>
                                        {thought.username && (
                                            <Text style={styles.authorText}>— {thought.username}</Text>
                                        )}
                                    </View>

                                    {/* Expiry indicator */}
                                    {thought.expiresAt && (
                                        <View style={styles.expiryRow}>
                                            <Feather name="sunrise" size={10} color={Colors.amber} />
                                            <Text style={styles.expiryText}>Fades at sunrise</Text>
                                        </View>
                                    )}
                                </AnimatedCard>
                            );
                        })
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
    composeBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: Colors.indigo + '15', alignItems: 'center', justifyContent: 'center',
    },

    composeCard: {
        marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
        backgroundColor: Colors.surface, borderRadius: Radius.lg,
        borderWidth: 1, borderColor: Colors.indigo + '30', padding: Spacing.lg,
    },
    typeRow: { marginBottom: Spacing.md },
    typeChip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
        borderRadius: Radius.full, backgroundColor: Colors.surface2,
        borderWidth: 1, borderColor: Colors.border, marginRight: Spacing.sm,
    },
    typeChipText: { ...Typography.caption, color: Colors.textTertiary },
    input: {
        ...Typography.body, color: Colors.text,
        minHeight: 80, textAlignVertical: 'top',
        backgroundColor: Colors.surface2, borderRadius: Radius.md,
        padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
    },
    composeFooter: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginTop: Spacing.md,
    },
    charCount: { ...Typography.footnote, color: Colors.textTertiary },
    sendBtn: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        backgroundColor: Colors.indigo + '20', paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm, borderRadius: Radius.full,
        borderWidth: 1, borderColor: Colors.indigo + '40',
    },
    sendBtnText: { ...Typography.caption, color: Colors.text },

    thoughtCard: { marginHorizontal: Spacing.lg },
    thoughtHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    typeBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full,
    },
    typeBadgeText: { ...Typography.footnote, fontWeight: '600' },
    timeAgo: { ...Typography.footnote, color: Colors.textTertiary },

    thoughtContent: { ...Typography.body, color: Colors.text, marginTop: Spacing.md, lineHeight: 22 },

    thoughtFooter: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginTop: Spacing.md,
    },
    likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    likeCount: { ...Typography.caption, color: Colors.pink },
    authorText: { ...Typography.footnote, color: Colors.textTertiary, fontStyle: 'italic' },

    expiryRow: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        marginTop: Spacing.sm, paddingTop: Spacing.sm,
        borderTopWidth: 1, borderTopColor: Colors.border,
    },
    expiryText: { ...Typography.footnote, color: Colors.amber },

    loadingWrap: { padding: Spacing.lg, gap: Spacing.md },
    skeleton: {
        height: 100, backgroundColor: Colors.surface, borderRadius: Radius.lg,
        marginHorizontal: Spacing.lg,
    },

    emptyState: { alignItems: 'center', paddingTop: 100, gap: Spacing.md },
    emptyTitle: { ...Typography.headline, color: Colors.textSecondary },
    emptySubtitle: { ...Typography.body, color: Colors.textTertiary },
});
