/**
 * Night Thoughts Screen — infinite scroll feed with heart haptics
 */

import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import api from '../lib/api';
import { haptics } from '../lib/haptics';

export default function ThoughtsScreen() {
    const qc = useQueryClient();
    const [thought, setThought] = useState('');

    const { data: thoughts = [], isLoading, refetch } = useQuery<any[]>({
        queryKey: ['thoughts'],
        queryFn: () => api.get('/thoughts').then(r => r.data ?? []),
    });

    const postMutation = useMutation({
        mutationFn: (content: string) => api.post('/thoughts', { content, isAnonymous: true }),
        onSuccess: () => {
            haptics.success();
            setThought('');
            qc.invalidateQueries({ queryKey: ['thoughts'] });
        },
        onError: () => haptics.error(),
    });

    const heartMutation = useMutation({
        mutationFn: (id: number) => api.post(`/thoughts/${id}/heart`),
        onSuccess: () => {
            haptics.light();
            qc.invalidateQueries({ queryKey: ['thoughts'] });
        },
    });

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Compose bar */}
            <View style={styles.compose}>
                <TextInput
                    style={styles.input}
                    placeholder="What's on your mind tonight?"
                    placeholderTextColor="#374151"
                    value={thought}
                    onChangeText={setThought}
                    multiline
                />
                <TouchableOpacity
                    style={styles.postBtn}
                    onPress={() => {
                        if (!thought.trim()) { haptics.warning(); return; }
                        haptics.medium();
                        postMutation.mutate(thought.trim());
                    }}
                    activeOpacity={0.8}
                >
                    <Feather name="zap" size={16} color="#fb7185" />
                </TouchableOpacity>
            </View>

            {/* Feed */}
            {isLoading ? (
                <ActivityIndicator color="#818cf8" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={thoughts}
                    keyExtractor={(item: any) => String(item.id)}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={() => { haptics.light(); refetch(); }}
                            tintColor="#818cf8"
                        />
                    }
                    renderItem={({ item }: any) => (
                        <View style={styles.card}>
                            <Text style={styles.content}>{item.content}</Text>
                            <View style={styles.footer}>
                                <Text style={styles.time}>
                                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                                </Text>
                                <TouchableOpacity
                                    style={styles.heartRow}
                                    onPress={() => heartMutation.mutate(item.id)}
                                    activeOpacity={0.7}
                                >
                                    <Feather name="heart" size={13} color="#fb7185" />
                                    <Text style={styles.hearts}>{item.hearts || 0}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.empty}>The void is silent tonight.</Text>
                    }
                    ListFooterComponent={<View style={{ height: 100 }} />}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#050508' },
    compose: {
        flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
        color: '#e2e8f0', fontSize: 14, maxHeight: 80,
    },
    postBtn: {
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: 'rgba(251,113,133,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    list: { paddingHorizontal: 16, paddingTop: 8 },
    card: {
        backgroundColor: '#0d0d14',
        borderRadius: 14, borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        padding: 14, marginBottom: 10,
    },
    content: { color: '#d1d5db', fontSize: 14, lineHeight: 22 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    time: { color: '#4b5563', fontSize: 10 },
    heartRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    hearts: { color: '#fb7185', fontSize: 12 },
    empty: { color: '#374151', textAlign: 'center', marginTop: 60, fontSize: 14, fontStyle: 'italic' },
});
