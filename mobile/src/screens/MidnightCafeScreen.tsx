import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import api from '../lib/api';
import { haptics } from '../lib/haptics';

export default function MidnightCafeScreen({ navigation }: any) {
    const qc = useQueryClient();
    const [topic, setTopic] = useState('');
    const [content, setContent] = useState('');
    const [activeReplyPost, setActiveReplyPost] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');

    const { data: posts = [], isLoading } = useQuery<any[]>({
        queryKey: ['cafe-posts'],
        queryFn: () => api.get('/cafe').then(r => r.data ?? []),
    });

    const { data: replies = [], isLoading: loadingReplies } = useQuery<any[]>({
        queryKey: ['cafe-replies', activeReplyPost],
        queryFn: () => api.get(`/cafe/${activeReplyPost}/replies`).then(r => r.data ?? []),
        enabled: !!activeReplyPost,
    });

    const createPostMutation = useMutation({
        mutationFn: (payload: { topic: string; content: string; category: string }) =>
            api.post('/cafe', payload),
        onSuccess: () => {
            haptics.success();
            setTopic('');
            setContent('');
            qc.invalidateQueries({ queryKey: ['cafe-posts'] });
        },
        onError: () => haptics.error(),
    });

    const createReplyMutation = useMutation({
        mutationFn: (payload: { cafeId: number; content: string }) =>
            api.post('/cafe/replies', payload),
        onSuccess: () => {
            haptics.success();
            setReplyContent('');
            qc.invalidateQueries({ queryKey: ['cafe-replies', activeReplyPost] });
            qc.invalidateQueries({ queryKey: ['cafe-posts'] });
        },
        onError: () => haptics.error(),
    });

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
                        <Feather name="arrow-left" size={24} color="#fcd34d" />
                    </TouchableOpacity>
                    <View style={styles.titleWrap}>
                        <Feather name="coffee" size={20} color="#fbbf24" style={{ marginRight: 8 }} />
                        <Text style={styles.title}>Midnight Café</Text>
                    </View>
                </View>

                <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                    {/* Create Post */}
                    <View style={styles.createCard}>
                        <Text style={styles.createCardTitle}>Share a Thought</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Topic..."
                            placeholderTextColor="#9ca3af"
                            value={topic}
                            onChangeText={setTopic}
                        />
                        <TextInput
                            style={[styles.input, { minHeight: 70 }]}
                            placeholder="What's on your mind?..."
                            placeholderTextColor="#9ca3af"
                            value={content}
                            onChangeText={setContent}
                            multiline
                            textAlignVertical="top"
                        />
                        <TouchableOpacity
                            style={[styles.btn, (!topic.trim() || !content.trim()) && { opacity: 0.5 }]}
                            onPress={() => {
                                if (topic.trim() && content.trim()) {
                                    haptics.medium();
                                    createPostMutation.mutate({ topic: topic.trim(), content: content.trim(), category: 'general' });
                                }
                            }}
                            disabled={!topic.trim() || !content.trim() || createPostMutation.isPending}
                        >
                            <Text style={styles.btnText}>Start Conversation</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Posts */}
                    {isLoading ? (
                        <ActivityIndicator color="#fbbf24" style={{ marginTop: 40 }} />
                    ) : posts.map((post: any) => (
                        <View key={post.id} style={styles.postCard}>
                            <View style={styles.postHeader}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{post.topic.charAt(0).toUpperCase()}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.topicText}>{post.topic}</Text>
                                    <Text style={styles.timeText}>{new Date(post.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                </View>
                            </View>
                            <Text style={styles.contentText}>{post.content}</Text>

                            <TouchableOpacity
                                style={styles.replyButton}
                                onPress={() => { haptics.light(); setActiveReplyPost(activeReplyPost === post.id ? null : post.id); }}
                            >
                                <Feather name="message-circle" size={14} color="#fcd34d" />
                                <Text style={styles.replyCountText}>{post.replies || 0} responses</Text>
                            </TouchableOpacity>

                            {activeReplyPost === post.id && (
                                <View style={styles.repliesSection}>
                                    {loadingReplies ? <ActivityIndicator size="small" color="#fbbf24" /> : replies.map((reply: any) => (
                                        <View key={reply.id} style={styles.replyItem}>
                                            <Text style={styles.replyContentText}>{reply.content}</Text>
                                        </View>
                                    ))}
                                    <View style={styles.replyInputRow}>
                                        <TextInput
                                            style={styles.replyInput}
                                            placeholder="Write a response..."
                                            placeholderTextColor="#9ca3af"
                                            value={replyContent}
                                            onChangeText={setReplyContent}
                                        />
                                        <TouchableOpacity
                                            style={styles.replySendBtn}
                                            onPress={() => {
                                                if (replyContent.trim()) {
                                                    haptics.medium();
                                                    createReplyMutation.mutate({ cafeId: post.id, content: replyContent.trim() });
                                                }
                                            }}
                                        >
                                            <Feather name="send" size={16} color="#451a03" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    ))}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#000000' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#271c19' },
    titleWrap: { flexDirection: 'row', alignItems: 'center', marginLeft: 16 },
    title: { fontSize: 24, fontWeight: '700', color: '#fef3c7' },
    list: { padding: 16 },
    createCard: { backgroundColor: '#451a0330', borderWidth: 1, borderColor: '#78350f50', borderRadius: 16, padding: 16, marginBottom: 24 },
    createCardTitle: { color: '#fde68a', fontSize: 16, fontWeight: '600', marginBottom: 12 },
    input: { backgroundColor: '#18181b', borderRadius: 8, padding: 12, color: '#e2e8f0', fontSize: 14, marginBottom: 8, borderWidth: 1, borderColor: '#27272a' },
    btn: { backgroundColor: '#b45309', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

    postCard: { backgroundColor: '#78350f10', borderWidth: 1, borderColor: '#78350f30', borderRadius: 16, padding: 16, marginBottom: 16 },
    postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#d97706', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    topicText: { color: '#fde68a', fontSize: 16, fontWeight: '700', textTransform: 'uppercase' },
    timeText: { color: '#9ca3af', fontSize: 12, marginTop: 2, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
    contentText: { color: '#d1d5db', fontSize: 15, lineHeight: 24, fontStyle: 'italic', borderLeftWidth: 2, borderLeftColor: '#78350f40', paddingLeft: 12, marginBottom: 16 },
    replyButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#78350f20', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#78350f40' },
    replyCountText: { color: '#fcd34d', fontSize: 12, fontWeight: '500', marginLeft: 6 },

    repliesSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#78350f20' },
    replyItem: { backgroundColor: '#18181b80', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#27272a' },
    replyContentText: { color: '#d1d5db', fontSize: 14 },
    replyInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    replyInput: { flex: 1, backgroundColor: '#18181b', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#e2e8f0', fontSize: 14, borderWidth: 1, borderColor: '#78350f40' },
    replySendBtn: { backgroundColor: '#fbbf24', width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
});
