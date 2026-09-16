/**
 * Notifications Screen — activity feed with mark-as-read and swipe-to-dismiss.
 * Uses the existing OLED-dark, glassmorphic design tokens.
 */

import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { haptics } from '../lib/haptics';
import { Colors, Spacing, Radius, Typography } from '../lib/tokens';
import { FadeInView } from '../components/FadeInView';
import { AnimatedCard } from '../components/AnimatedCard';

// ── Types ────────────────────────────────────────────────────────────────────

type NotifType = 'message' | 'like' | 'follow' | 'circle' | 'mention' | 'system';

interface Notification {
    id: string;
    type: NotifType;
    title: string;
    content: string;
    timestamp: string;
    read: boolean;
    actionUser?: string;
}

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1', type: 'follow', title: 'New Follower',
        content: 'nightowl_23 started following you',
        timestamp: '2 min ago', read: false, actionUser: 'nightowl_23',
    },
    {
        id: '2', type: 'like', title: 'Whisper Resonated',
        content: 'Someone resonated with your whisper about the midnight sky',
        timestamp: '15 min ago', read: false,
    },
    {
        id: '3', type: 'circle', title: 'Circle Invitation',
        content: 'You\'ve been invited to join "Late Night Thinkers"',
        timestamp: '1 hr ago', read: false,
    },
    {
        id: '4', type: 'message', title: 'Moon Message',
        content: 'A new message awaits you in Moon Messenger',
        timestamp: '3 hrs ago', read: true,
    },
    {
        id: '5', type: 'mention', title: 'Mentioned',
        content: 'stargazer mentioned you in a Midnight Café discussion',
        timestamp: '5 hrs ago', read: true,
    },
    {
        id: '6', type: 'system', title: 'Welcome to Nocturne',
        content: 'Your night sanctuary awaits. Explore features designed for the deep hours.',
        timestamp: '1 day ago', read: true,
    },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const ICON_MAP: Record<NotifType, { name: string; color: string }> = {
    message: { name: 'message-circle', color: Colors.blue },
    like: { name: 'heart', color: Colors.pink },
    follow: { name: 'user-plus', color: Colors.green },
    circle: { name: 'users', color: Colors.purple },
    mention: { name: 'at-sign', color: Colors.amber },
    system: { name: 'bell', color: Colors.indigo },
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [refreshing, setRefreshing] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;
    const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

    const markAsRead = useCallback((id: string) => {
        haptics.light();
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    const markAllAsRead = useCallback(() => {
        haptics.medium();
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const deleteNotif = useCallback((id: string) => {
        haptics.medium();
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1200);
    }, []);

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={20} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                {unreadCount > 0 ? (
                    <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
                        <Text style={styles.markAllText}>Read all</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 56 }} />
                )}
            </View>

            {/* Filter Chips */}
            <View style={styles.filterRow}>
                {(['all', 'unread'] as const).map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.chip, filter === f && styles.chipActive]}
                        onPress={() => { haptics.select(); setFilter(f); }}
                    >
                        <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
                            {f === 'all' ? 'All' : `Unread (${unreadCount})`}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.indigo} />
                }
            >
                {filtered.length === 0 ? (
                    <FadeInView delay={0}>
                        <View style={styles.emptyState}>
                            <Feather name="bell-off" size={48} color={Colors.textTertiary} />
                            <Text style={styles.emptyTitle}>All caught up</Text>
                            <Text style={styles.emptySubtitle}>No {filter === 'unread' ? 'unread ' : ''}notifications</Text>
                        </View>
                    </FadeInView>
                ) : (
                    filtered.map((notif, idx) => {
                        const icon = ICON_MAP[notif.type];
                        return (
                            <AnimatedCard key={notif.id} index={idx} style={styles.notifCard}>
                                <TouchableOpacity
                                    style={styles.notifRow}
                                    onPress={() => markAsRead(notif.id)}
                                    onLongPress={() => deleteNotif(notif.id)}
                                    activeOpacity={0.7}
                                >
                                    {/* Icon */}
                                    <View style={[styles.notifIcon, { backgroundColor: icon.color + '15' }]}>
                                        <Feather name={icon.name as any} size={18} color={icon.color} />
                                    </View>

                                    {/* Content */}
                                    <View style={styles.notifContent}>
                                        <View style={styles.notifTitleRow}>
                                            <Text style={[styles.notifTitle, !notif.read && styles.notifTitleUnread]}>
                                                {notif.title}
                                            </Text>
                                            {!notif.read && <View style={styles.unreadDot} />}
                                        </View>
                                        <Text style={styles.notifBody} numberOfLines={2}>{notif.content}</Text>
                                        <Text style={styles.notifTime}>{notif.timestamp}</Text>
                                    </View>
                                </TouchableOpacity>
                            </AnimatedCard>
                        );
                    })
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
    markAllBtn: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
    markAllText: { ...Typography.caption, color: Colors.indigo },

    filterRow: {
        flexDirection: 'row', paddingHorizontal: Spacing.lg,
        gap: Spacing.sm, marginBottom: Spacing.md,
    },
    chip: {
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
        borderRadius: Radius.full, backgroundColor: Colors.surface,
        borderWidth: 1, borderColor: Colors.border,
    },
    chipActive: { backgroundColor: Colors.indigo + '20', borderColor: Colors.indigo + '60' },
    chipText: { ...Typography.caption, color: Colors.textTertiary },
    chipTextActive: { color: Colors.indigo },

    notifCard: { marginHorizontal: Spacing.lg },
    notifRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
    notifIcon: {
        width: 40, height: 40, borderRadius: Radius.md,
        alignItems: 'center', justifyContent: 'center', marginTop: 2,
    },
    notifContent: { flex: 1 },
    notifTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    notifTitle: { ...Typography.subhead, color: Colors.textSecondary },
    notifTitleUnread: { color: Colors.text, fontWeight: '700' },
    unreadDot: {
        width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.indigo,
    },
    notifBody: { ...Typography.body, color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
    notifTime: { ...Typography.footnote, color: Colors.textTertiary, marginTop: 4 },

    emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 100, gap: Spacing.md },
    emptyTitle: { ...Typography.headline, color: Colors.textSecondary },
    emptySubtitle: { ...Typography.body, color: Colors.textTertiary },
});
