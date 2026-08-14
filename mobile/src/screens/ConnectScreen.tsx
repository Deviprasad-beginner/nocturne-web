/**
 * Night Circles Screen — list, quick join, real-time chat
 */

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  FlatList, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import api from '../lib/api';
import { haptics } from '../lib/haptics';
import { NightCard } from '../components/NightCard';
import { GlowButton } from '../components/GlowButton';

const STATE_COLORS: Record<string, string> = {
  active: '#34d399',
  deep_phase: '#c084fc',
  forming: '#818cf8',
  waiting: '#f59e0b',
};

const MOODS = ['introspective', 'anxious', 'hopeful', 'melancholic', 'calm'];

export default function CirclesScreen({ navigation }: any) {
  const qc = useQueryClient();
  const [joinedCircle, setJoinedCircle] = useState<any>(null);
  const [message, setMessage] = useState('');

  const { data: circles = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ['circles'],
    queryFn: () => api.get('/circles').then(r => r.data ?? []),
    refetchInterval: 30_000,
  });

  const { data: messages = [] } = useQuery<any[]>({
    queryKey: ['circle-messages', joinedCircle?.id],
    queryFn: () =>
      api.get(`/circles/${joinedCircle.id}/messages`).then(r => r.data ?? []),
    enabled: !!joinedCircle,
    refetchInterval: 5_000,
  });

  const joinMutation = useMutation({
    mutationFn: (circleId: number) =>
      api.post(`/circles/${circleId}/join`, { mode: 'anonymous' }),
    onSuccess: (_, circleId) => {
      haptics.success();
      const circle = circles.find((c: any) => c.id === circleId);
      setJoinedCircle(circle);
      qc.invalidateQueries({ queryKey: ['circles'] });
    },
    onError: () => haptics.error(),
  });

  const quickJoinMutation = useMutation({
    mutationFn: (emotion: string) =>
      api.post('/circles/quick-join', { preferredEmotion: emotion, preferredMode: 'anonymous', size: 5 }),
    onSuccess: (res: any) => {
      haptics.success();
      setJoinedCircle(res.data?.circle ?? res.data);
    },
    onError: () => haptics.error(),
  });

  const sendMutation = useMutation({
    mutationFn: ({ circleId, content }: any) =>
      api.post(`/circles/${circleId}/messages`, { senderAlias: 'You', content }),
    onSuccess: () => {
      haptics.light();
      setMessage('');
      qc.invalidateQueries({ queryKey: ['circle-messages', joinedCircle?.id] });
    },
    onError: () => haptics.error(),
  });

  // ——— Chat View ———
  if (joinedCircle) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => { haptics.light(); setJoinedCircle(null); }} activeOpacity={0.7}>
            <Feather name="arrow-left" size={20} color="#818cf8" />
          </TouchableOpacity>
          <Text style={styles.chatTitle}># {joinedCircle.name}</Text>
          <View style={[styles.dot, { backgroundColor: STATE_COLORS[joinedCircle.state] ?? '#818cf8' }]} />
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item: any) => String(item.id)}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }: any) => (
            <View style={styles.messageRow}>
              <Text style={styles.messageAlias}>{item.senderAlias}</Text>
              <Text style={styles.messageText}>{item.content}</Text>
            </View>
          )}
          inverted
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.chatInput}
            placeholder="Say something..."
            placeholderTextColor="#374151"
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity
            style={styles.sendBtnChat}
            onPress={() => {
              if (!message.trim()) return;
              haptics.medium();
              sendMutation.mutate({ circleId: joinedCircle.id, content: message.trim() });
            }}
            activeOpacity={0.8}
          >
            <Feather name="send" size={16} color="#818cf8" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ——— Circles List View ———
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>🌙 Night Circles</Text>
          <Text style={styles.subtitle}>Anonymous group conversations</Text>
        </View>

        {/* Quick join mood chips */}
        <NightCard accent="#a78bfa40" style={{ marginHorizontal: 16, marginBottom: 12 }}>
          <Text style={styles.cardLabel}>Quick Join by Mood</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {MOODS.map((mood) => (
              <TouchableOpacity
                key={mood}
                style={styles.moodChip}
                onPress={() => { haptics.medium(); quickJoinMutation.mutate(mood); }}
                activeOpacity={0.8}
              >
                {quickJoinMutation.isPending
                  ? <ActivityIndicator size="small" color="#a78bfa" />
                  : <Text style={styles.moodChipText}>{mood}</Text>
                }
              </TouchableOpacity>
            ))}
          </ScrollView>
        </NightCard>

        {/* Active circles */}
        <Text style={styles.sectionLabel}>Active Circles</Text>
        {isLoading ? (
          <ActivityIndicator color="#818cf8" style={{ marginTop: 30 }} />
        ) : circles.filter((c: any) => c.state !== 'ended').map((circle: any) => {
          const isFull = circle.currentMembers >= circle.maxMembers;
          return (
            <NightCard key={circle.id} accent={STATE_COLORS[circle.state] + '40'} style={{ marginHorizontal: 16 }}>
              <View style={styles.circleRow}>
                <View style={[styles.dot, { backgroundColor: STATE_COLORS[circle.state] ?? '#818cf8' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.circleName}># {circle.name}</Text>
                  {circle.primaryEmotion && (
                    <Text style={styles.circleEmotion}>{circle.primaryEmotion}</Text>
                  )}
                </View>
                <Text style={styles.memberCount}>
                  {circle.currentMembers}/{circle.maxMembers}
                </Text>
                <GlowButton
                  label={isFull ? 'Full' : 'Join →'}
                  onPress={() => joinMutation.mutate(circle.id)}
                  disabled={isFull || joinMutation.isPending}
                  color={isFull ? '#374151' : '#a78bfa'}
                  size="sm"
                  style={{ width: 72 }}
                />
              </View>
            </NightCard>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#050508' },
  scroll: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#e2e8f0' },
  subtitle: { fontSize: 12, color: '#4b5563', marginTop: 2 },
  sectionLabel: { fontSize: 10, color: '#4b5563', letterSpacing: 2, textTransform: 'uppercase', marginHorizontal: 20, marginBottom: 10 },
  cardLabel: { fontSize: 12, color: '#6b7280', marginBottom: 10 },
  moodChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#a78bfa40',
    backgroundColor: 'rgba(167,139,250,0.08)',
  },
  moodChipText: { color: '#a78bfa', fontSize: 12, fontWeight: '500' },
  circleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  circleName: { color: '#e2e8f0', fontSize: 14, fontWeight: '600' },
  circleEmotion: { color: '#6b7280', fontSize: 11, marginTop: 2 },
  memberCount: { color: '#4b5563', fontSize: 11 },
  // Chat styles
  chatHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  chatTitle: { flex: 1, color: '#e2e8f0', fontSize: 16, fontWeight: '600' },
  messageList: { paddingHorizontal: 16, paddingBottom: 20 },
  messageRow: { marginTop: 14 },
  messageAlias: { color: '#a78bfa', fontSize: 10, fontWeight: '600', marginBottom: 3 },
  messageText: { color: '#9ca3af', fontSize: 14, lineHeight: 20 },
  inputRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
  },
  chatInput: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    color: '#e2e8f0', fontSize: 14,
  },
  sendBtnChat: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: 'rgba(129,140,248,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
});
