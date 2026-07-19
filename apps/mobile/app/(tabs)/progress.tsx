import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "../../src/components/Screen";
import { PrimaryButton, SectionLabel, Surface } from "../../src/components/ui";
import { colors, radii, spacing } from "../../src/theme";

export default function ProgressScreen() {
  const [insight, setInsight] = useState<"available" | "applied" | "dismissed">("available");

  return (
    <Screen subtitle="Your week at a glance" title="Progress">
      <View style={styles.stats}>
        <Stat color={colors.sageSurface} label="Focus" value="6" detail="sessions" />
        <Stat color={colors.lavenderSurface} label="Tasks" value="14" detail="completed" />
        <Stat color={colors.mustardSurface} label="Spent" value="₹7.5k" detail="of ₹25k" />
      </View>

      {insight === "available" ? (
        <View style={styles.insight}>
          <Ionicons color={colors.primaryDark} name="trending-up" size={40} />
          <Text style={styles.insightTitle}>Great focus last week!</Text>
          <Text style={styles.insightBody}>You focused 2 more sessions than last week. Your mornings were strongest.</Text>
          <Surface style={styles.suggestion}>
            <Ionicons color={colors.primaryDark} name="bulb-outline" size={24} />
            <View style={styles.grow}>
              <Text style={styles.suggestionTitle}>Keep mornings for deep work.</Text>
              <Text style={styles.meta}>Protect 90–120 minutes each morning.</Text>
            </View>
          </Surface>
          <View style={styles.actions}>
            <View style={styles.grow}><PrimaryButton label="Apply" onPress={() => setInsight("applied")} /></View>
            <View style={styles.grow}><PrimaryButton label="Dismiss" onPress={() => setInsight("dismissed")} secondary /></View>
          </View>
        </View>
      ) : insight === "dismissed" ? (
        <Surface style={styles.emptyInsight}>
          <Text style={styles.suggestionTitle}>Insight dismissed</Text>
          <Pressable accessibilityRole="button" onPress={() => setInsight("available")}>
            <Text style={styles.undo}>Undo</Text>
          </Pressable>
        </Surface>
      ) : null}

      {insight === "applied" ? (
        <>
          <SectionLabel>Applied change</SectionLabel>
          <Surface style={styles.applied}>
            <Ionicons color={colors.primaryDark} name="calendar-outline" size={24} />
            <View style={styles.grow}>
              <Text style={styles.suggestionTitle}>Morning focus block</Text>
              <Text style={styles.meta}>8–10 AM weekdays</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => setInsight("available")}>
              <Text style={styles.undo}>Undo</Text>
            </Pressable>
          </Surface>
        </>
      ) : null}
    </Screen>
  );
}

function Stat({ color, detail, label, value }: { color: string; detail: string; label: string; value: string }) {
  return (
    <View style={[styles.stat, { backgroundColor: color }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.meta}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: "row", gap: spacing.sm },
  stat: { borderRadius: radii.card, flex: 1, minHeight: 112, padding: spacing.md },
  statLabel: { color: colors.text, fontSize: 12 },
  statValue: { color: colors.text, fontSize: 24, fontWeight: "700", marginTop: spacing.sm },
  meta: { color: colors.muted, fontSize: 12, marginTop: spacing.xs },
  insight: { backgroundColor: colors.lavenderSurface, borderRadius: radii.card, gap: spacing.md, padding: spacing.lg },
  insightTitle: { color: colors.text, fontSize: 22, fontWeight: "700" },
  insightBody: { color: colors.text, fontSize: 15, lineHeight: 22 },
  suggestion: { alignItems: "center", flexDirection: "row", gap: spacing.md, padding: spacing.md },
  suggestionTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  grow: { flex: 1 },
  actions: { flexDirection: "row", gap: spacing.sm },
  applied: { alignItems: "center", flexDirection: "row", gap: spacing.md, padding: spacing.md },
  emptyInsight: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", padding: spacing.md },
  undo: { color: colors.primaryDark, fontSize: 14, fontWeight: "700", minHeight: 44, paddingTop: 12 },
});
