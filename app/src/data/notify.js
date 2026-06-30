import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// A purely LOCAL daily reminder — no server, no push tokens. We schedule a
// repeating notification for ~9am so the "daily ritual" has a nudge.
//
// Note: local scheduled notifications need a dev/EAS build to fire reliably;
// in Expo Go this no-ops gracefully (permission/schedule calls are caught).

const ASKED_KEY = 'sportsdaily_notify_asked_v1';
const REMINDER_HOUR = 9;

export async function ensureDailyReminder() {
  try {
    let settings = await Notifications.getPermissionsAsync();
    let granted =
      settings.granted ||
      settings.ios?.status === Notifications.IosAuthorizationStatus?.PROVISIONAL;

    if (!granted) {
      // Only prompt once, ever — asking after the first finished quiz is the
      // moment the player has seen the value.
      const asked = await AsyncStorage.getItem(ASKED_KEY);
      if (asked) return false;
      await AsyncStorage.setItem(ASKED_KEY, '1');
      const req = await Notifications.requestPermissionsAsync();
      granted = req.granted;
    }
    if (!granted) return false;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily', {
        name: 'Daily drop',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    // De-dupe: clear any prior schedule before re-adding.
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Daily Drop',
        body: "Today's set is live — keep your streak alive 🔥",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: REMINDER_HOUR,
        minute: 0,
        channelId: Platform.OS === 'android' ? 'daily' : undefined,
      },
    });
    return true;
  } catch {
    return false;
  }
}
