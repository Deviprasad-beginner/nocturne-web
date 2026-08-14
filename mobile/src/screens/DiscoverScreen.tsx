/**
 * Music (Soothing Night) Screen
 * expo-av audio playback + mood categories + track list
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Audio } from 'expo-av';
import { Feather } from '@expo/vector-icons';
import api from '../lib/api';
import { haptics } from '../lib/haptics';
import { NightCard } from '../components/NightCard';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  coverArt?: string;
  mood?: string;
}

const MOODS = [
  { label: 'Chill', query: 'lofi,chill', color: '#818cf8' },
  { label: 'Sleep', query: 'sleep,ambient', color: '#60a5fa' },
  { label: 'Focus', query: 'meditation,relax', color: '#34d399' },
  { label: 'Nature', query: 'nature,ambient', color: '#86efac' },
];

export default function MusicScreen() {
  const [activeMood, setActiveMood] = useState(MOODS[0]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const { data: tracks = [], isLoading } = useQuery<Track[]>({
    queryKey: ['music', activeMood.query],
    queryFn: () => api.get(`/music/search?query=${encodeURIComponent(activeMood.query)}`).then(r => r.data ?? []),
    staleTime: 1000 * 60 * 15,
  });

  // Allow background audio
  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  const playTrack = async (track: Track) => {
    haptics.medium();
    try {
      // Stop any current track
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      if (currentTrack?.id === track.id && isPlaying) {
        setIsPlaying(false);
        setCurrentTrack(null);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.url },
        { shouldPlay: true, isLooping: false }
      );
      soundRef.current = sound;
      setCurrentTrack(track);
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          setCurrentTrack(null);
        }
      });
    } catch (err) {
      haptics.error();
      console.error('Playback error', err);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🎵 Soothing Night</Text>
          <Text style={styles.subtitle}>Music & Ambient Sounds</Text>
        </View>

        {/* Mood Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moods}>
          {MOODS.map((m) => (
            <TouchableOpacity
              key={m.query}
              style={[styles.moodChip, { borderColor: m.color + '60' },
              activeMood.query === m.query && { backgroundColor: m.color + '20' }
              ]}
              onPress={() => { haptics.select(); setActiveMood(m); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.moodLabel, { color: activeMood.query === m.query ? m.color : '#6b7280' }]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Now Playing bar */}
        {currentTrack && (
          <NightCard accent="#818cf8" style={styles.nowPlaying}>
            <View style={styles.npRow}>
              <Feather name={isPlaying ? 'pause-circle' : 'play-circle'} size={28} color="#818cf8" />
              <View style={styles.npInfo}>
                <Text style={styles.npTitle} numberOfLines={1}>{currentTrack.title}</Text>
                <Text style={styles.npArtist} numberOfLines={1}>{currentTrack.artist}</Text>
              </View>
              <TouchableOpacity onPress={() => playTrack(currentTrack)} activeOpacity={0.7}>
                <Feather name={isPlaying ? 'pause' : 'play'} size={20} color="#818cf8" />
              </TouchableOpacity>
            </View>
          </NightCard>
        )}

        {/* Track List */}
        <View style={styles.trackList}>
          {isLoading ? (
            <ActivityIndicator color="#818cf8" style={{ marginTop: 40 }} />
          ) : tracks.slice(0, 10).map((track) => {
            const isActive = currentTrack?.id === track.id;
            return (
              <TouchableOpacity
                key={track.id}
                style={[styles.trackRow, isActive && styles.trackRowActive]}
                onPress={() => playTrack(track)}
                activeOpacity={0.8}
              >
                {/* Art */}
                <View style={styles.trackArt}>
                  {track.coverArt
                    ? <Image source={{ uri: track.coverArt }} style={styles.trackImg} />
                    : <Feather name="music" size={18} color="#818cf8" />
                  }
                  {isActive && isPlaying && (
                    <View style={styles.playingBadge} />
                  )}
                </View>

                {/* Info */}
                <View style={styles.trackInfo}>
                  <Text style={[styles.trackTitle, isActive && { color: '#818cf8' }]} numberOfLines={1}>
                    {track.title}
                  </Text>
                  <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
                </View>

                <Feather
                  name={isActive && isPlaying ? 'pause' : 'play'}
                  size={16}
                  color={isActive ? '#818cf8' : '#374151'}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#050508' },
  scroll: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#e2e8f0' },
  subtitle: { fontSize: 12, color: '#4b5563', marginTop: 2, letterSpacing: 0.5 },
  moods: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  moodChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  moodLabel: { fontSize: 13, fontWeight: '500' },
  nowPlaying: { marginHorizontal: 16, marginBottom: 4 },
  npRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  npInfo: { flex: 1 },
  npTitle: { color: '#e2e8f0', fontSize: 14, fontWeight: '600' },
  npArtist: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  trackList: { paddingHorizontal: 16 },
  trackRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    gap: 12,
  },
  trackRowActive: { backgroundColor: 'rgba(129,140,248,0.05)', borderRadius: 10, paddingHorizontal: 8 },
  trackArt: {
    width: 44, height: 44, borderRadius: 8,
    backgroundColor: 'rgba(129,140,248,0.1)',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  trackImg: { width: '100%', height: '100%' },
  playingBadge: {
    position: 'absolute', bottom: 3, right: 3,
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#818cf8',
  },
  trackInfo: { flex: 1 },
  trackTitle: { color: '#e2e8f0', fontSize: 14, fontWeight: '500' },
  trackArtist: { color: '#4b5563', fontSize: 12, marginTop: 2 },
});
