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
    <SafeAreaView edges={["top"]} style={[styles.safeArea, { backgroundColor: appearance.surface }]}>
      <Pattern color={appearance.primary} kind={appearance.backgroundPattern} />
      <ScrollView contentContainerStyle={styles.content}>
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
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: kind === "sprouts" ? 14 : 18 }, (_, index) => (
        <Text
          key={index}
          style={[
            styles.patternMark,
            {
              color,
              left: `${(index * 29) % 92}%` as `${number}%`,
              opacity: kind === "stars" ? 0.18 : 0.12,
              top: `${8 + ((index * 17) % 82)}%` as `${number}%`,
            },
          ]}
        >
          {kind === "sprouts" ? "~" : kind === "stars" ? "*" : "."}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: 112,
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
  patternMark: { fontSize: 18, position: "absolute" },
});
