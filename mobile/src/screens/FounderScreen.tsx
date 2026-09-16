/**
 * 3AM Founder Screen — late-night startup pitches with upvotes + replies
 * API: GET /founder, POST /founder, POST /founder/:id/upvote
 */

import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import api from '../lib/api';
import { haptics } from '../lib/haptics';
import { NightCard } from '../components/NightCard';
import { GlowButton } from '../components/GlowButton';

interface FounderPitch {
    id: number;
    title: string;
    description: string;
    category: string;
    upvotes: number;
    authorId: number | null;
    createdAt: string;
}

const CATEGORIES = [
    { value: 'saas', label: '💻 SaaS', color: '#60a5fa' },
    { value: 'consumer', label: '📱 Consumer', color: '#34d399' },
    { value: 'ai', label: '🤖 AI / ML', color: '#c084fc' },
    { value: 'social', label: '👥 Social', color: '#fb7185' },
    { value: 'fintech', label: '💰 Fintech', color: '#fbbf24' },
    { value: 'other', label: '🌙 Other', color: '#818cf8' },
];

function getCategoryColor(cat: string) {
    return CATEGORIES.find(c => c.value === cat)?.color ?? '#818cf8';
}
function getCategoryLabel(cat: string) {
    return CATEGORIES.find(c => c.value === cat)?.label ?? cat;
}

export default function FounderScreen({ navigation }: any) {
    const qc = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('saas');

    const { data: pitches = [], isLoading, refetch } = useQuery<FounderPitch[]>({
        queryKey: ['founder-pitches'],
        queryFn: () => api.get('/founder').then(r => r.data ?? []),
    });

    const postMutation = useMutation({
        mutationFn: () => api.post('/founder', { title, description, category }),
        onSuccess: () => {
            haptics.success();
            setTitle(''); setDescription(''); setShowForm(false);
            qc.invalidateQueries({ queryKey: ['founder-pitches'] });
        },
        onError: () => haptics.error(),
    });

    const upvoteMutation = useMutation({
        mutationFn: (id: number) => api.post(`/founder/${id}/upvote`),
        onSuccess: () => {
            haptics.light();
            qc.invalidateQueries({ queryKey: ['founder-pitches'] });
        },
    });

    const hour = new Date().getHours();
    const is3AM = hour >= 1 && hour < 5;

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#818cf8" />}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => { haptics.light(); navigation.goBack(); }} activeOpacity={0.7}>
                        <Feather name="arrow-left" size={20} color="#818cf8" />
                    </TouchableOpacity>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.title}>🚀 3AM Founder</Text>
                        <Text style={styles.subtitle}>
                            {is3AM ? "The golden hour. Pitch your wildest idea." : "Late-night startup pitches & wild ideas"}
                        </Text>
                    </View>
                    {is3AM && <View style={styles.liveDot} />}
                </View>

                {/* New Pitch Toggle */}
                {!showForm ? (
                    <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
                        <GlowButton
                            label="✨ Pitch an Idea"
                            onPress={() => { haptics.medium(); setShowForm(true); }}
                            color="#4f46e5"
                            size="md"
                        />
                    </View>
                ) : (
                    <NightCard accent="#818cf840" style={{ marginHorizontal: 16 }}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Your startup name / idea title..."
                            placeholderTextColor="#374151"
                            value={title}
                            onChangeText={setTitle}
                        />
                        <TextInput
                            style={[styles.textInput, { minHeight: 80 }]}
                            placeholder="Describe your idea. What problem does it solve?"
                            placeholderTextColor="#374151"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            textAlignVertical="top"
                        />
                        {/* Category selector */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 10 }}>
                            {CATEGORIES.map(c => (
                                <TouchableOpacity
                                    key={c.value}
                                    style={[styles.catChip, category === c.value && { backgroundColor: c.color + '20', borderColor: c.color + '60' }]}
                                    onPress={() => { haptics.select(); setCategory(c.value); }}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.catLabel, category === c.value && { color: c.color }]}>{c.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <GlowButton
                                label="Cancel"
                                onPress={() => setShowForm(false)}
                                color="#1f2937" textColor="#9ca3af" size="sm"
                                style={{ flex: 1 }}
                            />
                            <GlowButton
                                label={postMutation.isPending ? 'Pitching...' : 'Ship It 🚀'}
                                onPress={() => postMutation.mutate()}
                                disabled={!title.trim() || !description.trim()}
                                loading={postMutation.isPending}
                                size="sm"
                                style={{ flex: 1 }}
                            />
                        </View>
                    </NightCard>
                )}

                {/* Pitches Feed */}
                <Text style={styles.sectionLabel}>Recent Pitches</Text>
                {isLoading ? (
                    <ActivityIndicator color="#818cf8" style={{ marginTop: 30 }} />
                ) : pitches.length === 0 ? (
                    <Text style={styles.emptyText}>No pitches yet tonight. Be the first founder. 🌙</Text>
                ) : (
                    pitches.map(pitch => {
                        const catColor = getCategoryColor(pitch.category);
                        return (
                            <NightCard key={pitch.id} accent={catColor + '30'} style={{ marginHorizontal: 16 }}>
                                <View style={styles.pitchHeader}>
                                    <View style={[styles.catBadge, { backgroundColor: catColor + '20', borderColor: catColor + '40' }]}>
                                        <Text style={[styles.catBadgeText, { color: catColor }]}>{getCategoryLabel(pitch.category)}</Text>
                                    </View>
                                    <Text style={styles.pitchTime}>
                                        {new Date(pitch.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                                <Text style={styles.pitchTitle}>{pitch.title}</Text>
                                <Text style={styles.pitchDesc} numberOfLines={4}>{pitch.description}</Text>
                                <TouchableOpacity
                                    style={styles.upvoteRow}
                                    onPress={() => upvoteMutation.mutate(pitch.id)}
                                    activeOpacity={0.7}
                                >
                                    <Feather name="arrow-up" size={16} color="#818cf8" />
                                    <Text style={styles.upvoteCount}>{pitch.upvotes || 0}</Text>
                                </TouchableOpacity>
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
    liveDot: {
        width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444',
        shadowColor: '#ef4444', shadowOpacity: 0.8, shadowRadius: 6,
    },
    textInput: {
        backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
        borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
        color: '#e2e8f0', fontSize: 14, marginBottom: 10,
    },
    catChip: {
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    catLabel: { fontSize: 11, fontWeight: '500', color: '#6b7280' },
    sectionLabel: {
        fontSize: 10, color: '#4b5563', letterSpacing: 2, textTransform: 'uppercase',
        marginHorizontal: 20, marginBottom: 10, marginTop: 8,
    },
    emptyText: { color: '#374151', textAlign: 'center', marginVertical: 30, fontSize: 13, fontStyle: 'italic' },
    pitchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    catBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, borderWidth: 1 },
    catBadgeText: { fontSize: 10, fontWeight: '600' },
    pitchTime: { color: '#374151', fontSize: 10 },
    pitchTitle: { color: '#e2e8f0', fontSize: 16, fontWeight: '700', marginBottom: 4 },
    pitchDesc: { color: '#9ca3af', fontSize: 13, lineHeight: 20 },
    upvoteRow: {
        flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10,
        paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)',
    },
    upvoteCount: { color: '#818cf8', fontSize: 13, fontWeight: '600' },
});
