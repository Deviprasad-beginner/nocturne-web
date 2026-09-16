/**
 * Night Circles Screen — circle discovery, join flow, and member list.
 * Adapted from web night-circles page.
 */

import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity,
    RefreshControl, Alert,
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

type CircleState = 'waiting' | 'active' | 'closed';
type JoinMode = 'silent' | 'listener' | 'speaker';

interface NightCircle {
    id: number;
    name: string;
    state: CircleState;
    currentMembers: number;
    maxMembers: number;
    topic?: string;
    category?: string;
    primaryEmotion?: string;
    vibeScore?: number;
    createdAt: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const MOODS = ['calm', 'curious', 'lonely', 'deep', 'emotional', 'chaotic'];

const MOOD_STYLES: Record<string, { color: string; icon: string }> = {
    calm: { color: Colors.green, icon: 'sun' },
    curious: { color: Colors.amber, icon: 'compass' },
    lonely: { color: Colors.blue, icon: 'cloud' },
    deep: { color: Colors.purple, icon: 'layers' },
    emotional: { color: Colors.pink, icon: 'heart' },
    chaotic: { color: Colors.red, icon: 'zap' },
};

const STATE_COLORS: Record<CircleState, string> = {
    waiting: Colors.amber,
    active: Colors.green,
    closed: Colors.textTertiary,
};

const MODE_LABELS: Record<JoinMode, { label: string; sub: string; icon: string }> = {
    silent: { label: 'Silent Witness', sub: 'observe only', icon: 'eye' },
    listener: { label: 'Listener', sub: 'can respond', icon: 'headphones' },
    speaker: { label: 'Speaker', sub: 'full voice', icon: 'mic' },
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function NightCirclesScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [view, setView] = useState<'lobby' | 'join'>('lobby');
    const [selectedMood, setSelectedMood] = useState('calm');
    const [selectedMode, setSelectedMode] = useState<JoinMode>('listener');
    const [refreshing, setRefreshing] = useState(false);

    // Fetch circles
    const { data: circles = [], isLoading } = useQuery<NightCircle[]>({
        queryKey: ['night-circles'],
        queryFn: () => api.get('/night-circles').then(r => r.data ?? []),
    });

    // Quick join
    const quickJoinMutation = useMutation({
        mutationFn: (data: { mood: string; mode: JoinMode; size: 'group' | 'duo' }) =>
            api.post('/night-circles/quick-join', data).then(r => r.data),
        onSuccess: () => {
            haptics.medium();
            queryClient.invalidateQueries({ queryKey: ['night-circles'] });
            setView('lobby');
            Alert.alert('Joined!', 'You\'ve been matched to a circle');
        },
    });

    // Join existing
    const joinMutation = useMutation({
        mutationFn: (data: { circleId: number; mode: JoinMode }) =>
            api.post(`/night-circles/${data.circleId}/join`, { mode: data.mode }).then(r => r.data),
        onSuccess: () => {
            haptics.medium();
            queryClient.invalidateQueries({ queryKey: ['night-circles'] });
        },
    });

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        queryClient.invalidateQueries({ queryKey: ['night-circles'] }).then(() => setRefreshing(false));
    }, []);

    const activeCircles = circles.filter(c => c.state !== 'closed');

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={20} color={Colors.text} />
                </TouchableOpacity>
                <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={styles.headerTitle}>Night Circles</Text>
                    <Text style={styles.headerSub}>
                        {activeCircles.length} circle{activeCircles.length !== 1 ? 's' : ''} active
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => { haptics.select(); setView(view === 'lobby' ? 'join' : 'lobby'); }}
                    style={[styles.modeToggle, view === 'join' && { backgroundColor: Colors.indigo + '20' }]}
                >
                    <Feather
                        name={view === 'join' ? 'x' : 'plus-circle'}
                        size={20}
                        color={view === 'join' ? Colors.indigo : Colors.text}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.indigo} />
                }
            >
                {/* Join Flow */}
                {view === 'join' && (
                    <FadeInView delay={0}>
                        <View style={styles.joinCard}>
                            <Text style={styles.joinTitle}>Find Your Circle</Text>
                            <Text style={styles.joinSub}>Choose your mood and how you want to participate</Text>

                            {/* Mood Selection */}
                            <Text style={styles.joinLabel}>MOOD</Text>
                            <View style={styles.moodGrid}>
                                {MOODS.map(mood => {
                                    const ms = MOOD_STYLES[mood] || MOOD_STYLES.calm;
                                    const active = selectedMood === mood;
                                    return (
                                        <TouchableOpacity
                                            key={mood}
                                            style={[styles.moodChip, active && { backgroundColor: ms.color + '20', borderColor: ms.color + '60' }]}
                                            onPress={() => { haptics.light(); setSelectedMood(mood); }}
                                        >
                                            <Feather name={ms.icon as any} size={14} color={active ? ms.color : Colors.textTertiary} />
                                            <Text style={[styles.moodChipText, active && { color: ms.color }]}>
                                                {mood.charAt(0).toUpperCase() + mood.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Mode Selection */}
                            <Text style={styles.joinLabel}>PARTICIPATION</Text>
                            <View style={styles.modeList}>
                                {(Object.keys(MODE_LABELS) as JoinMode[]).map(mode => {
                                    const ml = MODE_LABELS[mode];
                                    const active = selectedMode === mode;
                                    return (
                                        <TouchableOpacity
                                            key={mode}
                                            style={[styles.modeCard, active && { borderColor: Colors.indigo + '60', backgroundColor: Colors.indigo + '10' }]}
                                            onPress={() => { haptics.light(); setSelectedMode(mode); }}
                                        >
                                            <Feather name={ml.icon as any} size={18} color={active ? Colors.indigo : Colors.textTertiary} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.modeTitle, active && { color: Colors.text }]}>{ml.label}</Text>
                                                <Text style={styles.modeSub}>{ml.sub}</Text>
                                            </View>
                                            {active && <Feather name="check-circle" size={16} color={Colors.indigo} />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Join Buttons */}
                            <View style={styles.joinActions}>
                                <TouchableOpacity
                                    style={styles.joinBtn}
                                    onPress={() => quickJoinMutation.mutate({ mood: selectedMood, mode: selectedMode, size: 'group' })}
                                    disabled={quickJoinMutation.isPending}
                                >
                                    <Feather name="users" size={16} color={Colors.text} />
                                    <Text style={styles.joinBtnText}>Join Group</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.joinBtn, styles.joinBtnDuo]}
                                    onPress={() => quickJoinMutation.mutate({ mood: selectedMood, mode: selectedMode, size: 'duo' })}
                                    disabled={quickJoinMutation.isPending}
                                >
                                    <Feather name="user" size={16} color={Colors.indigo} />
                                    <Text style={[styles.joinBtnText, { color: Colors.indigo }]}>Find Duo</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </FadeInView>
                )}

                {/* Lobby — list of active circles */}
                {view === 'lobby' && (
                    <>
                        {isLoading ? (
                            <View style={styles.loadingWrap}>
                                {[0, 1, 2].map(i => (
                                    <View key={i} style={[styles.skeleton, { opacity: 0.3 - i * 0.08 }]} />
                                ))}
                            </View>
                        ) : activeCircles.length === 0 ? (
                            <FadeInView delay={100}>
                                <View style={styles.emptyState}>
                                    <Feather name="users" size={48} color={Colors.textTertiary} />
                                    <Text style={styles.emptyTitle}>No active circles</Text>
                                    <Text style={styles.emptySubtitle}>Start one by tapping the + button</Text>
                                </View>
                            </FadeInView>
                        ) : (
                            activeCircles.map((circle, idx) => {
                                const moodStyle = MOOD_STYLES[circle.primaryEmotion || 'calm'] || MOOD_STYLES.calm;
                                return (
                                    <AnimatedCard key={circle.id} index={idx} style={styles.circleCard}>
                                        {/* Circle Header */}
                                        <View style={styles.circleHeader}>
                                            <View style={[styles.circleIcon, { backgroundColor: moodStyle.color + '15' }]}>
                                                <Feather name={moodStyle.icon as any} size={20} color={moodStyle.color} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.circleName}>{circle.name}</Text>
                                                {circle.topic && (
                                                    <Text style={styles.circleTopic} numberOfLines={1}>{circle.topic}</Text>
                                                )}
                                            </View>
                                            <View style={[styles.stateBadge, { backgroundColor: STATE_COLORS[circle.state] + '20' }]}>
                                                <View style={[styles.stateDot, { backgroundColor: STATE_COLORS[circle.state] }]} />
                                                <Text style={[styles.stateText, { color: STATE_COLORS[circle.state] }]}>
                                                    {circle.state}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Members + Join */}
                                        <View style={styles.circleFooter}>
                                            <View style={styles.memberInfo}>
                                                <Feather name="users" size={12} color={Colors.textTertiary} />
                                                <Text style={styles.memberCount}>
                                                    {circle.currentMembers}/{circle.maxMembers}
                                                </Text>
                                            </View>
                                            {circle.vibeScore != null && (
                                                <View style={styles.vibeWrap}>
                                                    <Feather name="activity" size={12} color={Colors.purple} />
                                                    <Text style={styles.vibeText}>{circle.vibeScore}</Text>
                                                </View>
                                            )}
                                            <TouchableOpacity
                                                style={styles.joinCircleBtn}
                                                onPress={() => {
                                                    haptics.select();
                                                    joinMutation.mutate({ circleId: circle.id, mode: 'listener' });
                                                }}
                                            >
                                                <Text style={styles.joinCircleBtnText}>Join</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </AnimatedCard>
                                );
                            })
                        )}
                    </>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>
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
    modeToggle: {
        width: 36, height: 36, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
    },

    // Join flow
    joinCard: {
        marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
        backgroundColor: Colors.surface, borderRadius: Radius.lg,
        borderWidth: 1, borderColor: Colors.indigo + '30', padding: Spacing.lg,
    },
    joinTitle: { ...Typography.headline, color: Colors.text },
    joinSub: { ...Typography.body, color: Colors.textSecondary, marginTop: 4, marginBottom: Spacing.lg },
    joinLabel: {
        ...Typography.footnote, color: Colors.textTertiary,
        letterSpacing: 2, textTransform: 'uppercase', marginBottom: Spacing.sm, marginTop: Spacing.md,
    },
    moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    moodChip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
        borderRadius: Radius.full, backgroundColor: Colors.surface2,
        borderWidth: 1, borderColor: Colors.border,
    },
    moodChipText: { ...Typography.caption, color: Colors.textTertiary },
    modeList: { gap: Spacing.sm },
    modeCard: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
        padding: Spacing.md, borderRadius: Radius.md,
        backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.border,
    },
    modeTitle: { ...Typography.subhead, color: Colors.textSecondary },
    modeSub: { ...Typography.footnote, color: Colors.textTertiary, marginTop: 2 },
    joinActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },
    joinBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
        paddingVertical: Spacing.md, borderRadius: Radius.md,
        backgroundColor: Colors.indigo + '20', borderWidth: 1, borderColor: Colors.indigo + '40',
    },
    joinBtnDuo: { backgroundColor: Colors.surface2, borderColor: Colors.indigo + '30' },
    joinBtnText: { ...Typography.subhead, color: Colors.text },

    // Circle cards
    circleCard: { marginHorizontal: Spacing.lg },
    circleHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    circleIcon: {
        width: 44, height: 44, borderRadius: Radius.md,
        alignItems: 'center', justifyContent: 'center',
    },
    circleName: { ...Typography.subhead, color: Colors.text },
    circleTopic: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
    stateBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full,
    },
    stateDot: { width: 6, height: 6, borderRadius: 3 },
    stateText: { ...Typography.footnote, fontWeight: '600' },

    circleFooter: {
        flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md,
        paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border,
    },
    memberInfo: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
    memberCount: { ...Typography.caption, color: Colors.textTertiary },
    vibeWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: Spacing.md },
    vibeText: { ...Typography.caption, color: Colors.purple },
    joinCircleBtn: {
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs,
        borderRadius: Radius.full, backgroundColor: Colors.indigo + '20',
        borderWidth: 1, borderColor: Colors.indigo + '40',
    },
    joinCircleBtnText: { ...Typography.caption, color: Colors.indigo, fontWeight: '600' },

    loadingWrap: { padding: Spacing.lg, gap: Spacing.md },
    skeleton: {
        height: 100, backgroundColor: Colors.surface, borderRadius: Radius.lg,
        marginHorizontal: Spacing.lg,
    },
    emptyState: { alignItems: 'center', paddingTop: 100, gap: Spacing.md },
    emptyTitle: { ...Typography.headline, color: Colors.textSecondary },
    emptySubtitle: { ...Typography.body, color: Colors.textTertiary },
});
