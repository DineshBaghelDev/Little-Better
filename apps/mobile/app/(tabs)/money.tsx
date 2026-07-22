import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { CategoryDropdown } from "../../src/components/CategoryDropdown";
import { DatePickerField, dateInput } from "../../src/components/DatePickerField";
import { Screen } from "../../src/components/Screen";
import { Chip, Mascot, SectionLabel, Surface, useAppearance } from "../../src/components/ui";
import { colors, radii, spacing } from "../../src/theme";

type TransactionType = "expense" | "income";
type PaymentMethod = "cash" | "online";

const statusOptions = [
  { label: "Confirmed", value: "confirmed" },
  { label: "Pending", value: "pending" },
] satisfies { label: string; value: "pending" | "confirmed" }[];

function moneyText(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day).getTime() : Date.now();
}

export default function MoneyScreen() {
  const ensureMoneyDefaults = useMutation(api.core.ensureMoneyDefaults);
  const updateTransaction = useMutation(api.core.updateTransaction);
  const removeTransaction = useMutation(api.core.removeTransaction);
  const money = useQuery(api.core.money, {});
  const appearance = useAppearance();
  const [deeperOpen, setDeeperOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Id<"transactions"> | null>(null);
  const [expense, setExpense] = useState({
    accountId: undefined as Id<"accounts"> | undefined,
    amount: "",
    category: "Food",
    date: dateInput(Date.now()),
    merchant: "",
    note: "",
    paymentMethod: "online" as PaymentMethod,
    status: "confirmed" as "pending" | "confirmed",
    type: "expense" as TransactionType,
  });
  const categories = money?.categories.filter((item) => item.type === expense.type) ?? [];
  const budget = money?.budget ?? 0;
  const spent = money?.spent ?? 0;
  const remaining = budget - spent;
  const overBudget = budget > 0 && remaining < 0;
  const progress = budget ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const maxSummary = Math.max(1, ...(money?.summary.map((item) => item.amount) ?? [1]));

  useEffect(() => {
    void ensureMoneyDefaults({});
  }, [ensureMoneyDefaults]);

  function editTransaction(transaction: Doc<"transactions">) {
    setEditingTransaction(transaction._id);
    setExpense({
      accountId: transaction.accountId,
      amount: String(transaction.amount),
      category: transaction.category,
      date: dateInput(transaction.occurredAt),
      merchant: transaction.merchant ?? "",
      note: transaction.note ?? "",
      paymentMethod: transaction.paymentMethod ?? "online",
      status: transaction.status === "pending" ? "pending" : "confirmed",
      type: transaction.type ?? "expense",
    });
  }

  function resetTransaction() {
    setEditingTransaction(null);
    setExpense((current) => ({ ...current, amount: "", merchant: "", note: "", status: "confirmed" }));
  }

  function setType(type: TransactionType) {
    setExpense((current) => ({ ...current, category: type === "income" ? "Salary" : "Food", type }));
  }

  async function saveTransaction() {
    if (!editingTransaction) return;
    const amount = Number(expense.amount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    await updateTransaction({
      accountId: expense.accountId,
      amount,
      category: expense.category || categories[0]?.name || "General",
      merchant: expense.merchant,
      note: expense.note,
      occurredAt: parseDate(expense.date),
      paymentMethod: expense.paymentMethod,
      status: expense.status,
      transactionId: editingTransaction,
      type: expense.type,
    });
    resetTransaction();
  }

  function transactionFields() {
    return (
      <>
        <View style={styles.chips}>
          <Chip label="Expense" selected={expense.type === "expense"} onPress={() => setType("expense")} />
          <Chip label="Income" selected={expense.type === "income"} onPress={() => setType("income")} />
          <Chip label="Online" selected={expense.paymentMethod === "online"} onPress={() => setExpense((current) => ({ ...current, paymentMethod: "online" }))} />
          <Chip label="Cash" selected={expense.paymentMethod === "cash"} onPress={() => setExpense((current) => ({ ...current, paymentMethod: "cash" }))} />
        </View>
        <View style={styles.chips}>
          {statusOptions.map((option) => (
            <Chip key={option.value} label={option.label} selected={expense.status === option.value} onPress={() => setExpense((current) => ({ ...current, status: option.value }))} />
          ))}
        </View>
        <TextInput accessibilityLabel="Amount" keyboardType="decimal-pad" onChangeText={(amount) => setExpense((current) => ({ ...current, amount }))} placeholder="Amount" placeholderTextColor={colors.muted} style={styles.input} value={expense.amount} />
        <TextInput accessibilityLabel="Merchant or payer" onChangeText={(merchant) => setExpense((current) => ({ ...current, merchant }))} placeholder={expense.type === "income" ? "Payer (optional)" : "Merchant (optional)"} placeholderTextColor={colors.muted} style={styles.input} value={expense.merchant} />
        <CategoryDropdown
          categories={categories}
          manageable={false}
          onDelete={() => undefined}
          onSelect={(category) => setExpense((current) => ({ ...current, category }))}
          selected={expense.category}
        />
        <DatePickerField label="Transaction date" onChange={(date) => setExpense((current) => ({ ...current, date }))} value={expense.date} />
        <TextInput accessibilityLabel="Transaction note" onChangeText={(note) => setExpense((current) => ({ ...current, note }))} placeholder="Note (optional)" placeholderTextColor={colors.muted} style={styles.input} value={expense.note} />
      </>
    );
  }

  return (
    <Screen
      headerAction={<Mascot size={52} variant="money" />}
      subtitle="Budget, pending confirmations, and recent spend"
      title="Money"
    >
      <View style={[styles.budget, overBudget && styles.budgetOver]}>
        <Text style={styles.budgetLabel}>Budget remaining</Text>
        <Text style={[styles.amount, overBudget && styles.overText]}>
          {overBudget ? `${moneyText(Math.abs(remaining))} over` : moneyText(Math.max(0, remaining))}
        </Text>
        <Text style={[styles.used, overBudget && styles.overText]}>
          {moneyText(spent)} confirmed of {moneyText(budget)} this month
        </Text>
        <View style={styles.track}>
          <View style={[styles.progress, { backgroundColor: appearance.primary }, overBudget && styles.progressOver, { width: `${progress}%` as `${number}%` }]} />
        </View>
      </View>

      {money?.pending.length ? (
        <>
          <SectionLabel>Pending confirmation</SectionLabel>
          <Surface>
            {money.pending.map((transaction) => (
              <TransactionRow
                key={transaction._id}
                transaction={transaction}
                onConfirm={() => updateTransaction({ status: "confirmed", transactionId: transaction._id })}
                onEdit={() => editTransaction(transaction)}
                onIgnore={() => updateTransaction({ status: "ignored", transactionId: transaction._id })}
                onRemove={() => removeTransaction({ transactionId: transaction._id })}
                pending
              />
            ))}
          </Surface>
        </>
      ) : null}

      <SectionLabel>Recent confirmed</SectionLabel>
      <Surface>
        {(money?.confirmed ?? []).map((transaction) => (
          <TransactionRow
            key={transaction._id}
            transaction={transaction}
            onEdit={() => editTransaction(transaction)}
            onRemove={() => removeTransaction({ transactionId: transaction._id })}
          />
        ))}
        {money?.confirmed.length === 0 ? (
          <View style={styles.emptyMascot}>
            <Mascot size={72} variant="watering" />
            <Text style={styles.emptyText}>No confirmed transactions yet.</Text>
          </View>
        ) : null}
      </Surface>

      <Surface>
        <Pressable accessibilityRole="button" onPress={() => setDeeperOpen((open) => !open)} style={styles.deeperToggle}>
          <Ionicons color={colors.primaryDark} name="analytics-outline" size={21} />
          <View style={styles.grow}>
            <Text style={styles.transactionTitle}>Summaries</Text>
            <Text style={styles.meta}>Accounts and category totals</Text>
          </View>
          <Ionicons color={colors.muted} name={deeperOpen ? "chevron-up" : "chevron-down"} size={18} />
        </Pressable>
        {deeperOpen ? (
          <View style={styles.deeper}>
            {(money?.accounts ?? []).map((account) => (
              <View key={account._id} style={styles.summaryRow}>
                <Text style={styles.transactionTitle}>{account.name}</Text>
                <Text style={styles.meta}>{moneyText(account.balance)}</Text>
              </View>
            ))}
            {(money?.summary ?? []).map((item) => (
              <View key={`${item.type}-${item.category}`} style={styles.barRow}>
                <View style={styles.barLabel}>
                  <Text style={styles.transactionTitle}>{item.category}</Text>
                  <Text style={styles.meta}>{item.type} - {moneyText(item.amount)}</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${Math.max(8, Math.round((item.amount / maxSummary) * 100))}%` as `${number}%`, backgroundColor: item.type === "income" ? colors.primary : colors.coral }]} />
                </View>
              </View>
            ))}
            {money?.summary.length === 0 ? <Text style={styles.emptyText}>Confirmed transactions will build summaries.</Text> : null}
          </View>
        ) : null}
      </Surface>

      <Modal animationType="slide" transparent visible={editingTransaction !== null} onRequestClose={resetTransaction}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit transaction</Text>
              <Pressable accessibilityLabel="Close edit transaction" accessibilityRole="button" onPress={resetTransaction} style={styles.iconButton}>
                <Ionicons color={colors.text} name="close" size={20} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent} nestedScrollEnabled>
              {transactionFields()}
              <Pressable accessibilityRole="button" onPress={saveTransaction} style={[styles.addButton, { backgroundColor: appearance.primary }]}>
                <Text style={styles.addButtonText}>Save changes</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function TransactionRow({
  onConfirm,
  onEdit,
  onIgnore,
  onRemove,
  pending = false,
  transaction,
}: {
  onConfirm?: () => void;
  onEdit: () => void;
  onIgnore?: () => void;
  onRemove: () => void;
  pending?: boolean;
  transaction: Doc<"transactions">;
}) {
  const type = transaction.type ?? "expense";
  return (
    <View style={[styles.transaction, pending && styles.pending]}>
      <View style={styles.transactionIcon}>
        <Ionicons color={pending ? colors.coral : colors.primaryDark} name={type === "income" ? "arrow-down" : "receipt-outline"} size={20} />
      </View>
      <View style={styles.grow}>
        <Text style={styles.transactionTitle}>{transaction.merchant || transaction.category}</Text>
        <Text style={styles.meta}>
          {new Date(transaction.occurredAt).toLocaleDateString()} - {transaction.category} - {transaction.paymentMethod ?? "online"}
        </Text>
        {transaction.source ? <Text style={styles.meta}>{transaction.source}{transaction.resolution ? ` - ${transaction.resolution}` : ""}</Text> : null}
        {transaction.note ? <Text style={styles.meta}>{transaction.note}</Text> : null}
      </View>
      <Text style={styles.transactionTitle}>{type === "income" ? "+" : "-"}{moneyText(transaction.amount)}</Text>
      <Pressable accessibilityLabel={`Edit ${transaction.category} transaction`} accessibilityRole="button" onPress={onEdit} style={styles.iconButton}>
        <Ionicons color={colors.primaryDark} name="create-outline" size={20} />
      </Pressable>
      {pending && onConfirm ? (
        <Pressable accessibilityLabel={`Confirm ${transaction.category} transaction`} accessibilityRole="button" onPress={onConfirm} style={styles.confirm}>
          <Ionicons color={colors.surface} name="checkmark" size={20} />
        </Pressable>
      ) : null}
      {pending && onIgnore ? (
        <Pressable accessibilityLabel={`Ignore ${transaction.category} transaction`} accessibilityRole="button" onPress={onIgnore} style={styles.iconButton}>
          <Ionicons color={colors.coral} name="close" size={20} />
        </Pressable>
      ) : null}
      <Pressable accessibilityLabel={`Delete ${transaction.category} transaction`} accessibilityRole="button" onPress={onRemove} style={styles.iconButton}>
        <Ionicons color={colors.coral} name="trash-outline" size={20} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  budget: { backgroundColor: colors.sageSurface, borderColor: colors.border, borderRadius: radii.card, borderWidth: 1, padding: spacing.lg },
  budgetOver: { backgroundColor: colors.coralSurface, borderColor: colors.coral },
  budgetLabel: { color: colors.text, fontSize: 14 },
  amount: { color: colors.text, fontSize: 34, fontWeight: "700", marginTop: spacing.sm },
  overText: { color: colors.coral },
  track: { backgroundColor: colors.surface, borderRadius: radii.pill, height: 10, marginTop: spacing.lg, overflow: "hidden" },
  progress: { backgroundColor: colors.primary, height: "100%" },
  progressOver: { backgroundColor: colors.coral },
  used: { color: colors.primaryDark, fontSize: 13, fontWeight: "600", marginTop: spacing.sm },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  grow: { flex: 1 },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.control, borderWidth: 1, color: colors.text, fontSize: 14, minHeight: 44, paddingHorizontal: spacing.sm },
  addButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: radii.control, justifyContent: "center", minHeight: 48 },
  addButtonText: { color: colors.surface, fontSize: 15, fontWeight: "700" },
  iconButton: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.pill, borderWidth: 1, height: 44, justifyContent: "center", width: 44 },
  pending: { backgroundColor: colors.coralSurface },
  transaction: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: spacing.sm, minHeight: 72, paddingHorizontal: spacing.md },
  transactionIcon: { alignItems: "center", backgroundColor: colors.sageSurface, borderRadius: radii.pill, height: 40, justifyContent: "center", width: 40 },
  transactionTitle: { color: colors.text, fontSize: 14, fontWeight: "600" },
  meta: { color: colors.muted, fontSize: 12, marginTop: spacing.xs },
  confirm: { alignItems: "center", backgroundColor: colors.primary, borderRadius: radii.pill, height: 44, justifyContent: "center", width: 44 },
  emptyText: { color: colors.muted, fontSize: 14, padding: spacing.md },
  emptyMascot: { alignItems: "center", paddingTop: spacing.md },
  deeperToggle: { alignItems: "center", flexDirection: "row", gap: spacing.md, minHeight: 72, padding: spacing.md },
  deeper: { borderTopColor: colors.border, borderTopWidth: 1, gap: spacing.md, padding: spacing.md },
  summaryRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  barRow: { gap: spacing.sm },
  barLabel: { flexDirection: "row", gap: spacing.sm, justifyContent: "space-between" },
  barTrack: { backgroundColor: colors.sageSurface, borderRadius: radii.pill, height: 10, overflow: "hidden" },
  barFill: { height: "100%" },
  modalBackdrop: { backgroundColor: "rgba(47,58,51,0.42)", flex: 1, justifyContent: "flex-end" },
  modalSheet: { backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "88%", padding: spacing.lg },
  modalHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.md },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  modalContent: { gap: spacing.sm, paddingBottom: spacing.lg },
});
