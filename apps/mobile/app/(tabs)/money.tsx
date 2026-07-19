import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { api } from "../../convex/_generated/api";
import { Screen } from "../../src/components/Screen";
import { SectionLabel, Surface } from "../../src/components/ui";
import { colors, radii, spacing } from "../../src/theme";

function moneyText(value: number) {
  return `Rs ${value.toLocaleString("en-IN")}`;
}

export default function MoneyScreen() {
  const money = useQuery(api.core.money);
  const addExpense = useMutation(api.core.addExpense);
  const updateTransaction = useMutation(api.core.updateTransaction);
  const [editing, setEditing] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [merchant, setMerchant] = useState("");
  const [note, setNote] = useState("");
  const [newExpense, setNewExpense] = useState({ amount: "", category: "", date: "", merchant: "", note: "" });
  const budget = money?.budget ?? 0;
  const spent = money?.spent ?? 0;
  const remaining = Math.max(0, budget - spent);
  const progress = budget ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

  function dateValue(value: string) {
    if (!value.trim()) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.getTime();
  }

  async function saveExpense() {
    if (!newExpense.amount.trim()) return;
    await addExpense({
      amount: Number(newExpense.amount),
      category: newExpense.category || "General",
      merchant: newExpense.merchant,
      note: newExpense.note,
      occurredAt: dateValue(newExpense.date),
    });
    setNewExpense({ amount: "", category: "", date: "", merchant: "", note: "" });
  }

  return (
    <Screen
      headerAction={<Ionicons color={colors.text} name="wallet-outline" size={24} />}
      subtitle="Confirmed spending only"
      title="Money"
    >
      <View style={styles.budget}>
        <Text style={styles.budgetLabel}>Budget remaining</Text>
        <View style={styles.amountRow}>
          <Text style={styles.amount}>{moneyText(remaining)}</Text>
          <Text style={styles.ofAmount}>of {moneyText(budget)}</Text>
        </View>
        <View style={styles.track}><View style={[styles.progress, { width: `${progress}%` as `${number}%` }]} /></View>
        <Text style={styles.used}>{moneyText(spent)} confirmed this month</Text>
      </View>

      <SectionLabel>Add expense</SectionLabel>
      <Surface style={styles.addExpense}>
        <TextInput
          accessibilityLabel="Expense amount"
          keyboardType="decimal-pad"
          onChangeText={(value) => setNewExpense((current) => ({ ...current, amount: value }))}
          placeholder="Amount"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={newExpense.amount}
        />
        <TextInput
          accessibilityLabel="Merchant"
          onChangeText={(value) => setNewExpense((current) => ({ ...current, merchant: value }))}
          placeholder="Merchant (optional)"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={newExpense.merchant}
        />
        <TextInput
          accessibilityLabel="Expense category"
          onChangeText={(value) => setNewExpense((current) => ({ ...current, category: value }))}
          placeholder="Category"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={newExpense.category}
        />
        <TextInput
          accessibilityLabel="Expense date"
          onChangeText={(value) => setNewExpense((current) => ({ ...current, date: value }))}
          placeholder="Date YYYY-MM-DD (optional)"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={newExpense.date}
        />
        <TextInput
          accessibilityLabel="Expense note"
          onChangeText={(value) => setNewExpense((current) => ({ ...current, note: value }))}
          placeholder="Note (optional)"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={newExpense.note}
        />
        <Pressable accessibilityRole="button" onPress={saveExpense} style={styles.addButton}>
          <Text style={styles.addButtonText}>Save pending expense</Text>
        </Pressable>
      </Surface>

      {money?.pending.length ? (
        <>
          <SectionLabel>Pending confirmation</SectionLabel>
          <Surface>
            {money.pending.map((transaction) => (
              <View key={transaction._id} style={styles.pending}>
                <View style={styles.grow}>
                  <Text style={styles.transactionTitle}>{transaction.merchant || transaction.category}</Text>
                  <Text style={styles.meta}>{new Date(transaction.occurredAt).toLocaleDateString()} detected payment</Text>
                  {transaction.merchant ? <Text style={styles.meta}>{transaction.category}</Text> : null}
                  {transaction.note ? <Text style={styles.meta}>{transaction.note}</Text> : null}
                </View>
                <Text style={styles.transactionTitle}>{moneyText(transaction.amount)}</Text>
                <Pressable
                  accessibilityLabel={`Confirm ${transaction.category} expense`}
                  accessibilityRole="button"
                  onPress={() => updateTransaction({ status: "confirmed", transactionId: transaction._id })}
                  style={styles.confirm}
                >
                  <Ionicons color={colors.surface} name="checkmark" size={20} />
                </Pressable>
                <Pressable
                  accessibilityLabel={`Ignore ${transaction.category} expense`}
                  accessibilityRole="button"
                  onPress={() => updateTransaction({ status: "ignored", transactionId: transaction._id })}
                  style={styles.iconButton}
                >
                  <Ionicons color={colors.coral} name="close" size={20} />
                </Pressable>
              </View>
            ))}
          </Surface>
        </>
      ) : null}

      <SectionLabel>Recent confirmed</SectionLabel>
      <Surface>
        {(money?.confirmed ?? []).map((transaction) => (
          <View key={transaction._id} style={styles.transaction}>
            <View style={styles.transactionIcon}>
              <Ionicons color={colors.primaryDark} name="receipt-outline" size={20} />
            </View>
            {editing === transaction._id ? (
              <View style={styles.editRow}>
                <TextInput
                  accessibilityLabel="Edit amount"
                  keyboardType="number-pad"
                  onChangeText={setAmount}
                  placeholder={String(transaction.amount)}
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={amount}
                />
                <TextInput
                  accessibilityLabel="Edit category"
                  onChangeText={setCategory}
                  placeholder={transaction.category}
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={category}
                />
                <TextInput
                  accessibilityLabel="Edit merchant"
                  onChangeText={setMerchant}
                  placeholder={transaction.merchant || "Merchant"}
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={merchant}
                />
                <TextInput
                  accessibilityLabel="Edit note"
                  onChangeText={setNote}
                  placeholder={transaction.note || "Note"}
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={note}
                />
                <Pressable
                  accessibilityLabel="Save transaction"
                  accessibilityRole="button"
                  onPress={async () => {
                    await updateTransaction({
                      amount: Number(amount) || undefined,
                      category: category || undefined,
                      merchant: merchant || undefined,
                      note: note || undefined,
                      transactionId: transaction._id,
                    });
                    setAmount("");
                    setCategory("");
                    setMerchant("");
                    setNote("");
                    setEditing(null);
                  }}
                  style={styles.iconButton}
                >
                  <Ionicons color={colors.primaryDark} name="checkmark" size={21} />
                </Pressable>
              </View>
            ) : (
              <>
                <View style={styles.grow}>
                  <Text style={styles.transactionTitle}>{transaction.merchant || transaction.category}</Text>
                  <Text style={styles.meta}>{new Date(transaction.occurredAt).toLocaleDateString()}</Text>
                  {transaction.merchant ? <Text style={styles.meta}>{transaction.category}</Text> : null}
                  {transaction.note ? <Text style={styles.meta}>{transaction.note}</Text> : null}
                </View>
                <Text style={styles.transactionTitle}>-{moneyText(transaction.amount)}</Text>
                <Pressable
                  accessibilityLabel={`Edit ${transaction.category} transaction`}
                  accessibilityRole="button"
                  onPress={() => setEditing(transaction._id)}
                  style={styles.iconButton}
                >
                  <Ionicons color={colors.primaryDark} name="create-outline" size={20} />
                </Pressable>
              </>
            )}
          </View>
        ))}
        {money?.confirmed.length === 0 ? <Text style={styles.emptyText}>No confirmed transactions yet.</Text> : null}
      </Surface>

      <SectionLabel>Category summary</SectionLabel>
      <Surface>
        {(money?.summary ?? []).map((item) => (
          <View key={item.category} style={styles.summaryRow}>
            <Text style={styles.transactionTitle}>{item.category}</Text>
            <Text style={styles.transactionTitle}>{moneyText(item.amount)}</Text>
          </View>
        ))}
        {money?.summary.length === 0 ? <Text style={styles.emptyText}>Confirm expenses to build a summary.</Text> : null}
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  budget: { backgroundColor: colors.sageSurface, borderColor: colors.border, borderRadius: radii.card, borderWidth: 1, padding: spacing.lg },
  budgetLabel: { color: colors.text, fontSize: 14 },
  amountRow: { alignItems: "baseline", flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  amount: { color: colors.text, fontSize: 34, fontWeight: "700" },
  ofAmount: { color: colors.muted, fontSize: 14 },
  track: { backgroundColor: colors.surface, borderRadius: radii.pill, height: 10, marginTop: spacing.lg, overflow: "hidden" },
  progress: { backgroundColor: colors.primary, height: "100%" },
  used: { color: colors.primaryDark, fontSize: 13, fontWeight: "600", marginTop: spacing.sm },
  addExpense: { gap: spacing.sm, padding: spacing.md },
  addButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: radii.control, justifyContent: "center", minHeight: 48 },
  addButtonText: { color: colors.surface, fontSize: 15, fontWeight: "700" },
  pending: { alignItems: "center", backgroundColor: colors.coralSurface, borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: spacing.sm, minHeight: 72, paddingHorizontal: spacing.md },
  transaction: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: spacing.sm, minHeight: 72, paddingHorizontal: spacing.md },
  transactionIcon: { alignItems: "center", backgroundColor: colors.sageSurface, borderRadius: radii.pill, height: 40, justifyContent: "center", width: 40 },
  grow: { flex: 1 },
  transactionTitle: { color: colors.text, fontSize: 14, fontWeight: "600" },
  meta: { color: colors.muted, fontSize: 12, marginTop: spacing.xs },
  confirm: { alignItems: "center", backgroundColor: colors.primary, borderRadius: radii.pill, height: 44, justifyContent: "center", width: 44 },
  iconButton: { alignItems: "center", height: 44, justifyContent: "center", width: 44 },
  editRow: { flex: 1, gap: spacing.sm, paddingVertical: spacing.sm },
  input: { borderColor: colors.border, borderRadius: radii.control, borderWidth: 1, color: colors.text, fontSize: 14, minHeight: 44, paddingHorizontal: spacing.sm },
  emptyText: { color: colors.muted, fontSize: 14, padding: spacing.md },
  summaryRow: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 56, paddingHorizontal: spacing.md },
});
