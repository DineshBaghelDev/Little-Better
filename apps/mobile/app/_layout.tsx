import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { Text, View } from "react-native";

import { colors, spacing } from "../src/theme";

function MissingConvexUrl() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        padding: spacing.xl,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>
        Little Better
      </Text>
      <Text
        style={{
          color: colors.muted,
          fontSize: 14,
          lineHeight: 20,
          marginTop: spacing.sm,
          textAlign: "center",
        }}
      >
        Add EXPO_PUBLIC_CONVEX_URL to apps/mobile/.env to connect Convex.
      </Text>
    </View>
  );
}

export default function RootLayout() {
  const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
  const convex = useMemo(
    () => (convexUrl ? new ConvexReactClient(convexUrl) : null),
    [convexUrl],
  );

  if (!convex) {
    return (
      <>
        <MissingConvexUrl />
        <StatusBar style="dark" />
      </>
    );
  }

  return (
    <ConvexProvider client={convex}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="dark" />
    </ConvexProvider>
  );
}
