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
  const updateTransaction = useMutation(api.core.updateTransaction);
  const [editing, setEditing] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const budget = money?.budget ?? 0;
  const spent = money?.spent ?? 0;
  const remaining = Math.max(0, budget - spent);
  const progress = budget ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

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

      {money?.pending.length ? (
        <>
          <SectionLabel>Pending confirmation</SectionLabel>
          <Surface>
            {money.pending.map((transaction) => (
              <View key={transaction._id} style={styles.pending}>
                <View style={styles.grow}>
                  <Text style={styles.transactionTitle}>{transaction.category}</Text>
                  <Text style={styles.meta}>{new Date(transaction.occurredAt).toLocaleDateString()} detected payment</Text>
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
                <Pressable
                  accessibilityLabel="Save transaction"
                  accessibilityRole="button"
                  onPress={async () => {
                    await updateTransaction({
                      amount: Number(amount) || undefined,
                      category: category || undefined,
                      transactionId: transaction._id,
                    });
                    setAmount("");
                    setCategory("");
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
                  <Text style={styles.transactionTitle}>{transaction.category}</Text>
                  <Text style={styles.meta}>{new Date(transaction.occurredAt).toLocaleDateString()}</Text>
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
  pending: { alignItems: "center", backgroundColor: colors.coralSurface, borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: spacing.sm, minHeight: 72, paddingHorizontal: spacing.md },
  transaction: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: spacing.sm, minHeight: 72, paddingHorizontal: spacing.md },
  transactionIcon: { alignItems: "center", backgroundColor: colors.sageSurface, borderRadius: radii.pill, height: 40, justifyContent: "center", width: 40 },
  grow: { flex: 1 },
  transactionTitle: { color: colors.text, fontSize: 14, fontWeight: "600" },
  meta: { color: colors.muted, fontSize: 12, marginTop: spacing.xs },
  confirm: { alignItems: "center", backgroundColor: colors.primary, borderRadius: radii.pill, height: 44, justifyContent: "center", width: 44 },
  iconButton: { alignItems: "center", height: 44, justifyContent: "center", width: 44 },
  editRow: { alignItems: "center", flex: 1, flexDirection: "row", gap: spacing.sm },
  input: { borderColor: colors.border, borderRadius: radii.control, borderWidth: 1, color: colors.text, flex: 1, fontSize: 14, minHeight: 44, paddingHorizontal: spacing.sm },
  emptyText: { color: colors.muted, fontSize: 14, padding: spacing.md },
  summaryRow: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 56, paddingHorizontal: spacing.md },
});
