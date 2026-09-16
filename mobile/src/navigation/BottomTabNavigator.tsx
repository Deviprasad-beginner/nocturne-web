import React, { useRef } from 'react';
import { Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { haptics } from '../lib/haptics';
import { Colors, Springs } from '../lib/tokens';

import HomeStackNavigator from './HomeStackNavigator';
import DiscoverScreen from '../screens/DiscoverScreen';
import ConnectScreen from '../screens/ConnectScreen';
import ThoughtsScreen from '../screens/ThoughtsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', component: HomeStackNavigator, icon: 'moon' },
  { name: 'Music', component: DiscoverScreen, icon: 'headphones' },
  { name: 'Circles', component: ConnectScreen, icon: 'users' },
  { name: 'Thoughts', component: ThoughtsScreen, icon: 'zap' },
  { name: 'Profile', component: ProfileScreen, icon: 'user' },
] as const;

/**
 * Animated tab bar button — scales down on press like iOS.
 */
function TabBarButton({ children, onPress, accessibilityState, style }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const isSelected = accessibilityState?.selected;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.85, ...Springs.snappy }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, ...Springs.snappy }).start();
  };

  return (
    <Pressable
      style={style}
      accessibilityState={accessibilityState}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={(e) => {
        haptics.select();
        onPress?.(e);
      }}
    >
      <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bg,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.indigo,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarIcon: ({ color, size }) => {
          const tab = TABS.find(t => t.name === route.name);
          return (
            <Feather
              name={(tab?.icon ?? 'circle') as any}
              size={size - 2}
              color={color}
            />
          );
        },
        tabBarButton: (props) => <TabBarButton {...props} />,
      })}
    >
      {TABS.map(({ name, component }) => (
        <Tab.Screen key={name} name={name} component={component} />
      ))}
    </Tab.Navigator>
  );
}
