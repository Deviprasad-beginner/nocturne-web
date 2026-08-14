/**
 * Auth Screen — Login + Register with haptic feedback
 * Dark glassmorphism design matching the Nocturne web aesthetic
 */

import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
    Platform, ScrollView, ActivityIndicator, StyleSheet,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { haptics } from '../lib/haptics';

type Mode = 'login' | 'register';

export default function AuthScreen() {
    const { login, register } = useAuth();

    const [mode, setMode] = useState<Mode>('login');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const switchMode = () => {
        haptics.select();
        setMode(m => m === 'login' ? 'register' : 'login');
        setError('');
    };

    const handleSubmit = async () => {
        if (!identifier.trim() || !password.trim()) {
            haptics.error();
            setError('Email/Username and password are required.');
            return;
        }
        if (password.length < 6) {
            haptics.error();
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        setError('');
        haptics.medium();

        try {
            if (mode === 'login') {
                await login(identifier.trim(), password);
            } else {
                await register(identifier.trim(), password, displayName.trim() || identifier.trim());
            }
            haptics.success();
        } catch (e: any) {
            haptics.error();
            const msg =
                e?.response?.data?.message ||
                e?.response?.data?.error?.message ||
                e?.message ||
                'Something went wrong. Try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                {/* Brand */}
                <View style={styles.brand}>
                    <Text style={styles.moonGlyph}>🌙</Text>
                    <Text style={styles.brandName}>Nocturne</Text>
                    <Text style={styles.brandTagline}>Tonight is unwritten.</Text>
                </View>

                {/* Card */}
                <View style={styles.card}>
                    {/* Tab switcher */}
                    <View style={styles.tabs}>
                        {(['login', 'register'] as Mode[]).map((m) => (
                            <TouchableOpacity
                                key={m}
                                style={[styles.tab, mode === m && styles.tabActive]}
                                onPress={() => { setMode(m); haptics.select(); setError(''); }}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                                    {m === 'login' ? 'Sign In' : 'Create Account'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Fields */}
                    <View style={styles.fields}>
                        {mode === 'register' && (
                            <TextInput
                                style={styles.input}
                                placeholder="Display name (optional)"
                                placeholderTextColor="#4b5563"
                                value={displayName}
                                onChangeText={setDisplayName}
                                autoCapitalize="words"
                            />
                        )}
                        <TextInput
                            style={styles.input}
                            placeholder="Email or Username"
                            placeholderTextColor="#4b5563"
                            value={identifier}
                            onChangeText={setIdentifier}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#4b5563"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    {/* Error */}
                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading
                            ? <ActivityIndicator color="#fff" size="small" />
                            : <Text style={styles.submitText}>
                                {mode === 'login' ? 'Enter the Night →' : 'Begin Your Night →'}
                            </Text>
                        }
                    </TouchableOpacity>
                </View>

                {/* Guest note */}
                <Text style={styles.guestNote}>
                    Some features like Whispers and Night Circles are available without an account.
                </Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050508',
    },
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 48,
    },
    brand: {
        alignItems: 'center',
        marginBottom: 36,
    },
    moonGlyph: {
        fontSize: 40,
        marginBottom: 8,
    },
    brandName: {
        fontSize: 32,
        fontWeight: '700',
        color: '#e2e8f0',
        letterSpacing: 1,
    },
    brandTagline: {
        marginTop: 4,
        fontSize: 13,
        color: '#4b5563',
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: '#0d0d14',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        padding: 24,
        shadowColor: '#818cf8',
        shadowOpacity: 0.1,
        shadowRadius: 30,
        elevation: 8,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#0a0a12',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 9,
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: 'rgba(129,140,248,0.15)',
    },
    tabText: {
        color: '#4b5563',
        fontSize: 13,
        fontWeight: '500',
    },
    tabTextActive: {
        color: '#818cf8',
    },
    fields: {
        gap: 12,
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: '#e2e8f0',
        fontSize: 15,
        marginBottom: 4,
    },
    error: {
        color: '#fb7185',
        fontSize: 12,
        marginVertical: 8,
        textAlign: 'center',
    },
    submitBtn: {
        marginTop: 16,
        backgroundColor: '#4f46e5',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#818cf8',
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    submitBtnDisabled: {
        opacity: 0.6,
    },
    submitText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    guestNote: {
        marginTop: 24,
        textAlign: 'center',
        color: '#374151',
        fontSize: 11,
        lineHeight: 16,
    },
});
