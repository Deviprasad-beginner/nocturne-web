import { View, Text, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence,
  withTiming, withSpring, FadeInDown, runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserWhispers, deleteWhisper } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { router, type Href } from 'expo-router';
import { haptics } from '@/lib/haptics';

const MOOD_COLORS: Record<string, string> = {
  lonely: '#7b9cff', restless: '#ff8c70', nostalgic: '#c9a96e',
  inspired: '#70dca0', anxious: '#ff70b0', grateful: '#f5d97a',
};
const ALL_MOODS = ['lonely','restless','nostalgic','inspired','anxious','grateful'];

function GlowAvatar({ letter }: { letter: string }) {
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);
  useEffect(() => {
    glowScale.value  = withRepeat(withSequence(withTiming(1.15,{duration:2000}), withTiming(1,{duration:2000})), -1, false);
    glowOpacity.value = withRepeat(withSequence(withTiming(0.85,{duration:2000}), withTiming(0.35,{duration:2000})), -1, false);
  }, [glowScale, glowOpacity]);
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 92, height: 92 }}>
      <Animated.View style={[{
        position:'absolute', width:92, height:92, borderRadius:46,
        borderWidth:2, borderColor:'#7958ff',
        shadowColor:'#7958ff', shadowOpacity:1, shadowRadius:20,
      }, glowStyle]} />
      <View style={{
        width:80, height:80, borderRadius:40,
        backgroundColor:'rgba(25,25,43,0.95)',
        borderWidth:2, borderColor:'rgba(157,128,255,0.45)',
        alignItems:'center', justifyContent:'center', zIndex:1,
      }}>
        <Text style={{ color:'#f5f2ff', fontSize:30, fontWeight:'300' }}>{letter}</Text>
      </View>
    </View>
  );
}

function MoodBar({ whispers }: { whispers: any[] }) {
  const moodCounts: Record<string, number> = {};
  whispers.forEach(w => {
    const m = (w.mood || '').toLowerCase();
    if (ALL_MOODS.includes(m)) moodCounts[m] = (moodCounts[m] || 0) + 1;
  });
  const total = Object.values(moodCounts).reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  return (
    <View style={{ marginBottom: 28 }}>
      <Text style={{ color:'#636174', fontSize:10, letterSpacing:2, fontWeight:'700', marginBottom:14 }}>YOUR MOOD BREAKDOWN</Text>
      {ALL_MOODS.filter(m => moodCounts[m]).map(m => {
        const pct = (moodCounts[m] / total) * 100;
        return (
          <View key={m} style={{ marginBottom:10 }}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:5 }}>
              <Text style={{ color:MOOD_COLORS[m], fontSize:11, fontWeight:'600', textTransform:'capitalize' }}>{m}</Text>
              <Text style={{ color:'#636174', fontSize:10 }}>{Math.round(pct)}%</Text>
            </View>
            <View style={{ height:4, backgroundColor:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden' }}>
              <View style={{ height:4, width:`${pct}%`, backgroundColor:MOOD_COLORS[m], borderRadius:2 }} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function WhisperRow({ whisper, onDelete }: { whisper: any; onDelete: () => void }) {
  const translateX = useSharedValue(0);
  const THRESHOLD = 90;

  const panGesture = Gesture.Pan()
    .activeOffsetX([-9, 9999])
    .onUpdate((e) => { translateX.value = Math.min(0, e.translationX * 0.7); })
    .onEnd((e) => {
      if (e.translationX < -THRESHOLD) runOnJS(onDelete)();
      translateX.value = withSpring(0);
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    borderColor: translateX.value < -THRESHOLD * 0.7 ? 'rgba(248,113,113,0.5)' : 'rgba(178,158,255,0.13)',
  }));
  const deleteReveal = useAnimatedStyle(() => ({
    opacity: withTiming(translateX.value < -30 ? 1 : 0),
  }));

  return (
    <View style={{ marginBottom:10 }}>
      <Animated.View style={[{ position:'absolute', right:0, top:0, bottom:0, justifyContent:'center', paddingRight:16 }, deleteReveal]}>
        <Text style={{ color:'#f87171', fontSize:13, fontWeight:'700' }}>Delete</Text>
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[{
          backgroundColor:'rgba(5,5,5,0.95)',
          borderWidth:1, borderRadius:16, padding:16,
        }, cardStyle]}>
          <Text style={{ color:'#f5f2ff', fontSize:13, lineHeight:22, marginBottom:10 }}>
            {whisper.content || whisper.text}
          </Text>
          <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
            <Text style={{ color:'#3d3b52', fontSize:10 }}>{whisper.visibility === 'private' ? '🔒 Private' : (whisper.visibility === 'resonance' ? '◎ Resonance' : '🌍 Public')}</Text>
            <Text style={{ color:'#636174', fontSize:10 }}>◎ {whisper.hearts || 0}</Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [whispers, setWhispers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsOn, setNotificationsOn] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchUserWhispers()
        .then(data => { setWhispers(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
    AsyncStorage.getItem('notifs_on').then(v => setNotificationsOn(v === 'true'));
  }, [user]);

  const handleLogout = async () => {
    haptics.medium();
    await signOut();
    router.replace('/(auth)/login' as Href);
  };

  const toggleNotifs = async (val: boolean) => {
    haptics.soft();
    setNotificationsOn(val);
    await AsyncStorage.setItem('notifs_on', val ? 'true' : 'false');
  };

  const handleDelete = (id: string) => {
    haptics.error();
    Alert.alert('Delete Whisper', 'Remove this whisper permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          haptics.heavy();
          setWhispers(c => c.filter(w => w.id !== id));
          await deleteWhisper(id); // persist deletion on server
        },
      },
    ]);
  };

  const avatarLetter = (user?.displayName || user?.username || 'U')[0].toUpperCase();
  const totalResonances = whispers.reduce((acc, w) => acc + (w.hearts || 0), 0);
  const nightsActive = Math.max(1, Math.floor(whispers.length / 2));

  return (
    <View style={{ flex:1, backgroundColor:'#000000' }}>
      <ScrollView
        style={{ flex:1 }}
        contentContainerStyle={{ paddingHorizontal:24, paddingTop:56, paddingBottom:120 }}
      >
        <Animated.View entering={FadeInDown.springify()} style={{ alignItems:'center', marginBottom:28 }}>
          <GlowAvatar letter={avatarLetter} />
          <Text style={{ color:'#f5f2ff', fontSize:22, fontWeight:'700', marginTop:16 }}>
            {user?.displayName || user?.username}
          </Text>
          <Text style={{ color:'#636174', fontSize:13, marginTop:4 }}>@{user?.username}</Text>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(80).springify()} style={{
          flexDirection:'row',
          backgroundColor:'rgba(5,5,5,0.95)',
          borderWidth:1, borderColor:'rgba(178,158,255,0.13)',
          borderRadius:20, padding:20, marginBottom:28,
        }}>
          {[
            { value: whispers.length,   label:'WHISPERS'   },
            { value: totalResonances,   label:'RESONANCES' },
            { value: nightsActive,      label:'NIGHTS'     },
          ].map((stat, i, arr) => (
            <View key={stat.label} style={{
              flex:1, alignItems:'center',
              borderRightWidth: i < arr.length-1 ? 1 : 0,
              borderRightColor: 'rgba(178,158,255,0.13)',
            }}>
              <Text style={{ color:'#f5f2ff', fontWeight:'800', fontSize:22 }}>{stat.value}</Text>
              <Text style={{ color:'#636174', fontSize:9, letterSpacing:1.5, marginTop:4 }}>{stat.label}</Text>
            </View>
          ))}
        </Animated.View>

        <MoodBar whispers={whispers} />

        {/* Whispers list */}
        <View style={{ marginBottom:28 }}>
          <Text style={{ color:'#636174', fontSize:10, letterSpacing:2, fontWeight:'700', marginBottom:16 }}>MY WHISPERS</Text>
          {loading
            ? <ActivityIndicator color="#b9a7ff" />
            : whispers.length === 0
              ? <Text style={{ color:'#636174', textAlign:'center', marginTop:8 }}>You haven&apos;t whispered yet.</Text>
              : whispers.map((w, i) => (
                  <WhisperRow key={w.id || i} whisper={w} onDelete={() => handleDelete(w.id)} />
                ))
          }
        </View>

        {/* Settings */}
        <View style={{
          backgroundColor:'rgba(5,5,5,0.95)',
          borderWidth:1, borderColor:'rgba(178,158,255,0.13)',
          borderRadius:20, overflow:'hidden', marginBottom:20,
        }}>
          <View style={{
            flexDirection:'row', justifyContent:'space-between', alignItems:'center',
            padding:18, borderBottomWidth:1, borderBottomColor:'rgba(178,158,255,0.08)',
          }}>
            <View>
              <Text style={{ color:'#f5f2ff', fontWeight:'600', fontSize:14 }}>Night Notifications</Text>
              <Text style={{ color:'#636174', fontSize:11, marginTop:2 }}>Get pinged when someone resonates</Text>
            </View>
            <Switch
              value={notificationsOn}
              onValueChange={toggleNotifs}
              trackColor={{ false:'#1e1c2e', true:'rgba(121,88,255,0.5)' }}
              thumbColor={notificationsOn ? '#b9a7ff' : '#636174'}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          style={{
            borderWidth:1, borderColor:'rgba(248,113,113,0.25)',
            backgroundColor:'rgba(248,113,113,0.07)',
            borderRadius:16, paddingVertical:18, alignItems:'center',
          }}
        >
          <Text style={{ color:'#f87171', fontWeight:'700', fontSize:15 }}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
