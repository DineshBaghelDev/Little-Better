import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { router, Tabs } from "expo-router";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "../../convex/_generated/api";
import { colors, resolveAppearance } from "../../src/theme";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const settings = useQuery(api.core.settingsView);
  const appearance = resolveAppearance(settings?.settings);
  const floating = appearance.navStyle === "floating";
  const compact = appearance.navStyle === "compact";
  const sideMargin = floating ? 18 : 0;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: appearance.primaryDark,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: floating ? 26 : 0,
          borderTopColor: colors.border,
          borderWidth: floating ? 1 : 0,
          bottom: floating ? Math.max(insets.bottom, 12) : 0,
          elevation: floating ? 6 : 0,
          height: (compact ? 58 : 72) + (floating ? 0 : insets.bottom),
          left: floating ? Math.max(insets.left, sideMargin) : 0,
          paddingBottom: floating ? (compact ? 4 : 8) : Math.max(insets.bottom, 4),
          paddingTop: compact ? 4 : 8,
          position: "absolute",
          right: floating ? Math.max(insets.right, sideMargin) : 0,
          shadowColor: colors.text,
          shadowOpacity: floating ? 0.08 : 0,
          shadowRadius: 14,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: "Today",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="home-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Plan",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="calendar-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          tabBarButton: () => (
            <Pressable
              accessibilityLabel="Quick add"
              accessibilityRole="button"
              onPress={() => router.push("/quick-add")}
              style={{ alignItems: "center", flex: 1, justifyContent: "center" }}
            >
              <Ionicons color={appearance.primary} name="add-circle" size={compact ? 36 : 42} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="money"
        options={{
          title: "Money",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="wallet-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="leaf-outline" size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
