/**
 * Home (Sanctuary) Screen
 *
 * Live feed: greeting, services carousel, tonight's reflection, whispers.
 * Uses AnimatedCard for staggered entrance and press-scale interactions.
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  RefreshControl, StyleSheet,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../lib/api';
import { haptics } from '../lib/haptics';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, Radius, Typography, STAGGER_MS } from '../lib/tokens';
import { FadeInView } from '../components/FadeInView';
import { AnimatedCard } from '../components/AnimatedCard';
import { GlowButton } from '../components/GlowButton';

const SERVICES = [
  { title: 'Soothing Night', emoji: '🎵', color: Colors.indigo, route: 'Music' },
  { title: 'Night Circles', emoji: '🌙', color: Colors.purple, route: 'NightCircles' },
  { title: 'Night Thoughts', emoji: '💭', color: Colors.pink, route: 'NightThoughts' },
  { title: 'Whispers', emoji: '🌬️', color: '#A78BFA', route: 'Whispers' },
  { title: 'Mind Maze', emoji: '🧩', color: Colors.amber, route: 'MindMaze' },
  { title: 'Midnight Café', emoji: '☕', color: Colors.orange, route: 'MidnightCafe' },
  { title: "Tonight's Reads", emoji: '📖', color: '#C084FC', route: 'Reads' },
  { title: '3AM Founder', emoji: '🚀', color: Colors.blue, route: 'Founder' },
  { title: 'Starlit Speaker', emoji: '🎙️', color: Colors.purple, route: 'Speaker' },
  { title: 'Moon Messenger', emoji: '💬', color: Colors.amber, route: 'Messenger' },
];

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [whisperText, setWhisperText] = useState('');
  const [reflectionText, setReflectionText] = useState('');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const { data: prompt } = useQuery<any>({
    queryKey: ['prompt'],
    queryFn: () => api.get('/reflections/prompt?type=diary').then(r => r.data),
  });

  const { data: whispers = [], isLoading: loadingWhispers, refetch: refetchWhispers } = useQuery<any[]>({
    queryKey: ['whispers'],
    queryFn: () => api.get('/whispers').then(r => r.data ?? []),
  });

  const whisperMutation = useMutation({
    mutationFn: (content: string) => api.post('/whispers', { content }),
    onSuccess: () => {
      haptics.success();
      qc.invalidateQueries({ queryKey: ['whispers'] });
      setWhisperText('');
    },
    onError: () => haptics.error(),
  });

  const likeMutation = useMutation({
    mutationFn: (id: number) => api.post(`/whispers/${id}/like`),
    onSuccess: () => {
      haptics.light();
      qc.invalidateQueries({ queryKey: ['whispers'] });
    },
  });

  const reflectMutation = useMutation({
    mutationFn: (content: string) =>
      api.post('/diaries', { content, isPublic: true, mood: 'reflective' }),
    onSuccess: () => { haptics.success(); setReflectionText(''); },
    onError: () => haptics.error(),
  });

  const hour = time.getHours();
  const greeting =
    hour < 5 ? 'Still awake?' :
      hour < 12 ? 'Good morning' :
        hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loadingWhispers}
            onRefresh={() => { haptics.light(); refetchWhispers(); }}
            tintColor={Colors.indigo}
          />
        }
      >
        {/* ── Header ─────────────────────────────── */}
        <FadeInView style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.clock}>
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.headline}>
                Tonight is <Text style={styles.accent}>unwritten</Text>.
              </Text>
              {user && (
                <Text style={styles.greeting}>
                  {greeting}, {user.displayName || user.username} ✦
                </Text>
              )}
            </View>
            {/* Scanner shortcut */}
            <TouchableOpacity
              style={styles.scanBtn}
              onPress={() => { haptics.medium(); navigation.navigate('Scanner'); }}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="aperture" size={20} color={Colors.indigo} />
            </TouchableOpacity>
          </View>
        </FadeInView>

        {/* ── Services Carousel ──────────────────── */}
        <FadeInView delay={100} style={styles.section}>
          <Text style={styles.sectionLabel}>✦ Explore Nocturne</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
            decelerationRate="fast"
          >
            {SERVICES.map((s, i) => (
              <TouchableOpacity
                key={s.route + s.title}
                style={[styles.serviceCard, { borderColor: s.color + '30' }]}
                onPress={() => { haptics.light(); navigation.navigate(s.route); }}
                activeOpacity={0.7}
              >
                <Text style={styles.serviceEmoji}>{s.emoji}</Text>
                <Text style={[styles.serviceTitle, { color: s.color }]}>{s.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </FadeInView>

        {/* ── Tonight's Reflection ───────────────── */}
        <View style={styles.section}>
          <AnimatedCard accent={Colors.indigo} index={0}>
            <View style={styles.sectionRow}>
              <Feather name="zap" size={14} color={Colors.indigo} />
              <Text style={styles.cardTitle}>Tonight's Reflection</Text>
            </View>
            {prompt?.content && (
              <Text style={styles.promptText}>"{prompt.content}"</Text>
            )}
            <TextInput
              style={styles.textarea}
              placeholder="Reflect on this cue. The night remembers…"
              placeholderTextColor={Colors.placeholder}
              value={reflectionText}
              onChangeText={setReflectionText}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <GlowButton
              label={reflectMutation.isPending ? 'Archiving…' : 'Archive Entry'}
              onPress={() => {
                if (!reflectionText.trim()) { haptics.warning(); return; }
                reflectMutation.mutate(reflectionText.trim());
              }}
              loading={reflectMutation.isPending}
              disabled={!reflectionText.trim()}
              size="sm"
              style={{ marginTop: Spacing.md }}
            />
          </AnimatedCard>
        </View>

        {/* ── Late-Night Whispers ────────────────── */}
        <View style={styles.section}>
          <AnimatedCard accent={Colors.pink + '40'} index={1}>
            <View style={styles.sectionRow}>
              <Feather name="wind" size={14} color={Colors.pink} />
              <Text style={styles.cardTitle}>Late-Night Whispers</Text>
            </View>

            <View style={styles.whisperRow}>
              <TextInput
                style={styles.whisperInput}
                placeholder="Whisper anonymously into the void…"
                placeholderTextColor={Colors.placeholder}
                value={whisperText}
                onChangeText={setWhisperText}
                returnKeyType="send"
                onSubmitEditing={() => {
                  if (whisperText.trim()) whisperMutation.mutate(whisperText.trim());
                }}
              />
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={() => {
                  if (!whisperText.trim()) return;
                  haptics.medium();
                  whisperMutation.mutate(whisperText.trim());
                }}
                activeOpacity={0.7}
              >
                <Feather name="send" size={16} color={Colors.pink} />
              </TouchableOpacity>
            </View>

            {whispers.slice(0, 4).map((w: any, i: number) => (
              <View key={w.id} style={styles.whisperItem}>
                <Text style={styles.whisperText}>{w.content}</Text>
                <TouchableOpacity
                  style={styles.heartBtn}
                  onPress={() => likeMutation.mutate(w.id)}
                  activeOpacity={0.6}
                >
                  <Feather name="heart" size={12} color={Colors.pink} />
                  <Text style={styles.heartCount}>{w.hearts || 0}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </AnimatedCard>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  clock: { ...Typography.caption, color: Colors.textTertiary, letterSpacing: 1, marginBottom: Spacing.xs },
  headline: { ...Typography.title, color: Colors.text, lineHeight: 36 },
  accent: { color: Colors.indigo },
  greeting: { ...Typography.caption, color: Colors.textSecondary, marginTop: Spacing.xs },

  scanBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xs,
  },

  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  sectionLabel: { ...Typography.footnote, color: Colors.textTertiary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: Spacing.md, marginLeft: Spacing.xs },
  carousel: { gap: Spacing.md, paddingVertical: Spacing.xs },
  serviceCard: {
    width: 100, paddingVertical: 14, paddingHorizontal: 10,
    borderRadius: Radius.lg, borderWidth: 1,
    backgroundColor: Colors.surface,
    alignItems: 'center', gap: 6,
  },
  serviceEmoji: { fontSize: 22 },
  serviceTitle: { ...Typography.footnote, fontWeight: '600', textAlign: 'center' },

  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.md },
  cardTitle: { ...Typography.caption, fontWeight: '600', color: Colors.text },
  promptText: {
    ...Typography.body, color: Colors.textSecondary, fontStyle: 'italic',
    marginBottom: Spacing.md, lineHeight: 20, fontSize: 13,
  },
  textarea: {
    backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, padding: Spacing.md,
    color: Colors.text, ...Typography.body, minHeight: 70,
  },

  whisperRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  whisperInput: {
    flex: 1, backgroundColor: Colors.surface2,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    color: Colors.text, fontSize: 13,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: Radius.md,
    backgroundColor: Colors.pink + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  whisperItem: {
    paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  whisperText: { flex: 1, color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginRight: Spacing.md },
  heartBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heartCount: { color: Colors.pink, fontSize: 11 },
});
