import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "../../convex/_generated/api";
import { colors, resolveAppearance, spacing } from "../theme";

type ScreenProps = PropsWithChildren<{
  headerAction?: ReactNode;
  subtitle?: string;
  title: string;
}>;

export function Screen({ children, headerAction, subtitle, title }: ScreenProps) {
  const settings = useQuery(api.core.settingsView);
  const appearance = resolveAppearance(settings?.settings);
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={[styles.safeArea, { backgroundColor: appearance.surface }]}>
      <Pattern color={appearance.primary} kind={appearance.backgroundPattern} />
      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.content}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.heading}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {headerAction}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

function Pattern({ color, kind }: { color: string; kind: "none" | "sprouts" | "dots" | "stars" }) {
  if (kind === "none") return null;
  const count = kind === "dots" ? 22 : 15;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: count }, (_, index) => {
        // Deterministic scatter with gentle size variation for a hand-placed feel.
        const left = `${(index * 37 + (index % 3) * 7) % 93}%` as `${number}%`;
        const top = `${6 + ((index * 23) % 86)}%` as `${number}%`;
        const size = kind === "dots" ? 5 + (index % 3) * 2 : 14 + (index % 3) * 5;
        const rotate = `${((index * 41) % 60) - 30}deg`;
        if (kind === "dots") {
          return (
            <View
              key={index}
              style={[
                styles.patternDot,
                { backgroundColor: color, borderRadius: size, height: size, left, opacity: 0.1, top, width: size },
              ]}
            />
          );
        }
        return (
          <Ionicons
            color={color}
            key={index}
            name={kind === "stars" ? "sparkles" : "leaf"}
            size={size}
            style={[styles.patternIcon, { left, opacity: kind === "stars" ? 0.14 : 0.1, top, transform: [{ rotate }] }]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    alignSelf: "center",
    gap: spacing.lg,
    maxWidth: 720,
    padding: spacing.lg,
    paddingBottom: 112,
    width: "100%",
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heading: { flex: 1 },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 32,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  patternDot: { position: "absolute" },
  patternIcon: { position: "absolute" },
});
