/**
 * Tonight's Reads Screen — curated reading with intention filters
 * API: GET /reads/tonight, POST /reads
 */

import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import api from '../lib/api';
import { haptics } from '../lib/haptics';
import { NightCard } from '../components/NightCard';

interface Read {
    id: number;
    title: string;
    author: string | null;
    content: string | null;
    contentType: string;
    intention: string;
    estimatedReadTimeMinutes: number | null;
}

const INTENTIONS = [
    { value: 'all', label: 'All', emoji: '✨', color: '#e2e8f0' },
    { value: 'learn', label: 'Learn', emoji: '📚', color: '#60a5fa' },
    { value: 'feel', label: 'Feel', emoji: '💫', color: '#fbbf24' },
    { value: 'think', label: 'Think', emoji: '🧠', color: '#818cf8' },
    { value: 'sleep', label: 'Sleep', emoji: '🌙', color: '#c084fc' },
];

export default function ReadsScreen({ navigation }: any) {
    const [filter, setFilter] = useState('all');

    const { data: reads = [], isLoading } = useQuery<Read[]>({
        queryKey: ['reads-tonight'],
        queryFn: () => api.get('/reads/tonight').then(r => r.data ?? []),
        staleTime: 1000 * 60 * 10,
    });

    const filtered = filter === 'all' ? reads : reads.filter(r => r.intention === filter);

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => { haptics.light(); navigation.goBack(); }} activeOpacity={0.7}>
                        <Feather name="arrow-left" size={20} color="#818cf8" />
                    </TouchableOpacity>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.title}>📖 Tonight's Reads</Text>
                        <Text style={styles.subtitle}>Curated texts shared by fellow night readers</Text>
                    </View>
                </View>

                {/* Intention Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
                    {INTENTIONS.map(i => (
                        <TouchableOpacity
                            key={i.value}
                            style={[styles.filterChip, filter === i.value && { backgroundColor: i.color + '20', borderColor: i.color + '60' }]}
                            onPress={() => { haptics.select(); setFilter(i.value); }}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.filterEmoji}>{i.emoji}</Text>
                            <Text style={[styles.filterLabel, filter === i.value && { color: i.color }]}>{i.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Reads List */}
                {isLoading ? (
                    <ActivityIndicator color="#818cf8" style={{ marginTop: 40 }} />
                ) : filtered.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Feather name="book-open" size={40} color="#374151" />
                        <Text style={styles.emptyTitle}>No reads tonight</Text>
                        <Text style={styles.emptySubtitle}>Be the first to share something for others to discover</Text>
                    </View>
                ) : (
                    filtered.map(read => (
                        <NightCard key={read.id} accent="#c084fc40" style={{ marginHorizontal: 16 }}>
                            <View style={styles.readRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.readTitle}>{read.title}</Text>
                                    {read.author && <Text style={styles.readAuthor}>by {read.author}</Text>}
                                    {read.content && (
                                        <Text style={styles.readExcerpt} numberOfLines={3}>
                                            {read.content.substring(0, 150)}...
                                        </Text>
                                    )}
                                </View>
                                {read.contentType === 'pdf' && (
                                    <View style={styles.pdfBadge}>
                                        <Text style={styles.pdfBadgeText}>PDF</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.readMeta}>
                                {read.estimatedReadTimeMinutes && (
                                    <View style={styles.metaItem}>
                                        <Feather name="clock" size={10} color="#4b5563" />
                                        <Text style={styles.metaText}>{read.estimatedReadTimeMinutes}m</Text>
                                    </View>
                                )}
                                <View style={styles.metaItem}>
                                    <Text style={styles.metaText}>
                                        {INTENTIONS.find(i => i.value === read.intention)?.emoji} {read.intention}
                                    </Text>
                                </View>
                            </View>
                        </NightCard>
                    ))
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
    filters: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
    filterChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    filterEmoji: { fontSize: 14 },
    filterLabel: { fontSize: 12, fontWeight: '500', color: '#6b7280' },
    emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
    emptyTitle: { color: '#6b7280', fontSize: 16, fontWeight: '600' },
    emptySubtitle: { color: '#374151', fontSize: 12, textAlign: 'center', paddingHorizontal: 40 },
    readRow: { flexDirection: 'row', gap: 10 },
    readTitle: { color: '#e2e8f0', fontSize: 16, fontWeight: '600', marginBottom: 2 },
    readAuthor: { color: '#6b7280', fontSize: 12, marginBottom: 6 },
    readExcerpt: { color: '#4b5563', fontSize: 12, lineHeight: 18 },
    pdfBadge: {
        backgroundColor: 'rgba(239,68,68,0.15)', paddingHorizontal: 8, paddingVertical: 3,
        borderRadius: 6, alignSelf: 'flex-start',
    },
    pdfBadgeText: { color: '#fca5a5', fontSize: 10, fontWeight: '600' },
    readMeta: { flexDirection: 'row', gap: 14, marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)' },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { color: '#4b5563', fontSize: 11 },
});
