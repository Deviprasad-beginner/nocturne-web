/**
 * Profile Screen — user identity, stats, diary entries, sign out.
 * Uses AnimatedCard for staggered stat cards and FadeInView for avatar.
 */

import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { haptics } from '../lib/haptics';
import { Colors, Spacing, Radius, Typography, Springs, STAGGER_MS } from '../lib/tokens';
import { FadeInView } from '../components/FadeInView';
import { AnimatedCard } from '../components/AnimatedCard';
import { GlowButton } from '../components/GlowButton';
import api from '../lib/api';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();

  /* Avatar scale-in animation */
  const avatarScale = useRef(new Animated.Value(0.6)).current;
  const avatarOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(avatarScale, { toValue: 1, ...Springs.gentle }),
      Animated.spring(avatarOpacity, { toValue: 1, ...Springs.gentle }),
    ]).start();
  }, [avatarScale, avatarOpacity]);

  const { data: diaries = [] } = useQuery<any[]>({
    queryKey: ['diaries'],
    queryFn: () => api.get('/diaries').then(r => r.data ?? []),
    enabled: !!user,
  });

  const handleLogout = () => {
    haptics.heavy();
    Alert.alert('Sign Out', 'Leave the night?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => { haptics.medium(); await logout(); },
      },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.guestMsg}>Sign in to see your profile.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const STATS = [
    { label: 'Diary Entries', value: diaries.length, icon: 'book' as const, color: Colors.indigo },
    { label: 'Nights Active', value: '∞', icon: 'moon' as const, color: Colors.purple },
    { label: 'Whispers', value: '—', icon: 'wind' as const, color: Colors.pink },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar + name */}
        <Animated.View
          style={[
            styles.hero,
            { opacity: avatarOpacity, transform: [{ scale: avatarScale }] },
          ]}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>
              {(user.displayName || user.username)[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{user.displayName || user.username}</Text>
          <Text style={styles.username}>@{user.username}</Text>
        </Animated.View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {STATS.map((s, i) => (
            <AnimatedCard
              key={s.label}
              accent={s.color + '40'}
              index={i}
              style={styles.statCard}
            >
              <Feather name={s.icon} size={18} color={s.color} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </AnimatedCard>
          ))}
        </View>

        {/* Recent diary entries */}
        <Text style={styles.sectionLabel}>Recent Diary Entries</Text>
        {diaries.slice(0, 5).map((d: any, i: number) => (
          <AnimatedCard key={d.id} index={i + 3} style={{ marginHorizontal: Spacing.lg }}>
            <Text style={styles.diaryText} numberOfLines={3}>{d.content}</Text>
            <Text style={styles.diaryDate}>
              {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ''}
            </Text>
          </AnimatedCard>
        ))}
        {diaries.length === 0 && (
          <Text style={styles.empty}>No diary entries yet. Start reflecting tonight.</Text>
        )}

        {/* Quick Links */}
        <Text style={styles.sectionLabel}>Quick Links</Text>
        <FadeInView delay={300}>
          <View style={styles.quickLinks}>
            {[
              { icon: 'settings', label: 'Settings', screen: 'Settings', color: Colors.textSecondary },
              { icon: 'bell', label: 'Notifications', screen: 'Notifications', color: Colors.indigo },
              { icon: 'help-circle', label: 'Help & Support', screen: 'Help', color: Colors.green },
            ].map((link, i) => (
              <TouchableOpacity
                key={link.screen}
                style={styles.quickLinkRow}
                onPress={() => { haptics.light(); navigation.navigate(link.screen); }}
              >
                <Feather name={link.icon as any} size={18} color={link.color} />
                <Text style={styles.quickLinkLabel}>{link.label}</Text>
                <Feather name="chevron-right" size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        </FadeInView>

        {/* Logout */}
        <FadeInView delay={400} style={styles.logoutWrap}>
          <GlowButton
            label="Sign Out"
            onPress={handleLogout}
            color={Colors.surface}
            textColor={Colors.pink}
            size="md"
            style={{ borderWidth: 1, borderColor: Colors.border }}
          />
        </FadeInView>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  guestMsg: { color: Colors.textTertiary, fontSize: 14 },

  hero: { alignItems: 'center', paddingVertical: Spacing.xxxl },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.indigo + '20',
    borderWidth: 1, borderColor: Colors.indigo,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarLetter: { color: Colors.indigo, fontSize: 28, fontWeight: '700' },
  name: { ...Typography.headline, color: Colors.text },
  username: { ...Typography.caption, color: Colors.textTertiary, marginTop: Spacing.xs },

  statsRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { flex: 1, alignItems: 'center', gap: 6 },
  statValue: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  statLabel: { ...Typography.footnote, color: Colors.textTertiary, textAlign: 'center' },

  sectionLabel: {
    ...Typography.footnote, color: Colors.textTertiary,
    letterSpacing: 2, textTransform: 'uppercase',
    marginHorizontal: Spacing.xl, marginBottom: Spacing.md,
  },
  diaryText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
  diaryDate: { color: Colors.textTertiary, fontSize: 10, marginTop: 6 },
  empty: { color: Colors.textTertiary, textAlign: 'center', marginVertical: 20, fontSize: 13, fontStyle: 'italic' },

  quickLinks: {
    marginHorizontal: Spacing.lg, backgroundColor: Colors.surface,
    borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden', marginBottom: Spacing.lg,
  },
  quickLinkRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  quickLinkLabel: { ...Typography.body, color: Colors.text, flex: 1 },

  logoutWrap: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xxl },
});
