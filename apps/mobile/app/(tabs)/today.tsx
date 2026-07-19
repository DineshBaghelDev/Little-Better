import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "../../src/components/Screen";
import { Mascot, Surface } from "../../src/components/ui";
import { colors, radii, spacing } from "../../src/theme";

export default function TodayTabScreen() {
  const [taskDone, setTaskDone] = useState(false);
  const [laterOpen, setLaterOpen] = useState(false);

  return (
    <Screen
      headerAction={<Mascot size={52} />}
      subtitle="Sunday, July 19"
      title="Today"
    >
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/reflection")}
        style={styles.reflectionPrompt}
      >
        <Ionicons color={colors.text} name="heart-outline" size={22} />
        <View style={styles.grow}>
          <Text style={styles.cardTitle}>How did today feel?</Text>
          <Text style={styles.meta}>Your evening reflection is ready</Text>
        </View>
        <Text style={styles.link}>Reflect</Text>
      </Pressable>

      <View style={styles.cardStack}>
        <Surface style={[styles.priorityCard, { backgroundColor: colors.coralSurface }]}>
          <View style={styles.rank}><Text style={styles.rankText}>1</Text></View>
          <View style={styles.grow}>
            <Text style={styles.cardTitle}>{taskDone ? "Task complete" : "Finish project outline"}</Text>
            <Text style={styles.meta}>{taskDone ? "Nice work — undone anytime" : "Due today · 25 minutes"}</Text>
          </View>
          <Pressable
            accessibilityLabel={taskDone ? "Undo task completion" : "Complete task"}
            accessibilityRole="button"
            onPress={() => setTaskDone((done) => !done)}
            style={[styles.roundAction, taskDone && styles.roundActionDone]}
          >
            <Ionicons color={taskDone ? colors.surface : colors.primary} name={taskDone ? "checkmark" : "arrow-forward"} size={21} />
          </Pressable>
        </Surface>

        <Surface style={[styles.priorityCard, { backgroundColor: colors.sageSurface }]}>
          <View style={styles.rank}><Text style={styles.rankText}>2</Text></View>
          <View style={styles.grow}>
            <Text style={styles.cardTitle}>Focus session</Text>
            <Text style={styles.meta}>2 of 3 sessions this week</Text>
          </View>
          <Pressable
            accessibilityLabel="Start focus session"
            accessibilityRole="button"
            onPress={() => router.push("/focus")}
            style={styles.roundAction}
          >
            <Ionicons color={colors.primary} name="play" size={19} />
          </Pressable>
        </Surface>

        <Surface style={[styles.priorityCard, { backgroundColor: colors.lavenderSurface }]}>
          <View style={styles.rank}><Text style={styles.rankText}>3</Text></View>
          <View style={styles.grow}>
            <Text style={styles.cardTitle}>Walk 20 minutes</Text>
            <Text style={styles.meta}>3 of 7 days</Text>
          </View>
          <Ionicons color={colors.primaryDark} name="walk-outline" size={26} />
        </Surface>
      </View>

      <Surface>
        <Pressable
          accessibilityRole="button"
          onPress={() => setLaterOpen((open) => !open)}
          style={styles.laterRow}
        >
          <Ionicons color={colors.muted} name="time-outline" size={20} />
          <View style={styles.grow}>
            <Text style={styles.cardTitle}>Later today</Text>
            <Text style={styles.meta}>2 tasks</Text>
          </View>
          <Ionicons color={colors.muted} name={laterOpen ? "chevron-up" : "chevron-down"} size={18} />
        </Pressable>
        {laterOpen ? (
          <View style={styles.laterDetails}>
            <Text style={styles.laterTask}>Call Mom · 6:30 PM</Text>
            <Text style={styles.laterTask}>Prepare tomorrow’s bag · 8:00 PM</Text>
          </View>
        ) : null}
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  reflectionPrompt: {
    alignItems: "center",
    backgroundColor: colors.mustardSurface,
    borderColor: colors.border,
    borderRadius: radii.card,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 76,
    padding: spacing.md,
  },
  cardStack: { gap: spacing.md },
  priorityCard: { alignItems: "center", flexDirection: "row", gap: spacing.md, minHeight: 100, padding: spacing.md },
  rank: { alignItems: "center", height: 34, justifyContent: "center", width: 26 },
  rankText: { color: colors.text, fontSize: 22, fontWeight: "700" },
  grow: { flex: 1 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 12, marginTop: spacing.xs },
  link: { color: colors.primaryDark, fontSize: 14, fontWeight: "700" },
  roundAction: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  roundActionDone: { backgroundColor: colors.primary },
  laterRow: { alignItems: "center", flexDirection: "row", gap: spacing.md, minHeight: 72, padding: spacing.md },
  laterDetails: { borderTopColor: colors.border, borderTopWidth: 1, padding: spacing.md },
  laterTask: { color: colors.muted, fontSize: 14, paddingVertical: spacing.sm },
});
