import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Screen } from "../../src/components/Screen";
import { Mascot, PrimaryButton, Surface } from "../../src/components/ui";
import { colors, radii, spacing } from "../../src/theme";

function moneyText(value: number) {
  return `Rs ${value.toLocaleString("en-IN")}`;
}

function timeText(value?: number) {
  if (!value) return "Unscheduled";
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  const clock = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return sameDay ? clock : `${date.toLocaleDateString([], { day: "numeric", month: "short" })} ${clock}`;
}

function tomorrowAt(hour: number) {
  const next = new Date();
  next.setDate(next.getDate() + 1);
  next.setHours(hour, 0, 0, 0);
  return next.getTime();
}

export default function TodayTabScreen() {
  const today = useQuery(api.core.today);
  const completeTask = useMutation(api.core.completeTask);
  const undoCompleteTask = useMutation(api.core.undoCompleteTask);
  const scheduleTask = useMutation(api.core.scheduleTask);
  const startFocus = useMutation(api.core.startFocus);
  const updateTransaction = useMutation(api.core.updateTransaction);
  const [detailsOpen, setDetailsOpen] = useState<string | null>(null);
  const [laterOpen, setLaterOpen] = useState(false);
  const [lastCompleted, setLastCompleted] = useState<Id<"tasks"> | null>(null);

  async function startFocusSession() {
    await startFocus({});
    router.push("/focus");
  }

  async function complete(taskId: Id<"tasks">) {
    setLastCompleted(taskId);
    await completeTask({ taskId });
  }

  async function undoComplete() {
    if (!lastCompleted) return;
    await undoCompleteTask({ taskId: lastCompleted });
    setLastCompleted(null);
  }

  return (
    <Screen
      headerAction={
        <View style={styles.headerActions}>
          <Pressable accessibilityLabel="Open settings" accessibilityRole="button" onPress={() => router.push("/settings")} style={styles.settingsButton}>
            <Ionicons color={colors.text} name="settings-outline" size={21} />
          </Pressable>
          <Mascot size={52} />
        </View>
      }
      subtitle="Your ranked next actions"
      title="Today"
    >
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

      {today?.budgetAlert ? (
        <Surface style={styles.budgetAlert}>
          <Ionicons color={colors.coral} name="alert-circle-outline" size={22} />
          <View style={styles.grow}>
            <Text style={styles.cardTitle}>{moneyText(today.budgetAlert.overBy)} over budget</Text>
            <Text style={styles.meta}>
              {moneyText(today.budgetAlert.spent)} confirmed of {moneyText(today.budgetAlert.budget)}
            </Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => router.push("/(tabs)/money")} style={styles.roundAction}>
            <Ionicons color={colors.coral} name="wallet-outline" size={21} />
          </Pressable>
        </Surface>
      ) : null}

      {today?.pendingTransactions.map((transaction) => (
        <Surface key={transaction._id} style={styles.pendingExpense}>
          <Ionicons color={colors.coral} name="receipt-outline" size={22} />
          <View style={styles.grow}>
            <Text style={styles.cardTitle}>Confirm {moneyText(transaction.amount)}</Text>
            <Text style={styles.meta}>
              {transaction.merchant || transaction.category} - {transaction.paymentMethod ?? "online"}
            </Text>
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
        {today?.rankedItems.map((item) => {
          if (item.kind === "timer") {
            return (
              <Surface key={item.timer._id} style={styles.priorityCard}>
                <Rank value={item.rank} />
                <View style={styles.grow}>
                  <Text style={styles.reason}>{item.reason}</Text>
                  <Text style={styles.cardTitle}>Active focus session</Text>
                  <Text style={styles.meta}>{item.timer.status === "paused" ? "Paused" : "Running"} now</Text>
                </View>
                <Pressable accessibilityRole="button" onPress={() => router.push("/focus")} style={styles.roundAction}>
                  <Ionicons color={colors.primary} name="timer-outline" size={21} />
                </Pressable>
              </Surface>
            );
          }

          if (item.kind === "focus") {
            return (
              <Surface key="focus-target" style={styles.priorityCard}>
                <Rank value={item.rank} />
                <View style={styles.grow}>
                  <Text style={styles.reason}>{item.reason}</Text>
                  <Text style={styles.cardTitle}>{today?.focusCategory?.name ?? "Focus"} session</Text>
                  <Text style={styles.meta}>{item.progressLabel}</Text>
                </View>
                <Pressable accessibilityRole="button" onPress={startFocusSession} style={styles.roundAction}>
                  <Ionicons color={colors.primary} name="play" size={19} />
                </Pressable>
              </Surface>
            );
          }

          const expanded = detailsOpen === item.task._id;
          return (
            <Surface key={item.task._id} style={[styles.priorityCard, item.tone === "warning" && styles.warningCard]}>
              <Rank value={item.rank} />
              <View style={styles.grow}>
                <Text style={[styles.reason, item.tone === "warning" && styles.warningText]}>{item.reason}</Text>
                <Text style={styles.cardTitle}>{item.task.title}</Text>
                <Text style={styles.meta}>{timeText(item.task.scheduledAt)}</Text>
                {expanded ? (
                  <View style={styles.details}>
                    {item.task.location ? <Text style={styles.meta}>{item.task.location}</Text> : null}
                    {item.task.meetingLink ? <Text style={styles.meta}>{item.task.meetingLink}</Text> : null}
                    {item.task.note ? <Text style={styles.meta}>{item.task.note}</Text> : null}
                    {!item.task.location && !item.task.meetingLink && !item.task.note ? (
                      <Text style={styles.meta}>No extra details.</Text>
                    ) : null}
                  </View>
                ) : null}
                <View style={styles.inlineActions}>
                  <Pressable accessibilityRole="button" onPress={() => setDetailsOpen(expanded ? null : item.task._id)}>
                    <Text style={styles.link}>{expanded ? "Hide" : "Details"}</Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" onPress={() => scheduleTask({ scheduledAt: tomorrowAt(9), taskId: item.task._id })}>
                    <Text style={styles.link}>Reschedule</Text>
                  </Pressable>
                </View>
              </View>
              <Pressable accessibilityLabel="Complete task" accessibilityRole="button" onPress={() => complete(item.task._id)} style={styles.roundAction}>
                <Ionicons color={colors.primary} name="checkmark" size={21} />
              </Pressable>
            </Surface>
          );
        })}
      </View>

      {lastCompleted ? (
        <Surface style={styles.undoToast}>
          <Text style={styles.cardTitle}>Task completed</Text>
          <Pressable accessibilityRole="button" onPress={undoComplete}>
            <Text style={styles.link}>Undo</Text>
          </Pressable>
        </Surface>
      ) : null}

      {!today?.rankedItems.length && !today?.laterToday.length ? (
        <Surface style={styles.empty}>
          <Mascot size={72} variant="complete" />
          <View style={styles.grow}>
            <Text style={styles.cardTitle}>Nothing needs ranking</Text>
            <Text style={styles.meta}>Add one planned task when you want Today to guide you.</Text>
          </View>
          <View style={styles.emptyAction}>
            <PrimaryButton label="Add task" onPress={() => router.push("/quick-add")} />
          </View>
        </Surface>
      ) : null}

      {today?.laterToday.length ? (
        <Surface>
          <Pressable accessibilityRole="button" onPress={() => setLaterOpen((open) => !open)} style={styles.laterRow}>
            <Ionicons color={colors.muted} name="time-outline" size={20} />
            <View style={styles.grow}>
              <Text style={styles.cardTitle}>Later today</Text>
              <Text style={styles.meta}>{today.laterToday.length} tasks</Text>
            </View>
            <Ionicons color={colors.muted} name={laterOpen ? "chevron-up" : "chevron-down"} size={18} />
          </Pressable>
          {laterOpen ? (
            <View style={styles.laterDetails}>
              {today.laterToday.map(({ reason, task }) => (
                <Text key={task._id} style={styles.laterTask}>
                  {task.title} - {reason} - {timeText(task.scheduledAt)}
                </Text>
              ))}
            </View>
          ) : null}
        </Surface>
      ) : null}
    </Screen>
  );
}

function Rank({ value }: { value: number }) {
  return (
    <View style={styles.rank}>
      <Text style={styles.rankText}>{value}</Text>
    </View>
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
  headerActions: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  settingsButton: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.pill, borderWidth: 1, height: 44, justifyContent: "center", width: 44 },
  budgetAlert: { alignItems: "center", backgroundColor: colors.coralSurface, flexDirection: "row", gap: spacing.md, minHeight: 76, padding: spacing.md },
  cardStack: { gap: spacing.md },
  pendingExpense: { alignItems: "center", backgroundColor: colors.coralSurface, flexDirection: "row", gap: spacing.md, minHeight: 76, padding: spacing.md },
  priorityCard: { alignItems: "center", flexDirection: "row", gap: spacing.md, minHeight: 100, padding: spacing.md },
  warningCard: { backgroundColor: colors.coralSurface },
  rank: { alignItems: "center", height: 34, justifyContent: "center", width: 26 },
  rankText: { color: colors.text, fontSize: 22, fontWeight: "700" },
  grow: { flex: 1 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 12, marginTop: spacing.xs },
  reason: { color: colors.primaryDark, fontSize: 12, fontWeight: "700", marginBottom: spacing.xs },
  warningText: { color: colors.coral },
  details: { marginTop: spacing.xs },
  link: { color: colors.primaryDark, fontSize: 14, fontWeight: "700" },
  inlineActions: { flexDirection: "row", gap: spacing.md, marginTop: spacing.sm, minHeight: 32 },
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
  undoToast: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", padding: spacing.md },
  empty: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: spacing.md, padding: spacing.md },
  emptyAction: { minWidth: 120 },
  laterRow: { alignItems: "center", flexDirection: "row", gap: spacing.md, minHeight: 72, padding: spacing.md },
  laterDetails: { borderTopColor: colors.border, borderTopWidth: 1, padding: spacing.md },
  laterTask: { color: colors.muted, fontSize: 14, paddingVertical: spacing.sm },
});
