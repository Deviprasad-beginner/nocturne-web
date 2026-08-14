import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { haptics } from '../lib/haptics';

import SanctuaryScreen from '../screens/SanctuaryScreen';
import DiscoverScreen from '../screens/DiscoverScreen';   // Music
import ConnectScreen from '../screens/ConnectScreen';     // Circles
import ThoughtsScreen from '../screens/ThoughtsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', component: SanctuaryScreen, icon: 'moon' },
  { name: 'Music', component: DiscoverScreen, icon: 'headphones' },
  { name: 'Circles', component: ConnectScreen, icon: 'users' },
  { name: 'Thoughts', component: ThoughtsScreen, icon: 'zap' },
  { name: 'Profile', component: ProfileScreen, icon: 'user' },
] as const;

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#050508',
          borderTopColor: 'rgba(255,255,255,0.05)',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#818cf8',
        tabBarInactiveTintColor: '#374151',
        tabBarIcon: ({ color, size }) => {
          const tab = TABS.find(t => t.name === route.name);
          return <Feather name={(tab?.icon ?? 'circle') as any} size={size - 2} color={color} />;
        },
        // Haptic feedback on every tab press
        tabBarButton: ({ style, children, onPress, accessibilityState }) => (
          <TouchableOpacity
            style={style as any}
            activeOpacity={0.8}
            accessibilityState={accessibilityState}
            onPress={(e) => {
              haptics.select();
              onPress?.(e);
            }}
          >
            {children as any}
          </TouchableOpacity>
        ),
      })}
    >
      {TABS.map(({ name, component }) => (
        <Tab.Screen key={name} name={name} component={component} />
      ))}
    </Tab.Navigator>
  );
}
