import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, FadeInDown, runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { fetchWhispers, heartWhisper } from '@/lib/api';
import { haptics } from '@/lib/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;

const MOOD_COLORS: Record<string, { color: string; bg: string }> = {
  lonely:    { color: '#7b9cff', bg: 'rgba(123,156,255,0.12)' },
  restless:  { color: '#ff8c70', bg: 'rgba(255,140,112,0.12)' },
  nostalgic: { color: '#c9a96e', bg: 'rgba(201,169,110,0.12)' },
  inspired:  { color: '#70dca0', bg: 'rgba(112,220,160,0.12)' },
  anxious:   { color: '#ff70b0', bg: 'rgba(255,112,176,0.12)' },
  grateful:  { color: '#f5d97a', bg: 'rgba(245,217,122,0.12)' },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function SkeletonCard({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    const pulse = () => {
      opacity.value = withTiming(1, { duration: 700 }, () => {
        opacity.value = withTiming(0.3, { duration: 700 });
      });
    };
    pulse();
    const interval = setInterval(pulse, 1400 + delay * 0.3);
    return () => clearInterval(interval);
  }, [opacity, delay]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View style={[{
      backgroundColor: 'rgba(10,10,10,0.9)',
      borderWidth: 1, borderColor: 'rgba(178,158,255,0.10)',
      borderRadius: 20, padding: 20, marginBottom: 12,
    }, style]}>
      <View style={{ height: 13, backgroundColor: '#1e1c2e', borderRadius: 6, marginBottom: 10, width: '90%' }} />
      <View style={{ height: 13, backgroundColor: '#1e1c2e', borderRadius: 6, marginBottom: 10, width: '75%' }} />
      <View style={{ height: 13, backgroundColor: '#1e1c2e', borderRadius: 6, width: '55%' }} />
    </Animated.View>
  );
}

function WhisperCard({ whisper, index, onHeart }: { whisper: any; index: number; onHeart: (id: string) => void }) {
  const translateX = useSharedValue(0);
  const [hearted, setHearted] = useState(false);

  const mood = (whisper.mood || whisper.aiMetadata?.tone?.[0] || 'thought').toLowerCase();
  const moodColor = MOOD_COLORS[mood] ?? { color: '#b9a7ff', bg: 'rgba(185,167,255,0.10)' };

  const fireHeart = () => {
    if (hearted) return;
    haptics.heavy();
    setHearted(true);
    onHeart(whisper.id);
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([8, 9999])
    .onUpdate((e) => {
      translateX.value = Math.max(0, e.translationX * 0.6);
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        runOnJS(fireHeart)();
      }
      translateX.value = withSpring(0, { damping: 18 });
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    borderColor: translateX.value > SWIPE_THRESHOLD * 0.7
      ? 'rgba(112,220,160,0.6)'
      : 'rgba(178,158,255,0.13)',
  }));

  const heartReveal = useAnimatedStyle(() => ({
    opacity: withTiming(translateX.value > 30 ? 1 : 0, { duration: 150 }),
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()} style={{ marginBottom: 12 }}>
      <View style={{ position: 'relative' }}>
        <Animated.View style={[{
          position: 'absolute', left: -8, top: 0, bottom: 0,
          justifyContent: 'center', alignItems: 'center', width: 48,
        }, heartReveal]}>
          <Text style={{ fontSize: 22 }}>◎</Text>
        </Animated.View>

        <GestureDetector gesture={panGesture}>
          <Animated.View style={[{
            backgroundColor: 'rgba(5,5,5,0.95)',
            borderWidth: 1, borderRadius: 20, padding: 20,
          }, cardStyle]}>
            <Text style={{ color: '#f5f2ff', fontSize: 14, lineHeight: 24, marginBottom: 16 }}>
              {whisper.content || whisper.text}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ color: '#3d3b52', fontSize: 10 }}>
                  {whisper.createdAt ? timeAgo(whisper.createdAt) : 'just now'}
                </Text>
                <TouchableOpacity
                  onPress={() => fireHeart()}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
                >
                  <Text style={{ color: hearted ? '#70dca0' : '#b9a7ff', fontSize: 14 }}>◎</Text>
                  <Text style={{ color: hearted ? '#70dca0' : '#636174', fontSize: 10 }}>
                    {(whisper.hearts || 0) + (hearted ? 1 : 0)} resonances
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ backgroundColor: moodColor.bg, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 }}>
                <Text style={{ color: moodColor.color, fontSize: 10, fontWeight: '700' }}>
                  {mood.charAt(0).toUpperCase() + mood.slice(1)}
                </Text>
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Animated.View>
  );
}

function EmptyState() {
  const moonY = useSharedValue(0);
  useEffect(() => {
    const anim = () => {
      moonY.value = withTiming(-8, { duration: 2000 }, () => {
        moonY.value = withTiming(0, { duration: 2000 }, anim);
      });
    };
    anim();
  }, [moonY]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: moonY.value }] }));
  return (
    <View style={{ alignItems: 'center', paddingTop: 60 }}>
      <Animated.Text style={[{ fontSize: 56, marginBottom: 20 }, style]}>☾</Animated.Text>
      <Text style={{ color: '#f5f2ff', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>The night is quiet</Text>
      <Text style={{ color: '#636174', fontSize: 13, textAlign: 'center', lineHeight: 22 }}>
        No whispers yet tonight.{'\n'}Be the first to break the silence.
      </Text>
    </View>
  );
}

export default function WhispersScreen() {
  const [whispers, setWhispers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const data = await fetchWhispers();
    setWhispers(data);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    haptics.soft();
    await load();
    haptics.success();
    setRefreshing(false);
  }, []);

  const handleHeart = (id: string) => {
    setWhispers(curr => curr.map(w => w.id === id ? { ...w, hearts: (w.hearts || 0) + 1 } : w));
    heartWhisper(id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#b9a7ff" />}
      >
        <View style={{ marginBottom: 32 }}>
          <Text style={{ color: '#b9a7ff', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 6 }}>NIGHT COMMUNITY</Text>
          <Text style={{ color: '#f5f2ff', fontSize: 32, letterSpacing: -1, fontWeight: '300' }}>The things people</Text>
          <Text style={{ color: '#b9a7ff', fontSize: 32, letterSpacing: -1, fontStyle: 'italic' }}>don&apos;t say aloud.</Text>
          <Text style={{ color: '#636174', fontSize: 12, lineHeight: 20, marginTop: 10 }}>
            Swipe right on a whisper to resonate with it.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ color: '#f5f2ff', fontSize: 17, fontWeight: '700' }}>Recent Whispers</Text>
          <Text style={{ color: '#636174', fontSize: 10 }}>{whispers.length > 0 ? `${whispers.length} alive tonight` : ''}</Text>
        </View>

        {loading
          ? [0, 1, 2, 3].map(i => <SkeletonCard key={i} delay={i * 120} />)
          : whispers.length === 0
            ? <EmptyState />
            : whispers.map((w, i) => <WhisperCard key={w.id || i} whisper={w} index={i} onHeart={handleHeart} />)
        }
      </ScrollView>
    </View>
  );
}
