/**
 * Settings Screen — per-service toggles, account actions.
 * Glassmorphic card design with animated section reveals.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity,
  Animated, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { haptics } from '../lib/haptics';
import { Colors, Spacing, Radius, Typography, Springs } from '../lib/tokens';
import { FadeInView } from '../components/FadeInView';
import { useNavigation } from '@react-navigation/native';

// ── Service Setting Definitions ─────────────────────────────────────────────

interface SettingDef {
  key: string;
  label: string;
  type: 'toggle';
}

interface ServiceDef {
  id: string;
  label: string;
  icon: string;
  color: string;
  settings: SettingDef[];
}

const SERVICES: ServiceDef[] = [
  {
    id: 'diaries', label: 'Night Diaries', icon: 'book', color: Colors.amber,
    settings: [
      { key: 'diariesReminder', label: 'Nightly diary reminder', type: 'toggle' },
      { key: 'diariesPrivate', label: 'Keep diaries private by default', type: 'toggle' },
    ],
  },
  {
    id: 'whispers', label: 'Whispers', icon: 'wind', color: Colors.purple,
    settings: [
      { key: 'whispersAnon', label: 'Post anonymously by default', type: 'toggle' },
      { key: 'whispersReplyNotif', label: 'Notify me on replies', type: 'toggle' },
    ],
  },
  {
    id: 'cafe', label: 'Midnight Café', icon: 'coffee', color: Colors.orange,
    settings: [
      { key: 'cafeAutoJoin', label: 'Auto-join nightly discussion', type: 'toggle' },
      { key: 'cafeNotif', label: 'Notify new topics', type: 'toggle' },
    ],
  },
  {
    id: 'maze', label: 'Mind Maze', icon: 'cpu', color: Colors.cyan,
    settings: [
      { key: 'mazeStreak', label: 'Streak reminders', type: 'toggle' },
      { key: 'mazeShowSolved', label: 'Show solved in profile', type: 'toggle' },
    ],
  },
  {
    id: 'circles', label: 'Night Circles', icon: 'users', color: Colors.green,
    settings: [
      { key: 'circlesNotif', label: 'Circle activity notifications', type: 'toggle' },
      { key: 'circlesDiscoverable', label: 'Make circles discoverable', type: 'toggle' },
    ],
  },
  {
    id: 'messenger', label: 'Moon Messenger', icon: 'message-circle', color: Colors.blue,
    settings: [
      { key: 'messengerPairing', label: 'Opt into random pairing', type: 'toggle' },
      { key: 'messengerReadReceipts', label: 'Send read receipts', type: 'toggle' },
    ],
  },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [values, setValues] = useState<Record<string, boolean>>({});
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const toggle = (key: string) => {
    haptics.light();
    setValues(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    haptics.heavy();
    Alert.alert('Sign Out', 'Are you sure you want to leave?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => { await logout(); },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    haptics.heavy();
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your data will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Account Info */}
        <FadeInView delay={0}>
          <View style={styles.card}>
            <View style={styles.accountRow}>
              <View style={styles.avatarSmall}>
                <Text style={styles.avatarLetter}>
                  {(user?.displayName || user?.username || 'U')[0].toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.accountName}>{user?.displayName || user?.username}</Text>
                <Text style={styles.accountEmail}>{user?.email || 'No email'}</Text>
              </View>
            </View>
          </View>
        </FadeInView>

        {/* Service Settings */}
        <Text style={styles.sectionLabel}>SERVICE PREFERENCES</Text>
        {SERVICES.map((service, idx) => (
          <FadeInView key={service.id} delay={100 + idx * 60}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                haptics.light();
                setExpandedService(prev => prev === service.id ? null : service.id);
              }}
              activeOpacity={0.7}
            >
              {/* Service header */}
              <View style={styles.serviceHeader}>
                <View style={[styles.serviceIcon, { backgroundColor: service.color + '15' }]}>
                  <Feather name={service.icon as any} size={16} color={service.color} />
                </View>
                <Text style={styles.serviceLabel}>{service.label}</Text>
                <Feather
                  name={expandedService === service.id ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={Colors.textTertiary}
                />
              </View>

              {/* Expanded toggles */}
              {expandedService === service.id && (
                <View style={styles.toggleGroup}>
                  {service.settings.map(s => (
                    <View key={s.key} style={styles.toggleRow}>
                      <Text style={styles.toggleLabel}>{s.label}</Text>
                      <Switch
                        value={!!values[s.key]}
                        onValueChange={() => toggle(s.key)}
                        trackColor={{ false: Colors.surface2, true: Colors.indigo + '60' }}
                        thumbColor={values[s.key] ? Colors.indigo : Colors.textTertiary}
                      />
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          </FadeInView>
        ))}

        {/* App Info */}
        <Text style={styles.sectionLabel}>APP</Text>
        <FadeInView delay={500}>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => Linking.openURL('https://nocturne.app/privacy')}
            >
              <Feather name="shield" size={16} color={Colors.textSecondary} />
              <Text style={styles.menuLabel}>Privacy Policy</Text>
              <Feather name="external-link" size={14} color={Colors.textTertiary} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => Linking.openURL('https://nocturne.app/terms')}
            >
              <Feather name="file-text" size={16} color={Colors.textSecondary} />
              <Text style={styles.menuLabel}>Terms of Service</Text>
              <Feather name="external-link" size={14} color={Colors.textTertiary} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <View style={styles.menuRow}>
              <Feather name="info" size={16} color={Colors.textSecondary} />
              <Text style={styles.menuLabel}>Version</Text>
              <Text style={styles.menuValue}>1.0.0</Text>
            </View>
          </View>
        </FadeInView>

        {/* Danger Zone */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <FadeInView delay={600}>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuRow} onPress={handleLogout}>
              <Feather name="log-out" size={16} color={Colors.pink} />
              <Text style={[styles.menuLabel, { color: Colors.pink }]}>Sign Out</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuRow} onPress={handleDeleteAccount}>
              <Feather name="trash-2" size={16} color={Colors.red} />
              <Text style={[styles.menuLabel, { color: Colors.red }]}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </FadeInView>

        <View style={{ height: 120 }} />
      </ScrollView>
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

  card: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg,
  },
  sectionLabel: {
    ...Typography.footnote, color: Colors.textTertiary,
    letterSpacing: 2, textTransform: 'uppercase',
    marginHorizontal: Spacing.xl, marginTop: Spacing.lg, marginBottom: Spacing.md,
  },

  accountRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatarSmall: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.indigo + '20', borderWidth: 1, borderColor: Colors.indigo,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarLetter: { color: Colors.indigo, fontSize: 18, fontWeight: '700' },
  accountName: { ...Typography.subhead, color: Colors.text },
  accountEmail: { ...Typography.caption, color: Colors.textTertiary, marginTop: 2 },

  serviceHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  serviceIcon: {
    width: 32, height: 32, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  serviceLabel: { ...Typography.subhead, color: Colors.text, flex: 1 },

  toggleGroup: { marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  toggleLabel: { ...Typography.body, color: Colors.textSecondary, flex: 1, marginRight: Spacing.md },

  menuRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  menuLabel: { ...Typography.body, color: Colors.textSecondary, flex: 1 },
  menuValue: { ...Typography.caption, color: Colors.textTertiary },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.xs },
});
