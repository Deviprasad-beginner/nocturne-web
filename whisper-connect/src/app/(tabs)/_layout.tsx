import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { haptics } from '@/lib/haptics';

const TABS = [
  { name: 'index',    label: 'Home',     icon: '⌂' },
  { name: 'whispers', label: 'Whispers', icon: '☾' },
  { name: 'match',    label: 'Resonate', icon: '◎' },
  { name: 'profile',  label: 'You',      icon: '○' },
];

function TabIcon({ label, icon, focused }: { label: string; icon: string; focused: boolean }) {


  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(focused ? 1.08 : 0.92, { damping: 14, stiffness: 180 }) }],
  }));

  return (
    <Animated.View style={[{ alignItems: 'center', justifyContent: 'center', paddingTop: 6, paddingHorizontal: 14 }, animStyle]}>
      {focused && (
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(121, 88, 255, 0.14)',
          borderRadius: 16,
        }} />
      )}
      <Text style={{ fontSize: 18, color: focused ? '#b9a7ff' : '#636174' }}>{icon}</Text>
      <Text style={{ fontSize: 9, marginTop: 3, letterSpacing: 0.8, color: focused ? '#b9a7ff' : '#636174', fontWeight: focused ? '700' : '400' }}>
        {label.toUpperCase()}
      </Text>
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopWidth: 1,
          borderTopColor: 'rgba(178, 158, 255, 0.10)',
          height: 68,
          paddingBottom: 8,
          paddingTop: 4,
          elevation: 24,
          shadowColor: '#7958ff',
          shadowOpacity: 0.25,
          shadowOffset: { width: 0, height: -4 },
          shadowRadius: 20,
        },
        tabBarShowLabel: false,
      }}
      screenListeners={{
        tabPress: () => {
          haptics.soft();
        },
      }}
    >
      {TABS.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarIcon: ({ focused }) => <TabIcon label={tab.label} icon={tab.icon} focused={focused} />,
          }}
        />
      ))}
    </Tabs>
  );
}
