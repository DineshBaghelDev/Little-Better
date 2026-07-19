import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PropsWithChildren, useMemo } from "react";

import { colors } from "../src/theme";
import { useNotificationObserver } from "../src/notifications";

function OptionalConvexProvider({ children }: PropsWithChildren) {
  const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
  const convex = useMemo(
    () => (convexUrl ? new ConvexReactClient(convexUrl) : null),
    [convexUrl],
  );

  return convex ? <ConvexProvider client={convex}>{children}</ConvexProvider> : children;
}

export default function RootLayout() {
  useNotificationObserver();

  return (
    <OptionalConvexProvider>
      <Stack
        initialRouteName="index"
        screenOptions={{ contentStyle: { backgroundColor: colors.background }, headerShown: false }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="focus" options={{ presentation: "fullScreenModal" }} />
        <Stack.Screen name="quick-add" options={{ presentation: "transparentModal" }} />
        <Stack.Screen name="reflection" options={{ presentation: "modal" }} />
        <Stack.Screen name="settings" options={{ presentation: "modal" }} />
      </Stack>
      <StatusBar style="dark" />
    </OptionalConvexProvider>
  );
}
