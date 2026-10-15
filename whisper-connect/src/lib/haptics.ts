import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Only fire haptics on Android/iOS — silently skip on web
const isNative = Platform.OS !== 'web';

export const haptics = {
  /** Light tap — tab switches, option selection */
  soft: () => {
    if (!isNative) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /** Medium tap — button presses, confirm */
  medium: () => {
    if (!isNative) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  /** Heavy thud — resonance/heart tap */
  heavy: () => {
    if (!isNative) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  /** Double pulse — success (whisper sent, match found) */
  success: () => {
    if (!isNative) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  /** Warning buzz — error, validation fail */
  error: () => {
    if (!isNative) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  /** Tick — fine-grained selection */
  selection: () => {
    if (!isNative) return;
    Haptics.selectionAsync();
  },
};
