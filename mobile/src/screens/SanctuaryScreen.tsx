/**
 * Home (Sanctuary) Screen
 * Live feed: Tonight's Reflection · Whispers · Services carousel
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  FlatList, RefreshControl, StyleSheet, Dimensions,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../lib/api';
import { haptics } from '../lib/haptics';
import { useAuth } from '../context/AuthContext';
import { NightCard } from '../components/NightCard';
import { GlowButton } from '../components/GlowButton';

const { width } = Dimensions.get('window');

const SERVICES = [
  { title: 'Soothing Night', emoji: '🎵', color: '#818cf8', route: 'Music' },
  { title: 'Night Circles', emoji: '🌙', color: '#a78bfa', route: 'Circles' },
  { title: 'Night Thoughts', emoji: '💭', color: '#fb7185', route: 'Thoughts' },
  { title: 'Mind Maze', emoji: '🧩', color: '#fbbf24', route: 'Discover' },
  { title: 'Midnight Café', emoji: '☕', color: '#fb923c', route: 'Discover' },
];

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [whisperText, setWhisperText] = useState('');
  const [reflectionText, setReflectionText] = useState('');
  const [time, setTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Data fetching
  const { data: prompt } = useQuery<any>({
    queryKey: ['prompt'],
    queryFn: () => api.get('/reflections/prompt?type=diary').then(r => r.data),
  });

  const { data: whispers = [], isLoading: loadingWhispers, refetch: refetchWhispers } = useQuery<any[]>({
    queryKey: ['whispers'],
    queryFn: () => api.get('/whispers').then(r => r.data ?? []),
  });

  // Post whisper
  const whisperMutation = useMutation({
    mutationFn: (content: string) => api.post('/whispers', { content }),
    onSuccess: () => {
      haptics.success();
      qc.invalidateQueries({ queryKey: ['whispers'] });
      setWhisperText('');
    },
    onError: () => haptics.error(),
  });

  // Like whisper
  const likeMutation = useMutation({
    mutationFn: (id: number) => api.post(`/whispers/${id}/like`),
    onSuccess: () => {
      haptics.light();
      qc.invalidateQueries({ queryKey: ['whispers'] });
    },
  });

  // Post reflection → diary
  const reflectMutation = useMutation({
    mutationFn: (content: string) =>
      api.post('/diaries', { content, isPublic: true, mood: 'reflective' }),
    onSuccess: () => {
      haptics.success();
      setReflectionText('');
    },
    onError: () => haptics.error(),
  });

  const hour = time.getHours();
  const greeting = hour < 5 ? 'Still awake?' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loadingWhispers}
            onRefresh={() => { haptics.light(); refetchWhispers(); }}
            tintColor="#818cf8"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.clock}>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Text style={styles.headline}>
            Tonight is <Text style={styles.accent}>unwritten</Text>.
          </Text>
          {user && (
            <Text style={styles.greeting}>{greeting}, {user.displayName || user.username} ✦</Text>
          )}
        </View>

        {/* Services Carousel */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>✦ Explore Nocturne</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
            {SERVICES.map((s) => (
              <TouchableOpacity
                key={s.route + s.title}
                style={[styles.serviceCard, { borderColor: s.color + '40' }]}
                onPress={() => { haptics.light(); navigation.navigate(s.route); }}
                activeOpacity={0.8}
              >
                <Text style={styles.serviceEmoji}>{s.emoji}</Text>
                <Text style={[styles.serviceTitle, { color: s.color }]}>{s.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tonight's Reflection */}
        <View style={styles.section}>
          <NightCard accent="#818cf8">
            <View style={styles.sectionRow}>
              <Feather name="zap" size={14} color="#818cf8" />
              <Text style={styles.cardTitle}>Tonight's Reflection</Text>
            </View>
            {prompt?.content && (
              <Text style={styles.promptText}>"{prompt.content}"</Text>
            )}
            <TextInput
              style={styles.textarea}
              placeholder="Reflect on this cue. The night remembers..."
              placeholderTextColor="#374151"
              value={reflectionText}
              onChangeText={setReflectionText}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <GlowButton
              label={reflectMutation.isPending ? 'Archiving...' : 'Archive Entry'}
              onPress={() => {
                if (!reflectionText.trim()) { haptics.warning(); return; }
                reflectMutation.mutate(reflectionText.trim());
              }}
              loading={reflectMutation.isPending}
              disabled={!reflectionText.trim()}
              size="sm"
              style={{ marginTop: 10 }}
            />
          </NightCard>
        </View>

        {/* Late-Night Whispers */}
        <View style={styles.section}>
          <NightCard accent="#fb718540">
            <View style={styles.sectionRow}>
              <Feather name="wind" size={14} color="#fb7185" />
              <Text style={styles.cardTitle}>Late-Night Whispers</Text>
            </View>

            {/* Quick post */}
            <View style={styles.whisperRow}>
              <TextInput
                style={styles.whisperInput}
                placeholder="Whisper anonymously into the void..."
                placeholderTextColor="#374151"
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
                activeOpacity={0.8}
              >
                <Feather name="send" size={16} color="#fb7185" />
              </TouchableOpacity>
            </View>

            {/* Feed */}
            {whispers.slice(0, 4).map((w: any) => (
              <View key={w.id} style={styles.whisperItem}>
                <Text style={styles.whisperText}>{w.content}</Text>
                <TouchableOpacity
                  style={styles.heartBtn}
                  onPress={() => likeMutation.mutate(w.id)}
                  activeOpacity={0.7}
                >
                  <Feather name="heart" size={12} color="#fb7185" />
                  <Text style={styles.heartCount}>{w.hearts || 0}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </NightCard>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#050508' },
  scroll: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  clock: { fontSize: 12, color: '#4b5563', letterSpacing: 1, marginBottom: 4 },
  headline: { fontSize: 28, fontWeight: '700', color: '#e2e8f0', lineHeight: 36 },
  accent: { color: '#818cf8' },
  greeting: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionLabel: { fontSize: 10, color: '#4b5563', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 },
  carousel: { gap: 10, paddingVertical: 4 },
  serviceCard: {
    width: 100, paddingVertical: 14, paddingHorizontal: 10,
    borderRadius: 14, borderWidth: 1,
    backgroundColor: '#0d0d14',
    alignItems: 'center', gap: 6,
  },
  serviceEmoji: { fontSize: 22 },
  serviceTitle: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  cardTitle: { fontSize: 13, fontWeight: '600', color: '#e2e8f0' },
  promptText: {
    fontSize: 13, color: '#9ca3af', fontStyle: 'italic',
    marginBottom: 10, lineHeight: 20,
  },
  textarea: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10, padding: 12,
    color: '#e2e8f0', fontSize: 14, minHeight: 70,
  },
  whisperRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  whisperInput: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    color: '#e2e8f0', fontSize: 13,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: 'rgba(251,113,133,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  whisperItem: {
    paddingVertical: 10, borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  whisperText: { flex: 1, color: '#9ca3af', fontSize: 13, lineHeight: 19, marginRight: 10 },
  heartBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heartCount: { color: '#fb7185', fontSize: 11 },
});
