import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SanctuaryScreen from '../screens/SanctuaryScreen';
import MindMazeScreen from '../screens/MindMazeScreen';
import MidnightCafeScreen from '../screens/MidnightCafeScreen';
import ReadsScreen from '../screens/ReadsScreen';
import FounderScreen from '../screens/FounderScreen';
import SpeakerScreen from '../screens/SpeakerScreen';
import MessengerScreen from '../screens/MessengerScreen';
import ScannerScreen from '../screens/ScannerScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import NightThoughtsScreen from '../screens/NightThoughtsScreen';
import NightCirclesScreen from '../screens/NightCirclesScreen';
import WhispersScreen from '../screens/WhispersScreen';
import HelpScreen from '../screens/HelpScreen';

const Stack = createNativeStackNavigator();

/**
 * Home stack — iOS-style push/pop transitions.
 *
 * `animation: 'slide_from_right'` gives the standard iOS page push.
 * `gestureEnabled: true` allows swipe-back on the left edge.
 */
export default function HomeStackNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                contentStyle: { backgroundColor: '#000000' },
                animationDuration: 280,
            }}
        >
            <Stack.Screen name="Sanctuary" component={SanctuaryScreen} />
            <Stack.Screen name="MindMaze" component={MindMazeScreen} />
            <Stack.Screen name="MidnightCafe" component={MidnightCafeScreen} />
            <Stack.Screen name="Reads" component={ReadsScreen} />
            <Stack.Screen name="Founder" component={FounderScreen} />
            <Stack.Screen name="Speaker" component={SpeakerScreen} />
            <Stack.Screen name="Messenger" component={MessengerScreen} />
            <Stack.Screen
                name="Scanner"
                component={ScannerScreen}
                options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="NightThoughts" component={NightThoughtsScreen} />
            <Stack.Screen name="NightCircles" component={NightCirclesScreen} />
            <Stack.Screen name="Whispers" component={WhispersScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
        </Stack.Navigator>
    );
}
