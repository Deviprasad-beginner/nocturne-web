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
        mutationFn: (content: string) => api.post('/thoughts', { 
            content, 
            thoughtType: 'text', 
            isPrivate: false 
        }),
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
                    placeholder="Write something you wouldn't say during the day..."
                    placeholderTextColor="#4b4b5f"
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
                    <Text style={styles.postBtnText}>Whisper →</Text>
                </TouchableOpacity>
            </View>

            {/* Feed */}
            {isLoading ? (
                <ActivityIndicator color="#8b6aff" style={{ marginTop: 40 }} />
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
                            tintColor="#8b6aff"
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
                                    <Feather name="heart" size={13} color="#8b6aff" />
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
    safe: { flex: 1, backgroundColor: '#07070a' },
    compose: {
        paddingHorizontal: 16, paddingVertical: 16,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
        gap: 12,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
        color: '#f0f0f5', fontSize: 15, minHeight: 80,
    },
    postBtn: {
        alignSelf: 'flex-start',
        paddingHorizontal: 20, paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#8b6aff',
        alignItems: 'center', justifyContent: 'center',
    },
    postBtnText: {
        color: '#fff', fontSize: 14, fontWeight: '600'
    },
    list: { paddingHorizontal: 16, paddingTop: 16 },
    card: {
        backgroundColor: 'rgba(18, 18, 25, 0.7)',
        borderRadius: 16, borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        padding: 16, marginBottom: 12,
    },
    content: { color: '#f0f0f5', fontSize: 15, lineHeight: 24, fontFamily: 'DM Sans' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
    time: { color: '#6b6b7f', fontSize: 11 },
    heartRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    hearts: { color: '#8b6aff', fontSize: 12 },
    empty: { color: '#6b6b7f', textAlign: 'center', marginTop: 60, fontSize: 14, fontStyle: 'italic' },
});
