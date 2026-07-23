import { ConvexAuthProvider } from "@convex-dev/auth/react";
import * as SecureStore from "expo-secure-store";
import { ConvexReactClient, useConvexAuth, useMutation, useQuery } from "convex/react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PropsWithChildren, useEffect, useMemo } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";

import { api } from "../convex/_generated/api";
import { flushOfflineQueue } from "../src/offlineQueue";
import { colors } from "../src/theme";
import { useNotificationObserver } from "../src/notifications";
import { paymentNotifications, paymentNotificationsSupported } from "../src/paymentNotifications";

function OfflineSync() {
  const viewer = useQuery(api.core.viewer);
  const addTask = useMutation(api.core.addTask);
  const addExpense = useMutation(api.core.addExpense);
  const addManualFocus = useMutation(api.core.addManualFocus);
  const addReflection = useMutation(api.core.addReflection);

  useEffect(() => {
    if (!viewer) return;
    const flush = () => flushOfflineQueue(viewer._id, {
      addExpense,
      addManualFocus,
      addReflection,
      addTask,
    });
    void flush();
    const timer = setInterval(() => void flush(), 15000);
    return () => clearInterval(timer);
  }, [addExpense, addManualFocus, addReflection, addTask, viewer]);

  useEffect(() => {
    if (!paymentNotificationsSupported || !paymentNotifications || !viewer) return;
    const module = paymentNotifications;
    module.setOwner(viewer._id);
    return () => module.setOwner(null);
  }, [viewer]);

  return null;
}

const secureTokenStorage = {
  getItem: SecureStore.getItemAsync,
  removeItem: SecureStore.deleteItemAsync,
  setItem: SecureStore.setItemAsync,
};

function OptionalConvexProvider({ children }: PropsWithChildren) {
  const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
  const convex = useMemo(
    () => (convexUrl ? new ConvexReactClient(convexUrl) : null),
    [convexUrl],
  );

  return convex ? (
    <ConvexAuthProvider client={convex} storage={Platform.OS === "web" ? undefined : secureTokenStorage}>
      {children}
    </ConvexAuthProvider>
  ) : children;
}

function AppStack() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background }, headerShown: false }}>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="login" />
        </Stack.Protected>
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="focus" options={{ presentation: "fullScreenModal" }} />
          <Stack.Screen name="quick-add" options={{ presentation: "transparentModal" }} />
          <Stack.Screen name="reflection" options={{ presentation: "modal" }} />
          <Stack.Screen name="settings" options={{ presentation: "modal" }} />
        </Stack.Protected>
      </Stack>
      {isAuthenticated ? <OfflineSync /> : null}
    </>
  );
}

export default function RootLayout() {
  useNotificationObserver();

  return (
    <OptionalConvexProvider>
      <AppStack />
      <StatusBar style="dark" />
    </OptionalConvexProvider>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: "center", backgroundColor: colors.background, flex: 1, justifyContent: "center" },
});
