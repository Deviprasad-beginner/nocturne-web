import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SanctuaryScreen from '../screens/SanctuaryScreen';
import ConnectScreen from '../screens/ConnectScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Feather } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#050508',
          borderTopColor: '#1f2937',
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#818cf8',
        tabBarInactiveTintColor: '#4b5563',
        tabBarIcon: ({ color, size }) => {
          let iconName: any = 'circle';
          if (route.name === 'Sanctuary') iconName = 'moon';
          else if (route.name === 'Connect') iconName = 'message-circle';
          else if (route.name === 'Discover') iconName = 'compass';
          else if (route.name === 'Profile') iconName = 'user';
          return <Feather name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Sanctuary" component={SanctuaryScreen} />
      <Tab.Screen name="Connect" component={ConnectScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
