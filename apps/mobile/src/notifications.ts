import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type ScheduledItem = {
  body: string;
  date: number;
  title: string;
  url: string;
};

async function ensurePermission() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      importance: Notifications.AndroidImportance.DEFAULT,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
      name: "Little Better",
    });
  }
  const existing = await Notifications.getPermissionsAsync();
  const finalStatus = existing.status === "granted" ? existing.status : (await Notifications.requestPermissionsAsync()).status;
  return finalStatus === "granted";
}

export function useNotificationObserver() {
  useEffect(() => {
    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      if (typeof url === "string") router.push(url);
    }

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response?.notification) redirect(response.notification);
    });

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      redirect(response.notification);
    });
    return () => subscription.remove();
  }, []);
}

export async function scheduleLocalNotifications(items: ScheduledItem[]) {
  if (!(await ensurePermission())) return false;
  await Notifications.cancelAllScheduledNotificationsAsync();
  const now = Date.now();
  for (const item of items.filter((entry) => entry.date > now)) {
    await Notifications.scheduleNotificationAsync({
      content: {
        body: item.body,
        data: { url: item.url },
        title: item.title,
      },
      trigger: {
        date: new Date(item.date),
        type: Notifications.SchedulableTriggerInputTypes.DATE,
      },
    });
  }
  return true;
}
