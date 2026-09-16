/**
 * Push Notification Service — handles permissions, token registration, and listeners.
 * Uses expo-notifications for cross-platform push support.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import api from './api';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Request push notification permissions and register the device token.
 * Call this once during app initialization (after auth is confirmed).
 */
export async function registerForPushNotifications(): Promise<string | null> {
    try {
        // Check existing permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        // Request if not already granted
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('[Notifications] Permission not granted');
            return null;
        }

        // Get the Expo push token
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: undefined, // Will use the project ID from app.json
        });
        const token = tokenData.data;
        console.log('[Notifications] Push token:', token);

        // Register token with server
        try {
            await api.post('/user/push-token', { token, platform: Platform.OS });
        } catch (err) {
            // Server may not have this endpoint yet — silently fail
            console.log('[Notifications] Could not register token with server:', err);
        }

        // Android-specific: create notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Nocturne',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#818CF8',
                sound: 'default',
            });
        }

        return token;
    } catch (error) {
        console.error('[Notifications] Registration error:', error);
        return null;
    }
}

/**
 * Set up notification listeners for received and response events.
 * Returns a cleanup function to remove listeners.
 */
export function setupNotificationListeners(
    onReceived?: (notification: Notifications.Notification) => void,
    onResponse?: (response: Notifications.NotificationResponse) => void,
): () => void {
    const receivedSub = Notifications.addNotificationReceivedListener(
        (notification) => {
            console.log('[Notifications] Received:', notification.request.content.title);
            onReceived?.(notification);
        }
    );

    const responseSub = Notifications.addNotificationResponseReceivedListener(
        (response) => {
            console.log('[Notifications] User tapped notification');
            onResponse?.(response);
        }
    );

    return () => {
        receivedSub.remove();
        responseSub.remove();
    };
}

/**
 * Get the number of unread notifications (badge count).
 */
export async function getBadgeCount(): Promise<number> {
    return Notifications.getBadgeCountAsync();
}

/**
 * Set the badge count.
 */
export async function setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
}
