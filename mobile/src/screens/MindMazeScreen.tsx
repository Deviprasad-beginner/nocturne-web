import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, ActivityIndicator, Modal, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import api from '../lib/api';
import { haptics } from '../lib/haptics';
import { NightCard } from '../components/NightCard';
import { GlowButton } from '../components/GlowButton';

const DOMAINS = [
    { id: 'all', label: 'All', icon: '✨', color: '#e2e8f0' },
    { id: 'existence', label: 'Existence', icon: '🌑', color: '#a78bfa' },
    { id: 'emotion', label: 'Emotion', icon: '🌊', color: '#fb7185' },
    { id: 'society', label: 'Society', icon: '🏛️', color: '#fbbf24' },
    { id: 'time-memory', label: 'Time & Memory', icon: '🕰️', color: '#2dd4bf' },
    { id: 'logic', label: 'Logic', icon: '🔬', color: '#4ade80' },
    { id: 'tech-ethics', label: 'Tech & Ethics', icon: '⚡', color: '#60a5fa' },
] as const;

export default function MindMazeScreen({ navigation }: any) {
    const qc = useQueryClient();
    const [activeDomain, setActiveDomain] = useState('all');
    const [activeMaze, setActiveMaze] = useState<any>(null);
    const [sparkType, setSparkType] = useState<'analytical' | 'abstract'>('analytical');
    const [sparkContent, setSparkContent] = useState('');

    const { data: mazes = [], isLoading } = useQuery<any[]>({
        queryKey: ['mind-maze'],
        queryFn: () => api.get('/mind-maze').then(r => r.data ?? []),
    });

    const { data: sparks = [], isLoading: isLoadingSparks } = useQuery<any[]>({
        queryKey: ['mind-maze-sparks', activeMaze?.id],
        queryFn: () => api.get(`/mind-maze/${activeMaze.id}/sparks`).then(r => r.data ?? []),
        enabled: !!activeMaze,
    });

    const createSparkMutation = useMutation({
        mutationFn: (payload: { content: string; sparkType: string }) =>
            api.post(`/mind-maze/${activeMaze.id}/sparks`, payload),
        onSuccess: () => {
            haptics.success();
            setSparkContent('');
            qc.invalidateQueries({ queryKey: ['mind-maze-sparks', activeMaze?.id] });
        },
        onError: () => haptics.error(),
    });

    const filteredMazes = activeDomain === 'all'
        ? mazes
        : mazes.filter(m => m.domain === activeDomain);

    const analyticalSparks = sparks.filter(s => s.sparkType === 'analytical');
    const abstractSparks = sparks.filter(s => s.sparkType === 'abstract');

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Detail Modal */}
            <Modal visible={!!activeMaze} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setActiveMaze(null)}>
                <SafeAreaView style={styles.modalSafe} edges={['top']}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setActiveMaze(null)} style={{ padding: 4 }}>
                            <Feather name="chevron-down" size={24} color="#9ca3af" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle} numberOfLines={1}>
                            {DOMAINS.find(d => d.id === activeMaze?.domain)?.label ?? 'Paradox'}
                        </Text>
                        <View style={{ width: 32 }} />
                    </View>

                    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                        <View style={styles.mazeHeader}>
                            <View style={styles.mazeIconWrap}>
                                <Feather name="cpu" size={24} color="#fff" />
                            </View>
                            <Text style={styles.mazeContentText}>{activeMaze?.content}</Text>
                        </View>

                        {/* Spark Input */}
                        <View style={styles.sparkInputContainer}>
                            <View style={styles.sparkTypeTabs}>
                                {(['analytical', 'abstract'] as const).map(t => (
                                    <TouchableOpacity
                                        key={t}
                                        style={[styles.sparkTypeTab, sparkType === t && (t === 'analytical' ? styles.tabAnalytical : styles.tabAbstract)]}
                                        onPress={() => { haptics.select(); setSparkType(t); }}
                                    >
                                        <Text style={[styles.sparkTypeText, sparkType === t && (t === 'analytical' ? { color: '#67e8f9' } : { color: '#d8b4fe' })]}>
                                            {t === 'analytical' ? 'Analytical' : 'Abstract'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TextInput
                                style={styles.sparkInput}
                                placeholder={sparkType === 'analytical' ? "Break it down logically..." : "What does instinct say?"}
                                placeholderTextColor="#4b5563"
                                value={sparkContent}
                                onChangeText={setSparkContent}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                            <GlowButton
                                label="Spark"
                                onPress={() => {
                                    if (sparkContent.trim()) createSparkMutation.mutate({ content: sparkContent.trim(), sparkType });
                                }}
                                disabled={!sparkContent.trim() || createSparkMutation.isPending}
                                size="sm"
                                color={sparkType === 'analytical' ? '#06b6d4' : '#a855f7'}
                                style={{ alignSelf: 'flex-end', marginTop: 12, width: 100 }}
                            />
                        </View>

                        {/* Sparks List (Combined) */}
                        <View style={styles.sparksList}>
                            <Text style={styles.sparksSectionTitle}>Responses ({sparks.length})</Text>
                            {isLoadingSparks ? (
                                <ActivityIndicator color="#a855f7" />
                            ) : sparks.map((s, i) => (
                                <View key={i} style={[styles.sparkCard, s.sparkType === 'analytical' ? styles.sparkAnalytical : styles.sparkAbstract]}>
                                    <View style={styles.sparkBadge}>
                                        <Text style={[styles.sparkBadgeText, s.sparkType === 'analytical' ? { color: '#67e8f9' } : { color: '#d8b4fe' }]}>
                                            {s.sparkType.toUpperCase()}
                                        </Text>
                                    </View>
                                    <Text style={styles.sparkCardText}>{s.content}</Text>
                                </View>
                            ))}
                            <View style={{ height: 40 }} />
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* Main Screen */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
                    <Feather name="arrow-left" size={24} color="#e2e8f0" />
                </TouchableOpacity>
                <View style={{ marginLeft: 12 }}>
                    <Text style={styles.title}>Mind Maze</Text>
                    <Text style={styles.subtitle}>Navigate the paradoxes</Text>
                </View>
            </View>

            <View style={styles.filterSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.domainChips}>
                    {DOMAINS.map(d => (
                        <TouchableOpacity
                            key={d.id}
                            style={[styles.domainChip, activeDomain === d.id && { backgroundColor: d.color + '20', borderColor: d.color + '60' }]}
                            onPress={() => { haptics.select(); setActiveDomain(d.id); }}
                        >
                            <Text style={styles.domainIcon}>{d.icon}</Text>
                            <Text style={[styles.domainLabel, activeDomain === d.id && { color: d.color }]}>{d.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <ActivityIndicator color="#fbbf24" style={{ marginTop: 40 }} />
                ) : filteredMazes.map((maze: any) => {
                    const domainInfo = DOMAINS.find(d => d.id === maze.domain);
                    return (
                        <TouchableOpacity
                            key={maze.id}
                            style={styles.mazeCard}
                            activeOpacity={0.8}
                            onPress={() => { haptics.medium(); setActiveMaze(maze); }}
                        >
                            <View style={[styles.mazeDomainBadge, { backgroundColor: (domainInfo?.color ?? '#4b5563') + '20' }]}>
                                <Text style={{ fontSize: 10 }}>{domainInfo?.icon}</Text>
                                <Text style={[styles.mazeDomainLabel, { color: domainInfo?.color }]}>{domainInfo?.label}</Text>
                            </View>
                            <Text style={styles.mazeText} numberOfLines={3}>{maze.content}</Text>
                            <View style={styles.mazeFooter}>
                                <Text style={styles.mazeActionText}>Enter Maze</Text>
                                <Feather name="chevron-right" size={14} color="#6b7280" />
                            </View>
                        </TouchableOpacity>
                    );
                })}
                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#000000' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
    title: { fontSize: 24, fontWeight: '700', color: '#e2e8f0' },
    subtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
    filterSection: { paddingVertical: 12 },
    domainChips: { paddingHorizontal: 16, gap: 8 },
    domainChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#1f2937', backgroundColor: '#111827' },
    domainIcon: { fontSize: 12 },
    domainLabel: { color: '#9ca3af', fontSize: 13, fontWeight: '500' },
    list: { paddingHorizontal: 16, paddingTop: 4 },
    mazeCard: { backgroundColor: '#0a0a0a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 12 },
    mazeDomainBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
    mazeDomainLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
    mazeText: { color: '#e2e8f0', fontSize: 15, lineHeight: 22, fontWeight: '500', marginBottom: 16 },
    mazeFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
    mazeActionText: { color: '#6b7280', fontSize: 12, fontWeight: '500' },
    // Modal Styles
    modalSafe: { flex: 1, backgroundColor: '#000000' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1f2937' },
    modalTitle: { color: '#e2e8f0', fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
    mazeHeader: { alignItems: 'center', padding: 24 },
    mazeIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1e1e2d', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    mazeContentText: { color: '#fff', fontSize: 18, lineHeight: 26, fontWeight: '600', textAlign: 'center' },
    sparkInputContainer: { marginHorizontal: 16, backgroundColor: '#161622', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2d2d3a' },
    sparkTypeTabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    sparkTypeTab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: '#1e1e2d' },
    tabAnalytical: { backgroundColor: '#083344', borderWidth: 1, borderColor: '#06b6d4' },
    tabAbstract: { backgroundColor: '#3b0764', borderWidth: 1, borderColor: '#a855f7' },
    sparkTypeText: { fontSize: 12, fontWeight: '600', color: '#9ca3af' },
    sparkInput: { backgroundColor: '#0d0d16', borderRadius: 8, padding: 12, color: '#e2e8f0', fontSize: 14, minHeight: 80, borderWidth: 1, borderColor: '#1f2937' },
    sparksList: { paddingHorizontal: 16, paddingTop: 24 },
    sparksSectionTitle: { color: '#9ca3af', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
    sparkCard: { padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1 },
    sparkAnalytical: { backgroundColor: '#082f4940', borderColor: '#0369a140' },
    sparkAbstract: { backgroundColor: '#4c1d9540', borderColor: '#6d28d940' },
    sparkBadge: { marginBottom: 8, alignSelf: 'flex-start' },
    sparkBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
    sparkCardText: { color: '#e2e8f0', fontSize: 14, lineHeight: 22 },
});
