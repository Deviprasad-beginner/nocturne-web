import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withRepeat,
  withTiming, withSequence, FadeInDown, FadeIn,
} from 'react-native-reanimated';
import { postWhisper, fetchNightCircles } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { haptics } from '@/lib/haptics';
import { router } from 'expo-router';

const MOODS = [
  { id: 'lonely',    label: 'Lonely',    color: '#7b9cff', bg: 'rgba(123,156,255,0.12)' },
  { id: 'restless',  label: 'Restless',  color: '#ff8c70', bg: 'rgba(255,140,112,0.12)' },
  { id: 'nostalgic', label: 'Nostalgic', color: '#c9a96e', bg: 'rgba(201,169,110,0.12)' },
  { id: 'inspired',  label: 'Inspired',  color: '#70dca0', bg: 'rgba(112,220,160,0.12)' },
  { id: 'anxious',   label: 'Anxious',   color: '#ff70b0', bg: 'rgba(255,112,176,0.12)' },
  { id: 'grateful',  label: 'Grateful',  color: '#f5d97a', bg: 'rgba(245,217,122,0.12)' },
];

const MODES = [
  { id: 'private',   icon: '◉', title: 'Only me',           desc: 'Keep it completely private' },
  { id: 'community', icon: '◌', title: 'Night community',    desc: 'Share anonymously with everyone' },
  { id: 'resonance', icon: '✦', title: 'Find my resonance',  desc: 'Let Nocturne find similar minds' },
];

function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
      setTime(`${h}:${m} ${ampm}`);
    };
    update();
    const t = setInterval(update, 10000);
    return () => clearInterval(t);
  }, []);
  return <Text style={{ color: '#636174', fontSize: 11, letterSpacing: 2 }}>{time} · NIGHT MODE</Text>;
}

function Toast({ message, visible }: { message: string; visible: boolean }) {
  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);
  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 16 });
      opacity.value = withTiming(1, { duration: 200 });
      const t = setTimeout(() => {
        translateY.value = withTiming(80, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 });
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [visible, message, opacity, translateY]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));
  return (
    <Animated.View style={[{
      position: 'absolute', bottom: 90, left: 24, right: 24, zIndex: 100,
      backgroundColor: '#1a1830', borderRadius: 16,
      borderWidth: 1, borderColor: 'rgba(121,88,255,0.35)',
      padding: 16, alignItems: 'center',
      shadowColor: '#7958ff', shadowOpacity: 0.3, shadowRadius: 20,
    }, style]}>
      <Text style={{ color: '#b9a7ff', fontWeight: '600', fontSize: 14 }}>{message}</Text>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const [whisper, setWhisper] = useState('');
  const [mode, setMode] = useState('private');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [rooms, setRooms] = useState<any[]>([]);
  const [focused, setFocused] = useState(false);
  const { user } = useAuth();

  const composerScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  const composerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: composerScale.value }],
    shadowOpacity: glowOpacity.value,
  }));

  useEffect(() => {
    fetchNightCircles().then(setRooms).catch(console.error);
    // Gentle idle pulse on glow
    // eslint-disable-next-line react-hooks/immutability
    glowOpacity.value = withRepeat(
      withSequence(withTiming(0.6, { duration: 2200 }), withTiming(0.2, { duration: 2200 })),
      -1, true
    );
  }, [glowOpacity]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    composerScale.value = withSpring(focused ? 1.01 : 1, { damping: 18 });
  }, [focused, composerScale]);

  const showToast = (msg: string) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  const handleSubmit = async () => {
    if (!whisper.trim()) {
      haptics.error();
      showToast('Write something before whispering.');
      return;
    }
    if (!selectedMood) {
      haptics.error();
      showToast('Please select a mood.');
      return;
    }
    haptics.medium();
    setIsSubmitting(true);
    
    const visibilityMap: Record<string, 'public' | 'private' | 'resonance'> = {
      'private': 'private',
      'community': 'public',
      'resonance': 'resonance'
    };
    
    const result = await postWhisper(whisper, visibilityMap[mode], selectedMood);
    setIsSubmitting(false);
    if (result) {
      haptics.success();
      setWhisper('');
      setSelectedMood(null);
      showToast(mode === 'private' ? '✦ Whisper saved privately.' : '☾ Your whisper is live tonight.');
    } else {
      haptics.error();
      showToast('Could not send whisper. Try again.');
    }
  };

  const avatarLetter = (user?.displayName || user?.username || 'U')[0].toUpperCase();


  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
          <LiveClock />
          <TouchableOpacity
            onPress={() => { haptics.soft(); router.push('/(tabs)/profile' as any); }}
            style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: 'rgba(15,15,15,0.9)',
              borderWidth: 1.5, borderColor: 'rgba(157,128,255,0.45)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#b9a7ff', fontSize: 13, fontWeight: '700' }}>{avatarLetter}</Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <Animated.View entering={FadeInDown.delay(60).springify()} style={{ marginBottom: 32 }}>
          <Text style={{ color: '#f5f2ff', fontSize: 38, letterSpacing: -1.5, lineHeight: 44, fontWeight: '300' }}>What&apos;s on your</Text>
          <Text style={{ color: '#b9a7ff', fontSize: 38, letterSpacing: -1.5, lineHeight: 48, fontStyle: 'italic' }}>mind tonight?</Text>
          <Text style={{ color: '#636174', fontSize: 13, lineHeight: 22, marginTop: 10 }}>
            The best conversations happen after midnight.
          </Text>
        </Animated.View>

        {/* Mood Chips */}
        <Animated.View entering={FadeInDown.delay(120).springify()} style={{ marginBottom: 20 }}>
          <Text style={{ color: '#88869b', fontSize: 10, letterSpacing: 2, fontWeight: '700', marginBottom: 12 }}>HOW ARE YOU FEELING?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
            {MOODS.map(m => {
              const active = selectedMood === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => { haptics.selection(); setSelectedMood(active ? null : m.id); }}
                  style={{
                    marginHorizontal: 4,
                    paddingHorizontal: 14, paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: active ? m.bg : 'rgba(10,10,10,0.9)',
                    borderWidth: 1,
                    borderColor: active ? m.color : 'rgba(178,158,255,0.13)',
                  }}
                >
                  <Text style={{ color: active ? m.color : '#636174', fontSize: 12, fontWeight: active ? '700' : '400' }}>{m.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Composer */}
        <Animated.View
          entering={FadeInDown.delay(180).springify()}
          style={[{
            backgroundColor: 'rgba(5,5,5,0.95)',
            borderRadius: 20,
            borderWidth: 1.5,
            borderColor: focused ? 'rgba(157,128,255,0.5)' : 'rgba(178,158,255,0.13)',
            padding: 20, marginBottom: 28,
            shadowColor: '#7958ff', shadowRadius: 24, shadowOffset: { width: 0, height: 4 },
          }, composerStyle]}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ color: '#b9a7ff', fontSize: 10, fontWeight: '700', letterSpacing: 2 }}>☾ NIGHT WHISPER</Text>
            <Text style={{ color: whisper.length > 270 ? '#ff70b0' : '#636174', fontSize: 11 }}>{whisper.length}/300</Text>
          </View>

          <TextInput
            style={{ color: '#f5f2ff', fontSize: 15, lineHeight: 24, minHeight: 100, textAlignVertical: 'top' }}
            placeholder="Write something you wouldn't say during the day..."
            placeholderTextColor="#3d3b52"
            multiline
            maxLength={300}
            value={whisper}
            onChangeText={setWhisper}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />

          {/* Mode pills */}
          <View style={{ gap: 8, marginTop: 16, marginBottom: 20 }}>
            {MODES.map(m => {
              const active = mode === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => { haptics.soft(); setMode(m.id); }}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    padding: 12, borderRadius: 14,
                    backgroundColor: active ? 'rgba(121,88,255,0.10)' : 'transparent',
                    borderWidth: 1,
                    borderColor: active ? 'rgba(157,128,255,0.38)' : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 16, marginRight: 14, color: active ? '#b9a7ff' : '#636174' }}>{m.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: active ? '#f5f2ff' : '#88869b', fontWeight: '600', fontSize: 13 }}>{m.title}</Text>
                    <Text style={{ color: '#636174', fontSize: 11, marginTop: 1 }}>{m.desc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={{
              backgroundColor: '#7958ff', borderRadius: 14, paddingVertical: 16,
              alignItems: 'center', opacity: isSubmitting ? 0.55 : 1,
            }}
          >
            {isSubmitting
              ? <ActivityIndicator color="white" />
              : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.3 }}>Whisper →</Text>}
          </TouchableOpacity>

          <Text style={{ color: '#3d3b52', fontSize: 10, textAlign: 'center', marginTop: 12 }}>
            ◌ Your real identity is never shared.
          </Text>
        </Animated.View>

        {/* Quick Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
          {[
            { title: 'Whisper Feed', desc: "See what's alive tonight", icon: '☾', tab: '/(tabs)/whispers' },
            { title: 'Find Resonance', desc: 'Discover similar minds',   icon: '◎', tab: '/(tabs)/match'    },
            { title: 'Night Rooms',   desc: 'Join live conversations',   icon: '◌', tab: '/(tabs)/whispers' },
            { title: 'Your Profile',  desc: 'Your nights so far',        icon: '○', tab: '/(tabs)/profile'  },
          ].map(item => (
            <TouchableOpacity
              key={item.title}
              onPress={() => { haptics.soft(); router.push(item.tab as any); }}
              style={{
                width: '47%', backgroundColor: 'rgba(10,10,10,0.9)',
                borderWidth: 1, borderColor: 'rgba(178,158,255,0.13)',
                padding: 16, borderRadius: 20,
              }}
            >
              <Text style={{ color: '#b9a7ff', fontSize: 22, marginBottom: 8 }}>{item.icon}</Text>
              <Text style={{ color: '#f5f2ff', fontWeight: '700', fontSize: 13, marginBottom: 4 }}>{item.title}</Text>
              <Text style={{ color: '#636174', fontSize: 10 }}>{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Live Rooms */}
        {rooms.length > 0 && (
          <Animated.View entering={FadeIn.delay(400)}>
            <Text style={{ color: '#b9a7ff', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 6 }}>LIVE NOW</Text>
            <Text style={{ color: '#f5f2ff', fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Rooms alive tonight</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
              {rooms.slice(0, 5).map(room => (
                <TouchableOpacity
                  key={room.id}
                  onPress={() => haptics.soft()}
                  style={{
                    backgroundColor: 'rgba(15,15,15,0.9)',
                    borderWidth: 1, borderColor: 'rgba(157,128,255,0.28)',
                    padding: 16, borderRadius: 18, marginHorizontal: 4, minWidth: 130,
                  }}
                >
                  <Text style={{ color: '#b9a7ff', fontSize: 20, marginBottom: 8 }}>☾</Text>
                  <Text style={{ color: '#f5f2ff', fontWeight: '700', fontSize: 13, marginBottom: 4 }}>{room.name}</Text>
                  <Text style={{ color: '#636174', fontSize: 10 }}>{room.currentMembers} people</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}
      </ScrollView>

      <Toast message={toast.message} visible={toast.visible} />
    </View>
  );
}
