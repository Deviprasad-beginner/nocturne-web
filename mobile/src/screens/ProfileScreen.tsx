/**
 * Profile Screen — user stats, diary count, logout
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { haptics } from '../lib/haptics';
import { NightCard } from '../components/NightCard';
import { GlowButton } from '../components/GlowButton';
import api from '../lib/api';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

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
    { label: 'Diary Entries', value: diaries.length, icon: 'book', color: '#818cf8' },
    { label: 'Nights Active', value: '∞', icon: 'moon', color: '#a78bfa' },
    { label: 'Whispers', value: '—', icon: 'wind', color: '#fb7185' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar + name */}
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>
              {(user.displayName || user.username)[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{user.displayName || user.username}</Text>
          <Text style={styles.username}>@{user.username}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {STATS.map((s) => (
            <NightCard key={s.label} accent={s.color + '40'} style={styles.statCard}>
              <Feather name={s.icon as any} size={18} color={s.color} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </NightCard>
          ))}
        </View>

        {/* Recent diary entries */}
        <Text style={styles.sectionLabel}>Recent Diary Entries</Text>
        {diaries.slice(0, 5).map((d: any) => (
          <NightCard key={d.id} style={{ marginHorizontal: 16 }}>
            <Text style={styles.diaryText} numberOfLines={3}>{d.content}</Text>
            <Text style={styles.diaryDate}>
              {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ''}
            </Text>
          </NightCard>
        ))}
        {diaries.length === 0 && (
          <Text style={styles.empty}>No diary entries yet. Start reflecting tonight.</Text>
        )}

        {/* Logout */}
        <View style={styles.logoutWrap}>
          <GlowButton
            label="Sign Out"
            onPress={handleLogout}
            color="#1f2937"
            textColor="#fb7185"
            size="md"
            style={{ borderWidth: 1, borderColor: '#374151' }}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#050508' },
  scroll: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  guestMsg: { color: '#4b5563', fontSize: 14 },
  hero: { alignItems: 'center', paddingVertical: 32 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(129,140,248,0.15)',
    borderWidth: 1, borderColor: '#818cf8',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLetter: { color: '#818cf8', fontSize: 28, fontWeight: '700' },
  name: { color: '#e2e8f0', fontSize: 20, fontWeight: '700' },
  username: { color: '#4b5563', fontSize: 13, marginTop: 4 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 16 },
  statCard: { flex: 1, alignItems: 'center', gap: 6 },
  statValue: { color: '#e2e8f0', fontSize: 18, fontWeight: '700' },
  statLabel: { color: '#4b5563', fontSize: 10, textAlign: 'center' },
  sectionLabel: {
    fontSize: 10, color: '#4b5563', letterSpacing: 2,
    textTransform: 'uppercase', marginHorizontal: 20, marginBottom: 10,
  },
  diaryText: { color: '#9ca3af', fontSize: 13, lineHeight: 20 },
  diaryDate: { color: '#374151', fontSize: 10, marginTop: 6 },
  empty: { color: '#374151', textAlign: 'center', marginVertical: 20, fontSize: 13, fontStyle: 'italic' },
  logoutWrap: { paddingHorizontal: 16, marginTop: 24 },
});
