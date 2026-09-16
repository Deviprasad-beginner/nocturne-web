/**
 * Nocturnal Lens — OCR scanner screen.
 *
 * Flow:
 *  1. User picks an image (camera capture or gallery)
 *  2. Image is displayed with a scan-line animation
 *  3. Extracted text is shown in an editable area
 *  4. User can share to Whispers, Café, or save to Vault
 *
 * Uses expo-image-picker (works on web, Android, iOS).
 * OCR is handled server-side via the existing /reads endpoint.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    Image, StyleSheet, Animated, ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import api from '../lib/api';
import { haptics } from '../lib/haptics';
import { Colors, Spacing, Radius, Typography } from '../lib/tokens';
import { FadeInView } from '../components/FadeInView';
import { GlowButton } from '../components/GlowButton';

type ScanState = 'idle' | 'scanning' | 'done' | 'error';

export default function ScannerScreen({ navigation }: any) {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [extractedText, setExtractedText] = useState('');
    const [scanState, setScanState] = useState<ScanState>('idle');
    const scanLineY = useRef(new Animated.Value(0)).current;

    // Scan-line animation — loops while scanning
    useEffect(() => {
        if (scanState !== 'scanning') return;

        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(scanLineY, { toValue: 1, duration: 1600, useNativeDriver: true }),
                Animated.timing(scanLineY, { toValue: 0, duration: 1600, useNativeDriver: true }),
            ]),
        );
        anim.start();
        return () => anim.stop();
    }, [scanState, scanLineY]);

    const pickImage = async (source: 'camera' | 'gallery') => {
        haptics.medium();

        const options: ImagePicker.ImagePickerOptions = {
            mediaTypes: ['images'],
            quality: 0.8,
            allowsEditing: true,
        };

        let result: ImagePicker.ImagePickerResult;
        if (source === 'camera') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') return;
            result = await ImagePicker.launchCameraAsync(options);
        } else {
            result = await ImagePicker.launchImageLibraryAsync(options);
        }

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
            setScanState('scanning');
            runOCR(result.assets[0].uri);
        }
    };

    const runOCR = async (uri: string) => {
        try {
            // Build multipart form for the server
            const formData = new FormData();
            const filename = uri.split('/').pop() ?? 'scan.jpg';
            formData.append('image', {
                uri,
                name: filename,
                type: 'image/jpeg',
            } as any);

            const res = await api.post('/reads/scan', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 30000,
            });

            const text = res.data?.text ?? res.data?.content ?? '';
            setExtractedText(text || 'Could not extract text from this image.');
            setScanState('done');
            haptics.success();
        } catch {
            // Fallback: show a placeholder if OCR endpoint isn't available
            setExtractedText('OCR service unavailable — paste or type your text manually.');
            setScanState('done');
        }
    };

    const shareWhisperMutation = useMutation({
        mutationFn: (content: string) => api.post('/whispers', { content }),
        onSuccess: () => {
            haptics.success();
            navigation.goBack();
        },
        onError: () => haptics.error(),
    });

    const shareCafeMutation = useMutation({
        mutationFn: (content: string) =>
            api.post('/cafe/conversations', { topic: 'Scanned Quote', initialMessage: content }),
        onSuccess: () => {
            haptics.success();
            navigation.goBack();
        },
        onError: () => haptics.error(),
    });

    const saveVaultMutation = useMutation({
        mutationFn: (content: string) =>
            api.post('/reads', { title: 'Scanned Note', content, contentType: 'text', intention: 'learn' }),
        onSuccess: () => {
            haptics.success();
            navigation.goBack();
        },
        onError: () => haptics.error(),
    });

    const reset = () => {
        setImageUri(null);
        setExtractedText('');
        setScanState('idle');
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => { haptics.light(); navigation.goBack(); }}
                    activeOpacity={0.7}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Feather name="x" size={22} color={Colors.textSecondary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nocturnal Lens</Text>
                <View style={{ width: 22 }} />
            </View>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Idle State — source picker */}
                {scanState === 'idle' && (
                    <FadeInView style={styles.idleContainer}>
                        <View style={styles.lensIcon}>
                            <Feather name="aperture" size={48} color={Colors.indigo} />
                        </View>
                        <Text style={styles.idleTitle}>Scan a page</Text>
                        <Text style={styles.idleDesc}>
                            Capture text from books, notes, or anything printed.{'\n'}
                            Share it as a whisper, café topic, or save to your vault.
                        </Text>

                        <View style={styles.sourceButtons}>
                            <TouchableOpacity
                                style={styles.sourceBtn}
                                onPress={() => pickImage('camera')}
                                activeOpacity={0.7}
                            >
                                <Feather name="camera" size={24} color={Colors.indigo} />
                                <Text style={styles.sourceBtnLabel}>Camera</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.sourceBtn}
                                onPress={() => pickImage('gallery')}
                                activeOpacity={0.7}
                            >
                                <Feather name="image" size={24} color={Colors.purple} />
                                <Text style={styles.sourceBtnLabel}>Gallery</Text>
                            </TouchableOpacity>
                        </View>
                    </FadeInView>
                )}

                {/* Scanning State */}
                {imageUri && scanState === 'scanning' && (
                    <FadeInView style={styles.scanContainer}>
                        <View style={styles.imageFrame}>
                            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
                            <Animated.View
                                style={[
                                    styles.scanLine,
                                    {
                                        transform: [{
                                            translateY: scanLineY.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, 240],
                                            }),
                                        }],
                                    },
                                ]}
                            />
                        </View>
                        <View style={styles.scanStatus}>
                            <ActivityIndicator color={Colors.indigo} size="small" />
                            <Text style={styles.scanStatusText}>Extracting text…</Text>
                        </View>
                    </FadeInView>
                )}

                {/* Done State — results + actions */}
                {scanState === 'done' && (
                    <FadeInView style={styles.resultContainer}>
                        {imageUri && (
                            <Image source={{ uri: imageUri }} style={styles.thumbnailImage} resizeMode="cover" />
                        )}

                        <Text style={styles.resultLabel}>Extracted Text</Text>
                        <TextInput
                            style={styles.resultInput}
                            value={extractedText}
                            onChangeText={setExtractedText}
                            multiline
                            textAlignVertical="top"
                            placeholderTextColor={Colors.placeholder}
                        />

                        {/* Share Actions */}
                        <Text style={styles.actionsLabel}>Share To</Text>
                        <View style={styles.actionsRow}>
                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => { haptics.medium(); shareWhisperMutation.mutate(extractedText); }}
                                activeOpacity={0.7}
                            >
                                <Feather name="wind" size={18} color={Colors.pink} />
                                <Text style={[styles.actionLabel, { color: Colors.pink }]}>Whisper</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => { haptics.medium(); shareCafeMutation.mutate(extractedText); }}
                                activeOpacity={0.7}
                            >
                                <Feather name="coffee" size={18} color={Colors.orange} />
                                <Text style={[styles.actionLabel, { color: Colors.orange }]}>Café</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => { haptics.medium(); saveVaultMutation.mutate(extractedText); }}
                                activeOpacity={0.7}
                            >
                                <Feather name="bookmark" size={18} color={Colors.indigo} />
                                <Text style={[styles.actionLabel, { color: Colors.indigo }]}>Vault</Text>
                            </TouchableOpacity>
                        </View>

                        <GlowButton
                            label="Scan Another"
                            onPress={reset}
                            color={Colors.surface2}
                            textColor={Colors.textSecondary}
                            size="sm"
                            style={{ marginTop: Spacing.lg }}
                        />
                    </FadeInView>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.bg },
    scroll: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
        borderBottomWidth: 1, borderBottomColor: Colors.border,
    },
    headerTitle: {
        ...Typography.subhead,
        color: Colors.text,
    },

    /* Idle */
    idleContainer: { alignItems: 'center', paddingTop: 60, paddingHorizontal: Spacing.xxxl },
    lensIcon: {
        width: 96, height: 96, borderRadius: 48,
        backgroundColor: Colors.surface,
        borderWidth: 1, borderColor: Colors.border,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: Spacing.xxl,
    },
    idleTitle: { ...Typography.headline, color: Colors.text, marginBottom: Spacing.sm },
    idleDesc: {
        ...Typography.body, color: Colors.textSecondary,
        textAlign: 'center', lineHeight: 22,
    },
    sourceButtons: {
        flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.xxxl,
    },
    sourceBtn: {
        width: 120, paddingVertical: Spacing.xxl,
        backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
        borderRadius: Radius.lg, alignItems: 'center', gap: Spacing.sm,
    },
    sourceBtnLabel: { ...Typography.caption, color: Colors.textSecondary },

    /* Scanning */
    scanContainer: { alignItems: 'center', paddingTop: Spacing.xxxl, paddingHorizontal: Spacing.xl },
    imageFrame: {
        width: 280, height: 280, borderRadius: Radius.lg,
        overflow: 'hidden', borderWidth: 1, borderColor: Colors.border,
        position: 'relative',
    },
    previewImage: { width: '100%', height: '100%' },
    scanLine: {
        position: 'absolute', left: 0, right: 0, height: 2,
        backgroundColor: Colors.indigo,
        shadowColor: Colors.indigo, shadowOpacity: 0.8, shadowRadius: 8,
    },
    scanStatus: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        marginTop: Spacing.xl,
    },
    scanStatusText: { ...Typography.caption, color: Colors.textSecondary },

    /* Results */
    resultContainer: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxl },
    thumbnailImage: {
        width: '100%', height: 160, borderRadius: Radius.lg,
        marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
    },
    resultLabel: { ...Typography.caption, color: Colors.textTertiary, marginBottom: Spacing.sm, letterSpacing: 1.5, textTransform: 'uppercase' as const },
    resultInput: {
        backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
        borderRadius: Radius.md, padding: Spacing.lg,
        color: Colors.text, ...Typography.body,
        minHeight: 140,
    },
    actionsLabel: {
        ...Typography.caption, color: Colors.textTertiary,
        marginTop: Spacing.xl, marginBottom: Spacing.md,
        letterSpacing: 1.5, textTransform: 'uppercase' as const,
    },
    actionsRow: { flexDirection: 'row', gap: Spacing.md },
    actionBtn: {
        flex: 1, paddingVertical: Spacing.lg,
        backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
        borderRadius: Radius.md, alignItems: 'center', gap: Spacing.xs,
    },
    actionLabel: { ...Typography.footnote },
});
