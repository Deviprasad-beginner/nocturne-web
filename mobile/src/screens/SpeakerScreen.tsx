/**
 * Starlit Speaker Screen — voice notes with topic selection
 * API: GET /speaker, POST /speaker
 */

import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import api from '../lib/api';
import { haptics } from '../lib/haptics';
import { NightCard } from '../components/NightCard';

interface SpeakerEntry {
    id: number;
    topic: string;
    notes: string | null;
    durationSeconds: number | null;
    createdAt: string;
}

const TOPICS = [
    { value: 'storytime', label: '📖 Storytime', color: '#a78bfa', rgb: '167,139,250' },
    { value: 'confessions', label: '🤫 Confessions', color: '#fb7185', rgb: '251,113,133' },
    { value: 'motivational', label: '🔥 Motivation', color: '#fbbf24', rgb: '251,191,36' },
    { value: 'philosophical', label: '🤔 Deep Thoughts', color: '#34d399', rgb: '52,211,153' },
];

function fmtTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function SpeakerScreen({ navigation }: any) {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

    const { data: entries = [], isLoading } = useQuery<SpeakerEntry[]>({
        queryKey: ['speaker-entries'],
        queryFn: () => api.get('/speaker').then(r => r.data ?? []),
    });

    const filtered = selectedTopic ? entries.filter(e => e.topic === selectedTopic) : entries;

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => { haptics.light(); navigation.goBack(); }} activeOpacity={0.7}>
                        <Feather name="arrow-left" size={20} color="#a78bfa" />
                    </TouchableOpacity>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.title}>🎙️ Starlit Speaker</Text>
                        <Text style={styles.subtitle}>Anonymous voice notes under the stars</Text>
                    </View>
                </View>

                {/* Info Card */}
                <NightCard accent="#a78bfa40" style={{ marginHorizontal: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={styles.micIcon}>
                            <Feather name="mic" size={20} color="#fff" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoTitle}>Record a Voice Note</Text>
                            <Text style={styles.infoDesc}>Voice recording is available on the native app. Browse and listen to entries here.</Text>
                        </View>
                    </View>
                </NightCard>

                {/* Topic Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topics}>
                    <TouchableOpacity
                        style={[styles.topicChip, !selectedTopic && { backgroundColor: '#818cf820', borderColor: '#818cf860' }]}
                        onPress={() => { haptics.select(); setSelectedTopic(null); }}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.topicLabel, !selectedTopic && { color: '#818cf8' }]}>All</Text>
                    </TouchableOpacity>
                    {TOPICS.map(t => (
                        <TouchableOpacity
                            key={t.value}
                            style={[styles.topicChip, selectedTopic === t.value && { backgroundColor: t.color + '20', borderColor: t.color + '60' }]}
                            onPress={() => { haptics.select(); setSelectedTopic(t.value); }}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.topicLabel, selectedTopic === t.value && { color: t.color }]}>{t.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Entries List */}
                {isLoading ? (
                    <ActivityIndicator color="#a78bfa" style={{ marginTop: 40 }} />
                ) : filtered.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Feather name="radio" size={36} color="#374151" />
                        <Text style={styles.emptyText}>No recordings yet tonight</Text>
                    </View>
                ) : (
                    filtered.map(entry => {
                        const topicMeta = TOPICS.find(t => t.value === entry.topic);
                        const color = topicMeta?.color ?? '#818cf8';
                        return (
                            <NightCard key={entry.id} accent={color + '30'} style={{ marginHorizontal: 16 }}>
                                <View style={styles.entryRow}>
                                    <View style={[styles.playCircle, { borderColor: color }]}>
                                        <Feather name="play" size={16} color={color} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <Text style={[styles.topicBadge, { color, backgroundColor: color + '15' }]}>
                                                {topicMeta?.label ?? entry.topic}
                                            </Text>
                                            {entry.durationSeconds && (
                                                <Text style={styles.duration}>{fmtTime(entry.durationSeconds)}</Text>
                                            )}
                                        </View>
                                        {entry.notes && (
                                            <Text style={styles.notes} numberOfLines={2}>{entry.notes}</Text>
                                        )}
                                        <Text style={styles.time}>
                                            {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                </View>
                            </NightCard>
                        );
                    })
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#000000' },
    scroll: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
    title: { fontSize: 22, fontWeight: '700', color: '#e2e8f0' },
    subtitle: { fontSize: 11, color: '#4b5563', marginTop: 2 },
    micIcon: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center',
    },
    infoTitle: { color: '#e2e8f0', fontSize: 14, fontWeight: '600' },
    infoDesc: { color: '#6b7280', fontSize: 11, marginTop: 2, lineHeight: 16 },
    topics: { paddingHorizontal: 16, paddingBottom: 14, gap: 8 },
    topicChip: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    topicLabel: { fontSize: 12, fontWeight: '500', color: '#6b7280' },
    emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
    emptyText: { color: '#374151', fontSize: 13, fontStyle: 'italic' },
    entryRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    playCircle: {
        width: 44, height: 44, borderRadius: 22, borderWidth: 1.5,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    topicBadge: { fontSize: 10, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    duration: { color: '#4b5563', fontSize: 11 },
    notes: { color: '#9ca3af', fontSize: 12, lineHeight: 18, marginTop: 4 },
    time: { color: '#374151', fontSize: 10, marginTop: 4 },
});
