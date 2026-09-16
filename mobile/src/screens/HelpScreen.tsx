/**
 * Help Screen — FAQ accordion, support ticket form, and contact info.
 * Adapted from web help page.
 */

import React, { useState } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity,
    Alert, Linking, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { haptics } from '../lib/haptics';
import { Colors, Spacing, Radius, Typography } from '../lib/tokens';
import { FadeInView } from '../components/FadeInView';
import { AnimatedCard } from '../components/AnimatedCard';

// ── FAQ Data ─────────────────────────────────────────────────────────────────

interface FAQ {
    question: string;
    answer: string;
    category: string;
}

const FAQS: FAQ[] = [
    {
        question: 'What is Nocturne?',
        answer: 'Nocturne is a social sanctuary designed for night owls. It provides a calm, atmospheric space for deep conversations, anonymous whispers, collaborative reading, and introspective activities — all during the hours when the world sleeps.',
        category: 'General',
    },
    {
        question: 'What are Night Thoughts?',
        answer: 'Night Thoughts are ephemeral reflections that expire at sunrise. Think of them as fleeting moments captured in the dark — confessions, dreams, wonders, or rants that disappear with the morning light.',
        category: 'Features',
    },
    {
        question: 'How do Night Circles work?',
        answer: 'Night Circles are mood-based group spaces where you\'re matched with others feeling similar emotions. Choose your mood, select how you want to participate (silent, listener, or speaker), and join a circle.',
        category: 'Features',
    },
    {
        question: 'Are Whispers really anonymous?',
        answer: 'Yes. Whispers are completely anonymous — no usernames, no profile photos. Only the emotion and content of your whisper are visible to others.',
        category: 'Privacy',
    },
    {
        question: 'How do I delete my account?',
        answer: 'Go to Settings → Account → Delete Account. This action is permanent and will remove all your data, diary entries, and activity history.',
        category: 'Account',
    },
    {
        question: 'Is my data encrypted?',
        answer: 'Yes. All data is encrypted in transit (TLS) and at rest. Your diary entries and private messages use additional encryption layers for extra privacy.',
        category: 'Privacy',
    },
    {
        question: 'How does Mind Maze scoring work?',
        answer: 'Mind Maze uses an ELO-inspired scoring system. Correct answers increase your score based on difficulty, and streaks give bonus multipliers. Compete against yourself or the community.',
        category: 'Features',
    },
    {
        question: 'Can I use Nocturne during the day?',
        answer: 'Absolutely! While Nocturne is designed with night owls in mind, all features are available 24/7. Some features like Night Thoughts have sunrise-based expiry, but you can use the app anytime.',
        category: 'General',
    },
];

const CATEGORIES = ['All', ...new Set(FAQS.map(f => f.category))];

// ── Component ──────────────────────────────────────────────────────────────────

export default function HelpScreen() {
    const navigation = useNavigation();
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Support form
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [showForm, setShowForm] = useState(false);

    const filteredFaqs = FAQS.filter(f => {
        const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
        const matchesSearch = !searchQuery ||
            f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleSubmitTicket = () => {
        if (!subject.trim() || !message.trim()) {
            Alert.alert('Missing Info', 'Please fill in both subject and message.');
            return;
        }
        haptics.medium();
        Alert.alert('Ticket Submitted', 'We\'ll get back to you within 24 hours. Thank you! 🌙');
        setSubject('');
        setMessage('');
        setShowForm(false);
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={20} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 32 }} />
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

                    {/* Quick Actions */}
                    <FadeInView delay={0}>
                        <View style={styles.quickActions}>
                            <TouchableOpacity
                                style={styles.quickCard}
                                onPress={() => Linking.openURL('mailto:support@nocturne.app')}
                            >
                                <View style={[styles.quickIcon, { backgroundColor: Colors.blue + '15' }]}>
                                    <Feather name="mail" size={20} color={Colors.blue} />
                                </View>
                                <Text style={styles.quickLabel}>Email Us</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.quickCard}
                                onPress={() => { haptics.select(); setShowForm(!showForm); }}
                            >
                                <View style={[styles.quickIcon, { backgroundColor: Colors.green + '15' }]}>
                                    <Feather name="message-circle" size={20} color={Colors.green} />
                                </View>
                                <Text style={styles.quickLabel}>Submit Ticket</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.quickCard}
                                onPress={() => Linking.openURL('https://nocturne.app/docs')}
                            >
                                <View style={[styles.quickIcon, { backgroundColor: Colors.purple + '15' }]}>
                                    <Feather name="book-open" size={20} color={Colors.purple} />
                                </View>
                                <Text style={styles.quickLabel}>Docs</Text>
                            </TouchableOpacity>
                        </View>
                    </FadeInView>

                    {/* Support Form */}
                    {showForm && (
                        <FadeInView delay={0}>
                            <View style={styles.formCard}>
                                <Text style={styles.formTitle}>Submit a Support Ticket</Text>
                                <TextInput
                                    style={styles.formInput}
                                    placeholder="Subject"
                                    placeholderTextColor={Colors.placeholder}
                                    value={subject}
                                    onChangeText={setSubject}
                                />
                                <TextInput
                                    style={[styles.formInput, { minHeight: 100, textAlignVertical: 'top' }]}
                                    placeholder="Describe your issue..."
                                    placeholderTextColor={Colors.placeholder}
                                    multiline
                                    value={message}
                                    onChangeText={setMessage}
                                />
                                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitTicket}>
                                    <Feather name="send" size={14} color={Colors.text} />
                                    <Text style={styles.submitText}>Submit</Text>
                                </TouchableOpacity>
                            </View>
                        </FadeInView>
                    )}

                    {/* FAQ Section */}
                    <Text style={styles.sectionLabel}>FREQUENTLY ASKED QUESTIONS</Text>

                    {/* Search */}
                    <FadeInView delay={100}>
                        <View style={styles.searchWrap}>
                            <Feather name="search" size={16} color={Colors.textTertiary} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search questions..."
                                placeholderTextColor={Colors.placeholder}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Feather name="x" size={16} color={Colors.textTertiary} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </FadeInView>

                    {/* Category Chips */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
                        {CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
                                onPress={() => { haptics.light(); setSelectedCategory(cat); }}
                            >
                                <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* FAQ Cards */}
                    {filteredFaqs.map((faq, idx) => (
                        <AnimatedCard key={idx} index={idx} style={styles.faqCard}>
                            <TouchableOpacity
                                onPress={() => {
                                    haptics.light();
                                    setExpandedFaq(expandedFaq === idx ? null : idx);
                                }}
                                activeOpacity={0.7}
                            >
                                <View style={styles.faqHeader}>
                                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                                    <Feather
                                        name={expandedFaq === idx ? 'chevron-up' : 'chevron-down'}
                                        size={16}
                                        color={Colors.textTertiary}
                                    />
                                </View>
                                {expandedFaq === idx && (
                                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                                )}
                            </TouchableOpacity>
                            <View style={styles.catBadge}>
                                <Text style={styles.catBadgeText}>{faq.category}</Text>
                            </View>
                        </AnimatedCard>
                    ))}

                    {filteredFaqs.length === 0 && (
                        <FadeInView delay={0}>
                            <View style={styles.emptyState}>
                                <Feather name="help-circle" size={40} color={Colors.textTertiary} />
                                <Text style={styles.emptyText}>No questions match your search</Text>
                            </View>
                        </FadeInView>
                    )}

                    {/* App Info Footer */}
                    <FadeInView delay={300}>
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Nocturne v1.0.0</Text>
                            <Text style={styles.footerText}>Made with 🌙 for night owls</Text>
                        </View>
                    </FadeInView>

                    <View style={{ height: 120 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.bg },
    scroll: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    },
    backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { ...Typography.headline, color: Colors.text },

    quickActions: {
        flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.md,
        marginBottom: Spacing.lg,
    },
    quickCard: {
        flex: 1, alignItems: 'center', gap: Spacing.sm,
        padding: Spacing.lg, backgroundColor: Colors.surface,
        borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border,
    },
    quickIcon: {
        width: 44, height: 44, borderRadius: 22,
        alignItems: 'center', justifyContent: 'center',
    },
    quickLabel: { ...Typography.caption, color: Colors.text },

    formCard: {
        marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
        backgroundColor: Colors.surface, borderRadius: Radius.lg,
        borderWidth: 1, borderColor: Colors.green + '30', padding: Spacing.lg, gap: Spacing.md,
    },
    formTitle: { ...Typography.subhead, color: Colors.text },
    formInput: {
        ...Typography.body, color: Colors.text,
        backgroundColor: Colors.surface2, borderRadius: Radius.md,
        padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
    },
    submitBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
        backgroundColor: Colors.green + '20', paddingVertical: Spacing.md,
        borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.green + '40',
    },
    submitText: { ...Typography.subhead, color: Colors.text },

    sectionLabel: {
        ...Typography.footnote, color: Colors.textTertiary,
        letterSpacing: 2, textTransform: 'uppercase',
        marginHorizontal: Spacing.xl, marginBottom: Spacing.md,
    },

    searchWrap: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
        backgroundColor: Colors.surface, borderRadius: Radius.md,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
        borderWidth: 1, borderColor: Colors.border,
    },
    searchInput: { ...Typography.body, color: Colors.text, flex: 1 },

    catRow: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
    catChip: {
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs,
        borderRadius: Radius.full, backgroundColor: Colors.surface,
        borderWidth: 1, borderColor: Colors.border, marginRight: Spacing.sm,
    },
    catChipActive: { backgroundColor: Colors.indigo + '20', borderColor: Colors.indigo + '60' },
    catText: { ...Typography.caption, color: Colors.textTertiary },
    catTextActive: { color: Colors.indigo },

    faqCard: { marginHorizontal: Spacing.lg },
    faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    faqQuestion: { ...Typography.subhead, color: Colors.text, flex: 1, marginRight: Spacing.sm },
    faqAnswer: {
        ...Typography.body, color: Colors.textSecondary,
        marginTop: Spacing.md, lineHeight: 22,
    },
    catBadge: {
        alignSelf: 'flex-start', marginTop: Spacing.sm,
        paddingHorizontal: Spacing.sm, paddingVertical: 2,
        borderRadius: Radius.full, backgroundColor: Colors.surface2,
    },
    catBadgeText: { ...Typography.footnote, color: Colors.textTertiary },

    emptyState: { alignItems: 'center', paddingTop: 60, gap: Spacing.md },
    emptyText: { ...Typography.body, color: Colors.textTertiary },

    footer: { alignItems: 'center', paddingVertical: Spacing.xxxl, gap: Spacing.xs },
    footerText: { ...Typography.footnote, color: Colors.textTertiary },
});
