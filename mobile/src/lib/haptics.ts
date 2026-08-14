/**
 * Haptics utility — consistent tactile feedback across the app
 * Wraps expo-haptics with semantic names so code reads like intent
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isAndroid = Platform.OS === 'android';

export const haptics = {
    /** Subtle — tab press, scroll snap, toggle */
    light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

    /** Standard — button tap, card select */
    medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),

    /** Strong — destructive action, long press */
    heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),

    /** ✅ Success — posted, joined, saved */
    success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),

    /** ❌ Error — auth failed, submission error */
    error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),

    /** ⚠️ Warning — rate limited, already liked */
    warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),

    /** Selection tick — picker, slider scrub */
    select: () => Haptics.selectionAsync(),
};
