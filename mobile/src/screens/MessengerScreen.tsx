/**
 * Moon Messenger Screen — anonymous 1:1 chat pairing
 * API: GET /messenger, POST /messenger, POST /messenger/:id/message
 */

import React, { useState, useRef, useEffect } from 'react';
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

interface ChatMessage {
    id: number;
    content: string;
    senderAlias: string;
    createdAt: string;
}

interface Conversation {
    id: number;
    status: string;
    partnerAlias: string;
    topic: string | null;
    createdAt: string;
}

const MOODS_FOR_MATCH = ['lonely', 'curious', 'philosophical', 'grateful', 'anxious'];

export default function MessengerScreen({ navigation }: any) {
    const qc = useQueryClient();
    const [activeChat, setActiveChat] = useState<Conversation | null>(null);
    const [message, setMessage] = useState('');
    const [selectedMood, setSelectedMood] = useState('curious');

    const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
        queryKey: ['messenger-convos'],
        queryFn: () => api.get('/messenger').then(r => r.data ?? []),
    });

    const { data: messages = [] } = useQuery<ChatMessage[]>({
        queryKey: ['messenger-messages', activeChat?.id],
        queryFn: () => api.get(`/messenger/${activeChat!.id}/messages`).then(r => r.data ?? []),
        enabled: !!activeChat,
        refetchInterval: 4000,
    });

    const matchMutation = useMutation({
        mutationFn: () => api.post('/messenger', { mood: selectedMood }),
        onSuccess: (res: any) => {
            haptics.success();
            const convo = res.data?.conversation ?? res.data;
            if (convo) setActiveChat(convo);
            qc.invalidateQueries({ queryKey: ['messenger-convos'] });
        },
        onError: () => haptics.error(),
    });

    const sendMutation = useMutation({
        mutationFn: (content: string) =>
            api.post(`/messenger/${activeChat!.id}/message`, { content }),
        onSuccess: () => {
            haptics.light();
            setMessage('');
            qc.invalidateQueries({ queryKey: ['messenger-messages', activeChat?.id] });
        },
        onError: () => haptics.error(),
    });

    // ── Active Chat View ──
    if (activeChat) {
        return (
            <SafeAreaView style={styles.safe} edges={['top']}>
                <View style={styles.chatHeader}>
                    <TouchableOpacity onPress={() => { haptics.light(); setActiveChat(null); }} activeOpacity={0.7}>
                        <Feather name="arrow-left" size={20} color="#818cf8" />
                    </TouchableOpacity>
                    <Feather name="moon" size={16} color="#fbbf24" style={{ marginLeft: 12 }} />
                    <Text style={styles.chatPartner}>{activeChat.partnerAlias}</Text>
                    <View style={[styles.statusDot, { backgroundColor: activeChat.status === 'active' ? '#34d399' : '#4b5563' }]} />
                </View>

                <FlatList
                    data={messages}
                    keyExtractor={(item: any) => String(item.id)}
                    contentContainerStyle={styles.messageList}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }: any) => (
                        <View style={styles.msgRow}>
                            <Text style={styles.msgAlias}>{item.senderAlias}</Text>
                            <Text style={styles.msgText}>{item.content}</Text>
                            <Text style={styles.msgTime}>
                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyChat}>
                            <Feather name="message-circle" size={32} color="#374151" />
                            <Text style={styles.emptyChatText}>Start the conversation...</Text>
                        </View>
                    }
                />

                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.chatInput}
                        placeholder="Send a message..."
                        placeholderTextColor="#374151"
                        value={message}
                        onChangeText={setMessage}
                        returnKeyType="send"
                        onSubmitEditing={() => {
                            if (message.trim()) sendMutation.mutate(message.trim());
                        }}
                    />
                    <TouchableOpacity
                        style={styles.sendBtn}
                        onPress={() => {
                            if (!message.trim()) return;
                            haptics.medium();
                            sendMutation.mutate(message.trim());
                        }}
                        activeOpacity={0.8}
                    >
                        <Feather name="send" size={16} color="#818cf8" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ── Lobby View ──
    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => { haptics.light(); navigation.goBack(); }} activeOpacity={0.7}>
                        <Feather name="arrow-left" size={20} color="#818cf8" />
                    </TouchableOpacity>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.title}>🌙 Moon Messenger</Text>
                        <Text style={styles.subtitle}>Anonymous 1-on-1 conversations under moonlight</Text>
                    </View>
                </View>

                {/* Match Card */}
                <NightCard accent="#fbbf2440" style={{ marginHorizontal: 16 }}>
                    <Text style={styles.cardTitle}>Find a Conversation Partner</Text>
                    <Text style={styles.cardDesc}>Choose your mood, and we'll match you with someone who feels the same way tonight.</Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginVertical: 12 }}>
                        {MOODS_FOR_MATCH.map(mood => (
                            <TouchableOpacity
                                key={mood}
                                style={[styles.moodChip, selectedMood === mood && styles.moodChipActive]}
                                onPress={() => { haptics.select(); setSelectedMood(mood); }}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.moodChipText, selectedMood === mood && { color: '#fbbf24' }]}>{mood}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <GlowButton
                        label={matchMutation.isPending ? 'Searching...' : '🌕 Find Someone'}
                        onPress={() => matchMutation.mutate()}
                        loading={matchMutation.isPending}
                        color="#4f46e5"
                        size="md"
                    />
                </NightCard>

                {/* Previous Conversations */}
                <Text style={styles.sectionLabel}>Recent Conversations</Text>
                {isLoading ? (
                    <ActivityIndicator color="#818cf8" style={{ marginTop: 30 }} />
                ) : conversations.length === 0 ? (
                    <Text style={styles.emptyText}>No conversations yet. The moon is waiting. 🌙</Text>
                ) : (
                    conversations.map(convo => (
                        <TouchableOpacity
                            key={convo.id}
                            activeOpacity={0.8}
                            onPress={() => { haptics.medium(); setActiveChat(convo); }}
                        >
                            <NightCard accent="#818cf830" style={{ marginHorizontal: 16 }}>
                                <View style={styles.convoRow}>
                                    <Feather name="moon" size={16} color="#fbbf24" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.convoPartner}>{convo.partnerAlias}</Text>
                                        {convo.topic && <Text style={styles.convoTopic}>{convo.topic}</Text>}
                                    </View>
                                    <View style={[styles.statusDot, { backgroundColor: convo.status === 'active' ? '#34d399' : '#4b5563' }]} />
                                </View>
                            </NightCard>
                        </TouchableOpacity>
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
    cardTitle: { color: '#e2e8f0', fontSize: 15, fontWeight: '600', marginBottom: 4 },
    cardDesc: { color: '#6b7280', fontSize: 12, lineHeight: 18 },
    moodChip: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    moodChipActive: { backgroundColor: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.4)' },
    moodChipText: { fontSize: 12, fontWeight: '500', color: '#6b7280', textTransform: 'capitalize' },
    sectionLabel: {
        fontSize: 10, color: '#4b5563', letterSpacing: 2, textTransform: 'uppercase',
        marginHorizontal: 20, marginBottom: 10, marginTop: 16,
    },
    emptyText: { color: '#374151', textAlign: 'center', marginVertical: 30, fontSize: 13, fontStyle: 'italic' },
    convoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    convoPartner: { color: '#e2e8f0', fontSize: 14, fontWeight: '600' },
    convoTopic: { color: '#6b7280', fontSize: 11, marginTop: 2 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    // Chat styles
    chatHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    chatPartner: { flex: 1, color: '#e2e8f0', fontSize: 16, fontWeight: '600' },
    messageList: { paddingHorizontal: 16, paddingBottom: 20 },
    msgRow: { marginTop: 14 },
    msgAlias: { color: '#fbbf24', fontSize: 10, fontWeight: '600', marginBottom: 2 },
    msgText: { color: '#d1d5db', fontSize: 14, lineHeight: 20 },
    msgTime: { color: '#374151', fontSize: 9, marginTop: 2 },
    emptyChat: { alignItems: 'center', paddingTop: 80, gap: 10 },
    emptyChatText: { color: '#374151', fontSize: 13, fontStyle: 'italic' },
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
    sendBtn: {
        width: 44, height: 44, borderRadius: 10,
        backgroundColor: 'rgba(129,140,248,0.15)',
        alignItems: 'center', justifyContent: 'center',
    },
});
