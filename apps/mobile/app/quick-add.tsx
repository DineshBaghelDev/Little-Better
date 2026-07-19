import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { CategoryDropdown } from "../src/components/CategoryDropdown";
import { DatePickerField, dateInput } from "../src/components/DatePickerField";
import { PrimaryButton, Surface } from "../src/components/ui";
import { colors, radii, spacing } from "../src/theme";

const types = [
  ["Task", "Action or to-do", "checkbox-outline", colors.lavenderSurface],
  ["Expense", "Spend or purchase", "cash-outline", colors.sageSurface],
  ["Focus", "Start or log focus", "timer-outline", colors.lavenderSurface],
  ["Note", "Save as a task note", "document-text-outline", colors.mustardSurface],
  ["Voice", "Type the captured words", "mic-outline", colors.coralSurface],
] as const;

export default function QuickAddModal() {
  const ensureMoneyDefaults = useMutation(api.core.ensureMoneyDefaults);
  const addTask = useMutation(api.core.addTask);
  const addExpense = useMutation(api.core.addExpense);
  const removeCategory = useMutation(api.core.removeCategory);
  const addManualFocus = useMutation(api.core.addManualFocus);
  const startFocus = useMutation(api.core.startFocus);
  const money = useQuery(api.core.money, {});
  const [selected, setSelected] = useState<string | null>(null);
  const [expense, setExpense] = useState({
    accountId: undefined as Id<"accounts"> | undefined,
    amount: "",
    category: "Food",
    date: dateInput(Date.now()),
    merchant: "",
    note: "",
    paymentMethod: "online" as "cash" | "online",
    type: "expense" as "expense" | "income",
  });
  const [focusDuration, setFocusDuration] = useState({ hours: "", minutes: "30" });
  const [task, setTask] = useState({ location: "", meetingLink: "", note: "", title: "" });
  const [value, setValue] = useState("");

  useEffect(() => {
    void ensureMoneyDefaults({});
  }, [ensureMoneyDefaults]);

  function expenseDate() {
    const [year, month, day] = expense.date.split("-").map(Number);
    return year && month && day ? new Date(year, month - 1, day).getTime() : undefined;
  }

  async function save() {
    const text = value.trim();
    if (selected === "Focus") {
      const minutes = (Number(focusDuration.hours) || 0) * 60 + (Number(focusDuration.minutes) || 0);
      if (minutes > 0) await addManualFocus({ minutes });
      else await startFocus({});
      router.back();
      return;
    }
    if (selected === "Expense") {
      const amount = Number(expense.amount);
      const accountId = expense.accountId ?? money?.accounts[0]?._id;
      if (!Number.isFinite(amount) || amount <= 0 || !accountId) return;
      await addExpense({
        accountId,
        amount,
        category: expense.category || "General",
        merchant: expense.merchant,
        note: expense.note,
        occurredAt: expenseDate(),
        paymentMethod: expense.paymentMethod,
        type: expense.type,
      });
    } else if (selected === "Task") {
      if (!task.title.trim()) return;
      await addTask({
        location: task.location,
        meetingLink: task.meetingLink,
        note: task.note,
        title: task.title,
      });
    } else {
      if (!text) return;
      await addTask({ title: text });
    }
    router.back();
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.overlay}>
      <Pressable accessibilityLabel="Close quick add" onPress={() => router.back()} style={styles.scrim} />
      <SafeAreaView edges={["bottom"]} style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.headingRow}>
          <View>
            <Text style={styles.title}>What would you like to add?</Text>
            <Text style={styles.subtitle}>Captured items update Today.</Text>
          </View>
          <Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={() => router.back()} style={styles.close}>
            <Ionicons color={colors.text} name="close" size={22} />
          </Pressable>
        </View>

        {selected ? (
          <View style={styles.confirmation}>
            <Text style={styles.selectedLabel}>{selected}</Text>
            {selected === "Expense" ? (
              <>
                <View style={styles.chips}>
                  <Chip label="Expense" selected={expense.type === "expense"} onPress={() => setExpense((current) => ({ ...current, category: "Food", type: "expense" }))} />
                  <Chip label="Income" selected={expense.type === "income"} onPress={() => setExpense((current) => ({ ...current, category: "Salary", type: "income" }))} />
                  <Chip label="Online" selected={expense.paymentMethod === "online"} onPress={() => setExpense((current) => ({ ...current, paymentMethod: "online" }))} />
                  <Chip label="Cash" selected={expense.paymentMethod === "cash"} onPress={() => setExpense((current) => ({ ...current, paymentMethod: "cash" }))} />
                </View>
                <View style={styles.chips}>
                  {(money?.accounts ?? []).map((account) => (
                    <Chip key={account._id} label={account.name} selected={(expense.accountId ?? money?.accounts[0]?._id) === account._id} onPress={() => setExpense((current) => ({ ...current, accountId: account._id }))} />
                  ))}
                </View>
                <TextInput
                  accessibilityLabel="Expense amount"
                  autoFocus
                  keyboardType="decimal-pad"
                  onChangeText={(amount) => setExpense((current) => ({ ...current, amount }))}
                  placeholder="Amount"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={expense.amount}
                />
                <TextInput
                  accessibilityLabel="Merchant"
                  onChangeText={(merchant) => setExpense((current) => ({ ...current, merchant }))}
                  placeholder="Merchant (optional)"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={expense.merchant}
                />
                <CategoryDropdown
                  categories={money?.categories.filter((item) => item.type === expense.type) ?? []}
                  onDelete={(categoryId) => removeCategory({ categoryId: categoryId as Id<"transactionCategories"> })}
                  onSelect={(category) => setExpense((current) => ({ ...current, category }))}
                  selected={expense.category}
                />
                <DatePickerField label="Expense date" onChange={(date) => setExpense((current) => ({ ...current, date }))} value={expense.date} />
                <TextInput
                  accessibilityLabel="Expense note"
                  onChangeText={(note) => setExpense((current) => ({ ...current, note }))}
                  placeholder="Note (optional)"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={expense.note}
                />
              </>
            ) : selected === "Task" ? (
              <>
                <TextInput
                  accessibilityLabel="Task title"
                  autoFocus
                  onChangeText={(title) => setTask((current) => ({ ...current, title }))}
                  placeholder="Task title"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={task.title}
                />
                <TextInput
                  accessibilityLabel="Task location"
                  onChangeText={(location) => setTask((current) => ({ ...current, location }))}
                  placeholder="Location (optional)"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={task.location}
                />
                <TextInput
                  accessibilityLabel="Meeting link"
                  autoCapitalize="none"
                  onChangeText={(meetingLink) => setTask((current) => ({ ...current, meetingLink }))}
                  placeholder="Meeting link (optional)"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={task.meetingLink}
                />
                <TextInput
                  accessibilityLabel="Task note"
                  onChangeText={(note) => setTask((current) => ({ ...current, note }))}
                  placeholder="Notes (optional)"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={task.note}
                />
              </>
            ) : selected === "Focus" ? (
              <View style={styles.inline}>
                <TextInput
                  accessibilityLabel="Focus hours"
                  autoFocus
                  keyboardType="number-pad"
                  onChangeText={(hours) => setFocusDuration((current) => ({ ...current, hours }))}
                  placeholder="Hours"
                  placeholderTextColor={colors.muted}
                  style={[styles.input, styles.grow]}
                  value={focusDuration.hours}
                />
                <TextInput
                  accessibilityLabel="Focus minutes"
                  keyboardType="number-pad"
                  onChangeText={(minutes) => setFocusDuration((current) => ({ ...current, minutes }))}
                  placeholder="Minutes"
                  placeholderTextColor={colors.muted}
                  style={[styles.input, styles.grow]}
                  value={focusDuration.minutes}
                />
              </View>
            ) : (
              <TextInput
                accessibilityLabel={`${selected} details`}
                autoFocus
                onChangeText={setValue}
                placeholder={`Describe your ${selected.toLowerCase()}`}
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={value}
              />
            )}
            <PrimaryButton label={selected === "Focus" || selected === "Expense" || selected === "Task" || value.trim() ? `Save ${selected.toLowerCase()}` : "Add details"} onPress={save} />
            <Pressable accessibilityRole="button" onPress={() => setSelected(null)} style={styles.changeType}>
              <Text style={styles.changeTypeText}>Choose another type</Text>
            </Pressable>
          </View>
        ) : (
          <Surface>
            {types.map(([title, detail, icon, background]) => (
              <Pressable accessibilityRole="button" key={title} onPress={() => setSelected(title)} style={styles.typeRow}>
                <View style={[styles.typeIcon, { backgroundColor: background }]}>
                  <Ionicons color={colors.primaryDark} name={icon} size={22} />
                </View>
                <View style={styles.grow}>
                  <Text style={styles.typeTitle}>{title}</Text>
                  <Text style={styles.typeDetail}>{detail}</Text>
                </View>
                <Ionicons color={colors.muted} name="chevron-forward" size={18} />
              </Pressable>
            ))}
          </Surface>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(47,58,51,0.42)" },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg },
  handle: { alignSelf: "center", backgroundColor: colors.border, borderRadius: radii.pill, height: 4, marginBottom: spacing.lg, width: 48 },
  headingRow: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: 20, fontWeight: "700" },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: spacing.xs },
  close: { alignItems: "center", height: 44, justifyContent: "center", width: 44 },
  typeRow: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: spacing.md, minHeight: 68, paddingHorizontal: spacing.md },
  typeIcon: { alignItems: "center", borderRadius: radii.pill, height: 40, justifyContent: "center", width: 40 },
  grow: { flex: 1 },
  typeTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  typeDetail: { color: colors.muted, fontSize: 12, marginTop: 3 },
  confirmation: { gap: spacing.md },
  selectedLabel: { color: colors.primaryDark, fontSize: 14, fontWeight: "700" },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.control, borderWidth: 1, color: colors.text, fontSize: 16, minHeight: 52, paddingHorizontal: spacing.md },
  changeType: { alignItems: "center", minHeight: 44, paddingTop: spacing.sm },
  changeTypeText: { color: colors.primaryDark, fontSize: 14, fontWeight: "600" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  inline: { flexDirection: "row", gap: spacing.sm },
  chip: { alignItems: "center", borderColor: colors.border, borderRadius: radii.pill, borderWidth: 1, minHeight: 44, paddingHorizontal: spacing.md, justifyContent: "center" },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 13, fontWeight: "600" },
  chipTextSelected: { color: colors.surface },
});

function Chip({ label, onPress, selected }: { label: string; onPress: () => void; selected: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}
