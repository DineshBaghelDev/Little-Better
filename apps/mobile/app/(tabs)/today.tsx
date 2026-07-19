import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { api } from "../../convex/_generated/api";
import { Screen } from "../../src/components/Screen";
import { Mascot, Surface } from "../../src/components/ui";
import { colors, radii, spacing } from "../../src/theme";

export default function TodayTabScreen() {
  const today = useQuery(api.core.today);
  const completeTask = useMutation(api.core.completeTask);
  const startFocus = useMutation(api.core.startFocus);
  const updateTransaction = useMutation(api.core.updateTransaction);
  const [laterOpen, setLaterOpen] = useState(false);
  const target = today?.focusCategory?.targetValue ?? 3;
  const topTasks = today?.plannedTasks.slice(0, today.activeTimer ? 2 : 3) ?? [];
  const laterTasks = today?.plannedTasks.slice(topTasks.length) ?? [];

  async function startFocusSession() {
    await startFocus({});
    router.push("/focus");
  }

  return (
    <Screen headerAction={<Mascot size={52} />} subtitle="Your ranked next actions" title="Today">
      {today?.reflectionDue ? (
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
      ) : null}

      {today?.pendingTransactions.map((transaction) => (
        <Surface key={transaction._id} style={styles.pendingExpense}>
          <Ionicons color={colors.coral} name="receipt-outline" size={22} />
          <View style={styles.grow}>
            <Text style={styles.cardTitle}>{transaction.category}</Text>
            <Text style={styles.meta}>Pending expense · Rs {transaction.amount.toLocaleString("en-IN")}</Text>
          </View>
          <Pressable
            accessibilityLabel={`Confirm ${transaction.category} expense`}
            accessibilityRole="button"
            onPress={() => updateTransaction({ status: "confirmed", transactionId: transaction._id })}
            style={styles.roundAction}
          >
            <Ionicons color={colors.primary} name="checkmark" size={21} />
          </Pressable>
        </Surface>
      ))}

      <View style={styles.cardStack}>
        {today?.activeTimer ? (
          <Surface style={[styles.priorityCard, { backgroundColor: colors.lavenderSurface }]}>
            <View style={styles.rank}>
              <Text style={styles.rankText}>1</Text>
            </View>
            <View style={styles.grow}>
              <Text style={styles.cardTitle}>Active focus session</Text>
              <Text style={styles.meta}>
                {today.activeTimer.status === "paused" ? "Paused" : "Running"} now
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Open focus session"
              accessibilityRole="button"
              onPress={() => router.push("/focus")}
              style={styles.roundAction}
            >
              <Ionicons color={colors.primary} name="timer-outline" size={21} />
            </Pressable>
          </Surface>
        ) : null}

        {topTasks.map((task, index) => (
          <Surface key={task._id} style={[styles.priorityCard, { backgroundColor: colors.coralSurface }]}>
            <View style={styles.rank}>
              <Text style={styles.rankText}>{index + 1 + (today?.activeTimer ? 1 : 0)}</Text>
            </View>
            <View style={styles.grow}>
              <Text style={styles.cardTitle}>{task.title}</Text>
              <Text style={styles.meta}>
                {task.scheduledAt
                  ? new Date(task.scheduledAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "Unscheduled"}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Complete task"
              accessibilityRole="button"
              onPress={() => completeTask({ taskId: task._id })}
              style={styles.roundAction}
            >
              <Ionicons color={colors.primary} name="checkmark" size={21} />
            </Pressable>
          </Surface>
        ))}

        <Surface style={[styles.priorityCard, { backgroundColor: colors.sageSurface }]}>
          <View style={styles.rank}>
            <Text style={styles.rankText}>{topTasks.length + 1 + (today?.activeTimer ? 1 : 0)}</Text>
          </View>
          <View style={styles.grow}>
            <Text style={styles.cardTitle}>{today?.focusCategory?.name ?? "Focus"} session</Text>
            <Text style={styles.meta}>
              {today?.focusSessionsThisWeek ?? 0} of {target} sessions this week
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Start focus session"
            accessibilityRole="button"
            onPress={startFocusSession}
            style={styles.roundAction}
          >
            <Ionicons color={colors.primary} name="play" size={19} />
          </Pressable>
        </Surface>
      </View>

      {topTasks.length === 0 && !today?.activeTimer ? (
        <Surface style={styles.empty}>
          <Mascot size={72} />
          <View style={styles.grow}>
            <Text style={styles.cardTitle}>No tasks yet</Text>
            <Text style={styles.meta}>Add one thing to make Today useful.</Text>
          </View>
        </Surface>
      ) : null}

      {laterTasks.length > 0 ? (
        <Surface>
          <Pressable
            accessibilityRole="button"
            onPress={() => setLaterOpen((open) => !open)}
            style={styles.laterRow}
          >
            <Ionicons color={colors.muted} name="time-outline" size={20} />
            <View style={styles.grow}>
              <Text style={styles.cardTitle}>Later today</Text>
              <Text style={styles.meta}>{laterTasks.length} tasks</Text>
            </View>
            <Ionicons color={colors.muted} name={laterOpen ? "chevron-up" : "chevron-down"} size={18} />
          </Pressable>
          {laterOpen ? (
            <View style={styles.laterDetails}>
              {laterTasks.map((task) => (
                <Text key={task._id} style={styles.laterTask}>
                  {task.title}
                </Text>
              ))}
            </View>
          ) : null}
        </Surface>
      ) : null}
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
  pendingExpense: { alignItems: "center", backgroundColor: colors.coralSurface, flexDirection: "row", gap: spacing.md, minHeight: 76, padding: spacing.md },
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
  empty: { alignItems: "center", flexDirection: "row", gap: spacing.md, padding: spacing.md },
  laterRow: { alignItems: "center", flexDirection: "row", gap: spacing.md, minHeight: 72, padding: spacing.md },
  laterDetails: { borderTopColor: colors.border, borderTopWidth: 1, padding: spacing.md },
  laterTask: { color: colors.muted, fontSize: 14, paddingVertical: spacing.sm },
});
