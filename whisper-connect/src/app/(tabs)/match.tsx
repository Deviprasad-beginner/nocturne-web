import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, withRepeat,
  FadeInDown, FadeIn,
} from 'react-native-reanimated';
import { queueResonance, leaveResonanceQueue } from '@/lib/api';
import { haptics } from '@/lib/haptics';

const MOODS = [
  { id: 'lonely',    label: 'Lonely',    emoji: '🌙', color: '#7b9cff', bg: 'rgba(123,156,255,0.12)', border: 'rgba(123,156,255,0.35)', desc: 'Seeking a gentle presence' },
  { id: 'restless',  label: 'Restless',  emoji: '🌊', color: '#ff8c70', bg: 'rgba(255,140,112,0.12)', border: 'rgba(255,140,112,0.35)', desc: 'Can\'t slow your mind' },
  { id: 'nostalgic', label: 'Nostalgic', emoji: '🍂', color: '#c9a96e', bg: 'rgba(201,169,110,0.12)', border: 'rgba(201,169,110,0.35)', desc: 'Lost in the past' },
  { id: 'inspired',  label: 'Inspired',  emoji: '✨', color: '#70dca0', bg: 'rgba(112,220,160,0.12)', border: 'rgba(112,220,160,0.35)', desc: 'Something is lighting up' },
  { id: 'anxious',   label: 'Anxious',   emoji: '🫀', color: '#ff70b0', bg: 'rgba(255,112,176,0.12)', border: 'rgba(255,112,176,0.35)', desc: 'Heart is running fast' },
  { id: 'grateful',  label: 'Grateful',  emoji: '🌿', color: '#f5d97a', bg: 'rgba(245,217,122,0.12)', border: 'rgba(245,217,122,0.35)', desc: 'Warmth in the quiet' },
];

function MoodTile({ mood, selected, onPress }: { mood: typeof MOODS[0]; selected: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(selected ? 1.04 : scale.value, { damping: 14 }) }],
  }));

  return (
    <Animated.View style={[{ width: '47%' }, style]}>
      <TouchableOpacity
        onPress={() => { haptics.selection(); onPress(); }}
        onPressIn={() => { scale.value = 0.96; }}
        onPressOut={() => { scale.value = 1; }}
        style={{
          backgroundColor: selected ? mood.bg : 'rgba(10,10,10,0.9)',
          borderWidth: 1.5,
          borderColor: selected ? mood.border : 'rgba(178,158,255,0.10)',
          borderRadius: 20, padding: 18,
          minHeight: 110,
        }}
      >
        <Text style={{ fontSize: 28, marginBottom: 10 }}>{mood.emoji}</Text>
        <Text style={{ color: selected ? mood.color : '#f5f2ff', fontWeight: '700', fontSize: 15, marginBottom: 4 }}>{mood.label}</Text>
        <Text style={{ color: selected ? mood.color + 'aa' : '#636174', fontSize: 11, lineHeight: 16 }}>{mood.desc}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function RadarAnimation() {
  const scale1 = useSharedValue(0.5);
  const opacity1 = useSharedValue(1);
  const scale2 = useSharedValue(0.5);
  const opacity2 = useSharedValue(1);

  useEffect(() => {
    scale1.value = withRepeat(withTiming(2.5, { duration: 2500 }), -1, false);
    opacity1.value = withRepeat(withTiming(0, { duration: 2500 }), -1, false);

    setTimeout(() => {
      scale2.value = withRepeat(withTiming(2.5, { duration: 2500 }), -1, false);
      opacity2.value = withRepeat(withTiming(0, { duration: 2500 }), -1, false);
    }, 1250);
  }, [opacity1, opacity2, scale1, scale2]);

  const s1 = useAnimatedStyle(() => ({ transform: [{ scale: scale1.value }], opacity: opacity1.value }));
  const s2 = useAnimatedStyle(() => ({ transform: [{ scale: scale2.value }], opacity: opacity2.value }));

  return (
    <View style={{ width: 140, height: 140, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 32 }}>
      <Animated.View style={[{ position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: '#7958ff' }, s1]} />
      <Animated.View style={[{ position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: '#db83ff' }, s2]} />
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#7958ff', alignItems: 'center', justifyContent: 'center', shadowColor: '#7958ff', shadowOpacity: 0.6, shadowRadius: 20 }}>
        <Text style={{ fontSize: 24 }}>◎</Text>
      </View>
    </View>
  );
}

export default function MatchScreen() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [matchStatus, setMatchStatus] = useState<'idle' | 'searching' | 'matched' | 'fallback'>('idle');
  const [matchData, setMatchData] = useState<any>(null);
  const [countdown, setCountdown] = useState(45);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeMood = MOODS.find(m => m.id === selectedMood);

  const clearPolling = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
  };

  useEffect(() => clearPolling, []);

  const handleStartSearching = async () => {
    if (!selectedMood) { haptics.error(); return; }
    haptics.heavy();
    setMatchStatus('searching');
    setCountdown(45);
    setMatchData(null);
    clearPolling();

    try {
      const data = await queueResonance(selectedMood);
      if (data?.status === 'matched') {
        haptics.success();
        setMatchStatus('matched');
        setMatchData(data);
        return;
      }

      let timeLeft = 45;
      pollIntervalRef.current = setInterval(async () => {
        timeLeft -= 3;
        setCountdown(Math.max(0, timeLeft));

        if (timeLeft <= 0) {
          clearPolling();
          haptics.soft();
          setMatchStatus('fallback');
          return;
        }

        try {
          const pollData = await queueResonance(selectedMood);
          if (pollData?.status === 'matched') {
            clearPolling();
            haptics.success();
            setMatchStatus('matched');
            setMatchData(pollData);
          } else if (pollData?.status === 'fallback') {
            clearPolling();
            haptics.soft();
            setMatchStatus('fallback');
          }
        } catch {}
      }, 3000);
    } catch {
      setMatchStatus('idle');
      haptics.error();
    }
  };

  const handleReset = () => {
    haptics.soft();
    clearPolling();
    leaveResonanceQueue(); // remove from server-side queue
    setMatchStatus('idle');
    setMatchData(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 120 }}>
        
        <View style={{ marginBottom: 32 }}>
          <Text style={{ color: '#b9a7ff', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 6 }}>PSYCHOLOGICAL RESONANCE</Text>
          <Text style={{ color: '#f5f2ff', fontSize: 32, letterSpacing: -1, fontWeight: '300' }}>Find your</Text>
          <Text style={{ color: '#b9a7ff', fontSize: 32, letterSpacing: -1, fontStyle: 'italic' }}>people.</Text>
          {matchStatus === 'idle' && (
            <Text style={{ color: '#636174', fontSize: 13, lineHeight: 22, marginTop: 10 }}>
              How are you feeling right now? We&apos;ll find the minds resonating with yours tonight.
            </Text>
          )}
        </View>

        {matchStatus === 'idle' && (
          <Animated.View entering={FadeInDown.delay(80).springify()}>
            <Text style={{ color: '#636174', fontSize: 10, letterSpacing: 2, fontWeight: '700', marginBottom: 16 }}>SELECT YOUR STATE</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
              {MOODS.map(m => (
                <MoodTile key={m.id} mood={m} selected={selectedMood === m.id} onPress={() => setSelectedMood(m.id)} />
              ))}
            </View>

            <TouchableOpacity
              onPress={handleStartSearching}
              disabled={!selectedMood}
              style={{
                backgroundColor: selectedMood ? (activeMood?.color ?? '#7958ff') : 'rgba(25,25,43,0.5)',
                borderRadius: 16, paddingVertical: 18, alignItems: 'center',
                opacity: selectedMood ? 1 : 0.4,
              }}
            >
              <Text style={{ color: selectedMood ? '#000000' : '#636174', fontWeight: '800', fontSize: 15 }}>
                {selectedMood ? `Tune In & Seek Match (45s) →` : 'Select a mood first'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {matchStatus === 'searching' && (
          <Animated.View entering={FadeIn} style={{ alignItems: 'center', backgroundColor: 'rgba(5,5,5,0.95)', borderWidth: 1, borderColor: '#7958ff55', borderRadius: 24, padding: 32 }}>
            <RadarAnimation />
            <Text style={{ color: '#f5f2ff', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Scanning Frequencies...</Text>
            <Text style={{ color: '#636174', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>Listening for a soul aligned with your {activeMood?.label} wavelength.</Text>
            
            <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 24 }}>
              <Text style={{ color: '#b9a7ff', fontSize: 12, fontWeight: '700', letterSpacing: 1 }}>WINDOW CLOSES IN: {countdown}s</Text>
            </View>

            <TouchableOpacity onPress={handleReset}>
              <Text style={{ color: '#636174', fontSize: 13 }}>Cancel Frequency Scan</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {matchStatus === 'matched' && matchData && (
          <Animated.View entering={FadeInDown.springify()} style={{ backgroundColor: 'rgba(5,5,5,0.95)', borderWidth: 1, borderColor: 'rgba(112,220,160,0.4)', borderRadius: 24, padding: 32 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: '#70dca0', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 }}>✦ HARMONIC RESONANCE ESTABLISHED</Text>
            </View>
            <Text style={{ color: '#f5f2ff', fontSize: 24, fontWeight: '700', marginBottom: 8 }}>A peer has answered.</Text>
            <Text style={{ color: '#636174', fontSize: 13, marginBottom: 24 }}>You are linked anonymously across the nocturnal continuum.</Text>

            <View style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: '#636174', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 }}>MATCHED PEER</Text>
                <Text style={{ color: '#f5f2ff', fontSize: 16, fontWeight: '700' }}>{matchData.peer?.anonymousHandle || 'WanderingSoul'}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#636174', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 }}>THEIR STATE</Text>
                <Text style={{ color: '#70dca0', fontSize: 14, fontWeight: '700' }}>{matchData.peer?.mood || 'Harmonized'}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => haptics.medium()}
              style={{ backgroundColor: '#70dca0', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 16 }}
            >
              <Text style={{ color: '#000000', fontWeight: '800', fontSize: 14 }}>Open Private Resonance Chat</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleReset} style={{ alignItems: 'center' }}>
              <Text style={{ color: '#636174', fontSize: 14 }}>Done</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {matchStatus === 'fallback' && (
          <Animated.View entering={FadeInDown.springify()} style={{ alignItems: 'center', backgroundColor: 'rgba(5,5,5,0.95)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 24, padding: 32 }}>
            <Text style={{ fontSize: 40, marginBottom: 16 }}>🧭</Text>
            <Text style={{ color: '#f5f2ff', fontSize: 20, fontWeight: '700', marginBottom: 8 }}>The Night is Calm</Text>
            <Text style={{ color: '#636174', fontSize: 13, textAlign: 'center', lineHeight: 22, marginBottom: 24 }}>
              No matching frequencies were awake right now. Your energy has dispersed peacefully into the quiet atmosphere.
            </Text>
            <TouchableOpacity
              onPress={handleStartSearching}
              style={{ backgroundColor: '#7958ff', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 32, marginTop: 24, marginBottom: 16 }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Search Again</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleReset}>
              <Text style={{ color: '#636174', fontSize: 13 }}>Return to Frequencies</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

      </ScrollView>
    </View>
  );
}
