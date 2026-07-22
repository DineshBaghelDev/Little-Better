import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { DatePickerField, dateInput } from "../../src/components/DatePickerField";
import { Screen } from "../../src/components/Screen";
import { Chip, Mascot, PrimaryButton, SectionLabel, Surface, useAppearance } from "../../src/components/ui";
import { colors, radii, spacing } from "../../src/theme";

type RangePreset = "day" | "week" | "month" | "year" | "custom";

const DAY = 24 * 60 * 60 * 1000;

function rangeFor(preset: RangePreset, customFrom: string, customTo: string) {
  const now = new Date();
  const start = new Date(now);
  if (preset === "day") start.setHours(0, 0, 0, 0);
  if (preset === "week") start.setTime(now.getTime() - 6 * DAY);
  if (preset === "month") start.setFullYear(now.getFullYear(), now.getMonth(), 1);
  if (preset === "year") start.setFullYear(now.getFullYear(), 0, 1);
  if (preset === "custom") {
    const from = new Date(`${customFrom}T00:00:00`).getTime();
    const to = new Date(`${customTo}T23:59:59`).getTime();
    return { from: Number.isFinite(from) ? from : now.getTime(), to: Number.isFinite(to) ? to : now.getTime() };
  }
  return { from: start.getTime(), to: now.getTime() };
}

function moneyText(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function ProgressScreen() {
  const [preset, setPreset] = useState<RangePreset>("week");
  const [customFrom, setCustomFrom] = useState(dateInput(Date.now() - 6 * DAY));
  const [customTo, setCustomTo] = useState(dateInput(Date.now()));
  const [editingInsight, setEditingInsight] = useState(false);
  const [editHour, setEditHour] = useState("");
  const appearance = useAppearance();
  const range = useMemo(() => rangeFor(preset, customFrom, customTo), [customFrom, customTo, preset]);
  const insights = useQuery(api.core.insights, range);
  const applyWeeklyInsight = useMutation(api.core.applyWeeklyInsight);
  const dismissWeeklyInsight = useMutation(api.core.dismissWeeklyInsight);
  const setWeeklyInsightStatus = useMutation(api.core.setWeeklyInsightStatus);
  const undoWeeklyInsight = useMutation(api.core.undoWeeklyInsight);
  const currentInsight = insights?.currentInsight;
  const currentInsightStatus = currentInsight?.status;
  const maxCategory = Math.max(1, ...(insights?.categorySummary.map((item) => item.amount) ?? [1]));
  const maxReflection = Math.max(1, ...(insights?.reflectionSummary.map((item) => item.count) ?? [1]));

  useEffect(() => {
    setEditHour(currentInsight?.actionHour === undefined ? "" : String(currentInsight.actionHour));
    setEditingInsight(false);
  }, [currentInsight?.actionHour, currentInsight?.observation]);

  async function applyInsight() {
    if (!currentInsight) return;
    const actionHour = Number(editHour || currentInsight.actionHour);
    if (!Number.isFinite(actionHour)) return;
    await applyWeeklyInsight({
      actionHour,
      evidence: currentInsight.evidence,
      insightId: currentInsight._id,
      observation: currentInsight.observation,
      suggestedAction: currentInsight.suggestedAction,
    });
  }

  async function dismissInsight() {
    if (!currentInsight) return;
    await dismissWeeklyInsight({
      actionHour: currentInsight.actionHour,
      evidence: currentInsight.evidence,
      insightId: currentInsight._id,
      observation: currentInsight.observation,
      suggestedAction: currentInsight.suggestedAction,
    });
  }

  async function restoreDismissed(insightId?: Id<"weeklyInsights">) {
    if (insightId) await setWeeklyInsightStatus({ insightId, status: "new" });
  }

  return (
    <Screen subtitle="History and one weekly improvement" title="Progress">
      <View style={styles.chips}>
        {(["day", "week", "month", "year", "custom"] as const).map((item) => (
          <Chip
            key={item}
            label={item === "day" ? "Daily" : item === "custom" ? "Custom" : `${item[0].toUpperCase()}${item.slice(1)}ly`}
            selected={preset === item}
            onPress={() => setPreset(item)}
          />
        ))}
      </View>

      {preset === "custom" ? (
        <View style={styles.dateRow}>
          <View style={styles.grow}>
            <DatePickerField label="From" onChange={setCustomFrom} value={customFrom} />
          </View>
          <View style={styles.grow}>
            <DatePickerField label="To" onChange={setCustomTo} value={customTo} />
          </View>
        </View>
      ) : null}

      <View style={styles.stats}>
        <Stat color={colors.sageSurface} label={insights?.focusCategoryName ?? "Focus"} value={`${insights?.focusSessions ?? 0}`} detail={`${insights?.focusMinutes ?? 0} minutes`} />
        <Stat color={colors.lavenderSurface} label="Task" value={`${insights?.completedTasks ?? 0}`} detail="completed" />
        <Stat color={colors.mustardSurface} label="Spent" value={moneyText(insights?.spent ?? 0)} detail="confirmed" wide />
      </View>

      <View style={styles.metricRow}>
        <Metric label="Active days" value={`${insights?.activeDays ?? 0}`} />
        <Metric label="Avg session" value={`${insights?.avgSessionMinutes ?? 0} min`} />
        <Metric label="Spend / day" value={moneyText(insights?.avgSpendPerDay ?? 0)} />
      </View>

      <SectionLabel>Focus over time</SectionLabel>
      <Surface style={styles.trendCard}>
        <TrendChart accent={appearance.primary} trend={insights?.trend ?? []} />
      </Surface>

      <SectionLabel>Money</SectionLabel>
      <Surface style={styles.moneyCard}>
        <View style={styles.moneyRow}>
          <MoneyStat color={colors.primaryDark} label="Income" value={`+${moneyText(insights?.income ?? 0)}`} />
          <MoneyStat color={colors.coral} label="Expense" value={`-${moneyText(insights?.spent ?? 0)}`} />
          <MoneyStat color={(insights?.net ?? 0) >= 0 ? colors.primaryDark : colors.coral} label="Net" value={`${(insights?.net ?? 0) >= 0 ? "+" : "-"}${moneyText(Math.abs(insights?.net ?? 0))}`} />
        </View>
        <View style={styles.moneyDivider} />
        {(insights?.categorySummary ?? []).map((item) => (
          <View key={item.category} style={styles.barRow}>
            <View style={styles.barLabel}>
              <Text style={styles.suggestionTitle}>{item.category}</Text>
              <Text style={styles.meta}>{moneyText(item.amount)} · {Math.round((item.amount / Math.max(1, insights?.spent ?? 1)) * 100)}%</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { backgroundColor: appearance.primary, width: `${Math.max(6, Math.round((item.amount / maxCategory) * 100))}%` as `${number}%` }]} />
            </View>
          </View>
        ))}
        {insights?.categorySummary.length === 0 ? <Text style={styles.emptyText}>No confirmed expenses in this range.</Text> : null}
      </Surface>

      {currentInsight && currentInsightStatus === "new" ? (
        <View style={styles.insight}>
          <Mascot size={124} variant="proud" />
          <Text style={styles.insightTitle}>{currentInsight.observation}</Text>
          <Text style={styles.insightBody}>{currentInsight.evidence}</Text>
          <Surface style={styles.suggestion}>
            <Ionicons color={colors.primaryDark} name="bulb-outline" size={24} />
            <View style={styles.grow}>
              <Text style={styles.suggestionTitle}>{currentInsight.suggestedAction}</Text>
              <Text style={styles.meta}>Apply updates your focus reminder and keeps Undo here.</Text>
            </View>
          </Surface>
          {editingInsight ? (
            <TextInput
              accessibilityLabel="Suggested focus reminder hour"
              keyboardType="number-pad"
              onChangeText={setEditHour}
              placeholder="Hour, 0 to 23"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={editHour}
            />
          ) : null}
          <View style={styles.actions}>
            <View style={styles.grow}><PrimaryButton label="Apply" onPress={applyInsight} /></View>
            <View style={styles.grow}><PrimaryButton label="Edit" onPress={() => setEditingInsight((open) => !open)} secondary /></View>
            <View style={styles.grow}><PrimaryButton label="Dismiss" onPress={dismissInsight} secondary /></View>
          </View>
        </View>
      ) : currentInsight && currentInsightStatus === "dismissed" ? (
        <Surface style={styles.emptyInsight}>
          <Mascot size={104} variant="relaxed" />
          <Text style={styles.suggestionTitle}>Insight dismissed</Text>
          <Pressable accessibilityRole="button" onPress={() => restoreDismissed(currentInsight._id)}>
            <Text style={styles.undo}>Undo</Text>
          </Pressable>
        </Surface>
      ) : !currentInsight ? (
        <Surface style={styles.emptyInsight}>
          <Mascot size={112} variant="working" />
          <Text style={styles.suggestionTitle}>Not enough data yet</Text>
          <Text style={styles.meta}>{insights?.insightRequirement ?? "Record 5 focus sessions for a weekly insight."}</Text>
        </Surface>
      ) : null}

      {insights?.appliedInsight ? (
        <>
          <SectionLabel>Applied change</SectionLabel>
          <Surface style={styles.applied}>
            <Ionicons color={colors.primaryDark} name="calendar-outline" size={24} />
            <View style={styles.grow}>
              <Text style={styles.suggestionTitle}>{insights.appliedInsight.suggestedAction}</Text>
              <Text style={styles.meta}>Visible and reversible</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => undoWeeklyInsight({ insightId: insights.appliedInsight._id })}>
              <Text style={styles.undo}>Undo</Text>
            </Pressable>
          </Surface>
        </>
      ) : null}

      <SectionLabel>How your days felt</SectionLabel>
      <Surface style={styles.list}>
        {(insights?.reflectionSummary ?? []).map((item) => (
          <View key={item.tag} style={styles.barRow}>
            <View style={styles.barLabel}>
              <Text style={styles.suggestionTitle}>{item.tag}</Text>
              <Text style={styles.meta}>{item.count} {item.count === 1 ? "day" : "days"}</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { backgroundColor: colors.lavender, width: `${Math.max(6, Math.round((item.count / maxReflection) * 100))}%` as `${number}%` }]} />
            </View>
          </View>
        ))}
        {insights?.reflectionSummary.length === 0 ? <Text style={styles.emptyText}>No reflections in this range yet.</Text> : null}
      </Surface>
    </Screen>
  );
}

function Stat({ color, detail, label, value, wide = false }: { color: string; detail: string; label: string; value: string; wide?: boolean }) {
  return (
    <View style={[styles.stat, wide && styles.statWide, { backgroundColor: color }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text adjustsFontSizeToFit numberOfLines={1} style={styles.statValue}>{value}</Text>
      <Text style={styles.meta}>{detail}</Text>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text adjustsFontSizeToFit numberOfLines={1} style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function MoneyStat({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <View style={styles.moneyStat}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.moneyStatValue, { color }]}>{value}</Text>
    </View>
  );
}

function trendLabel(start: number, bucketMs: number) {
  const date = new Date(start);
  if (bucketMs <= DAY) return date.toLocaleDateString([], { weekday: "short" }).slice(0, 2);
  if (bucketMs <= 7 * DAY) return `${date.getDate()}/${date.getMonth() + 1}`;
  return date.toLocaleDateString([], { month: "short" });
}

function TrendChart({ accent, trend }: { accent: string; trend: { bucketMs: number; minutes: number; sessions: number; start: number }[] }) {
  const maxMinutes = Math.max(1, ...trend.map((bucket) => bucket.minutes));
  const total = trend.reduce((sum, bucket) => sum + bucket.minutes, 0);
  if (!total) {
    return <Text style={styles.emptyText}>No focus sessions in this range yet. Start one from Today.</Text>;
  }
  return (
    <>
      <View style={styles.chart}>
        {trend.map((bucket) => (
          <View key={bucket.start} style={styles.chartCol}>
            <View style={styles.chartBarTrack}>
              <View style={[styles.chartBar, { backgroundColor: accent, height: `${Math.max(3, Math.round((bucket.minutes / maxMinutes) * 100))}%` as `${number}%` }]} />
            </View>
            <Text numberOfLines={1} style={styles.chartLabel}>{trendLabel(bucket.start, bucket.bucketMs)}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.chartCaption}>{total} focus minutes total</Text>
    </>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  dateRow: { flexDirection: "row", gap: spacing.sm, position: "relative", zIndex: 20 },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  stat: { borderRadius: radii.card, flexGrow: 1, minHeight: 112, padding: spacing.md, width: "47%" },
  statWide: { width: "100%" },
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
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.control, borderWidth: 1, color: colors.text, fontSize: 15, minHeight: 48, paddingHorizontal: spacing.md },
  applied: { alignItems: "center", flexDirection: "row", gap: spacing.md, padding: spacing.md },
  emptyInsight: { alignItems: "center", gap: spacing.sm, padding: spacing.lg },
  undo: { color: colors.primaryDark, fontSize: 14, fontWeight: "700", minHeight: 44, paddingTop: 12 },
  list: { gap: spacing.md, padding: spacing.md },
  row: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  barRow: { gap: spacing.sm },
  barLabel: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  barTrack: { backgroundColor: colors.sageSurface, borderRadius: radii.pill, height: 10, overflow: "hidden" },
  barFill: { backgroundColor: colors.primary, height: "100%" },
  emptyText: { color: colors.muted, fontSize: 14, padding: spacing.md },
  metricRow: { flexDirection: "row", gap: spacing.sm },
  metric: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.card, borderWidth: 1, flex: 1, gap: 2, paddingHorizontal: spacing.xs, paddingVertical: spacing.md },
  metricValue: { color: colors.text, fontSize: 18, fontWeight: "700" },
  metricLabel: { color: colors.muted, fontSize: 11, textAlign: "center" },
  trendCard: { gap: spacing.sm, padding: spacing.md },
  chart: { alignItems: "flex-end", flexDirection: "row", gap: spacing.xs, height: 120, justifyContent: "space-between" },
  chartCol: { alignItems: "center", flex: 1, gap: spacing.xs, height: "100%", justifyContent: "flex-end" },
  chartBarTrack: { alignItems: "center", flex: 1, justifyContent: "flex-end", width: "100%" },
  chartBar: { borderRadius: radii.pill, minHeight: 4, width: "72%" },
  chartLabel: { color: colors.muted, fontSize: 10 },
  chartCaption: { color: colors.muted, fontSize: 12, fontWeight: "600", textAlign: "center" },
  moneyCard: { gap: spacing.md, padding: spacing.md },
  moneyRow: { flexDirection: "row", gap: spacing.sm },
  moneyStat: { flex: 1, gap: 2 },
  moneyStatValue: { fontSize: 16, fontWeight: "700" },
  moneyDivider: { backgroundColor: colors.border, height: 1 },
});
