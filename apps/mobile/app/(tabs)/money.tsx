import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { CategoryDropdown } from "../../src/components/CategoryDropdown";
import { DatePickerField, dateInput } from "../../src/components/DatePickerField";
import { Screen } from "../../src/components/Screen";
import { SectionLabel, Surface } from "../../src/components/ui";
import { colors, radii, spacing } from "../../src/theme";

type TransactionType = "expense" | "income";
type PaymentMethod = "cash" | "online";

function moneyText(value: number) {
  return `Rs ${value.toLocaleString("en-IN")}`;
}

function parseDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? Date.now() : parsed.getTime();
}

export default function MoneyScreen() {
  const ensureMoneyDefaults = useMutation(api.core.ensureMoneyDefaults);
  const addExpense = useMutation(api.core.addExpense);
  const addCategory = useMutation(api.core.addCategory);
  const removeCategory = useMutation(api.core.removeCategory);
  const addAccount = useMutation(api.core.addAccount);
  const updateAccount = useMutation(api.core.updateAccount);
  const archiveAccount = useMutation(api.core.archiveAccount);
  const updateTransaction = useMutation(api.core.updateTransaction);
  const [selectedAccount, setSelectedAccount] = useState<Id<"accounts"> | undefined>();
  const money = useQuery(api.core.money, selectedAccount ? { accountId: selectedAccount } : {});
  const [newCategory, setNewCategory] = useState("");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [accountForm, setAccountForm] = useState({ balance: "", name: "" });
  const [editingAccount, setEditingAccount] = useState<Id<"accounts"> | null>(null);
  const [expense, setExpense] = useState({
    amount: "",
    category: "Food",
    date: dateInput(Date.now()),
    merchant: "",
    note: "",
    paymentMethod: "online" as PaymentMethod,
    type: "expense" as TransactionType,
  });
  const categories = money?.categories.filter((item) => item.type === expense.type) ?? [];
  const budget = money?.budget ?? 0;
  const spent = money?.spent ?? 0;
  const remaining = Math.max(0, budget - spent);
  const progress = budget ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const maxSummary = Math.max(1, ...(money?.summary.map((item) => item.amount) ?? [1]));

  useEffect(() => {
    void ensureMoneyDefaults({});
  }, [ensureMoneyDefaults]);

  async function saveTransaction() {
    const amount = Number(expense.amount);
    const accountId = selectedAccount ?? money?.accounts[0]?._id;
    const category = expense.category || categories[0]?.name || "General";
    if (!Number.isFinite(amount) || amount <= 0 || !accountId) return;
    await addExpense({
      accountId,
      amount,
      category,
      merchant: expense.merchant,
      note: expense.note,
      occurredAt: parseDate(expense.date),
      paymentMethod: expense.paymentMethod,
      status: "confirmed",
      type: expense.type,
    });
    setExpense((current) => ({ ...current, amount: "", merchant: "", note: "" }));
  }

  async function saveCategory() {
    const name = newCategory.trim();
    if (!name) return;
    await addCategory({ name, type: expense.type });
    setExpense((current) => ({ ...current, category: name }));
    setNewCategory("");
    setShowCategoryForm(false);
  }

  async function saveAccount() {
    const name = accountForm.name.trim();
    const balance = Number(accountForm.balance) || 0;
    if (!name) return;
    if (editingAccount) await updateAccount({ accountId: editingAccount, balance, name });
    else await addAccount({ balance, name });
    setAccountForm({ balance: "", name: "" });
    setEditingAccount(null);
    setShowAccountForm(false);
  }

  return (
    <Screen
      headerAction={<Ionicons color={colors.text} name="wallet-outline" size={24} />}
      subtitle="Accounts, transactions, and category totals"
      title="Money"
    >
      <View style={styles.budget}>
        <Text style={styles.budgetLabel}>Net worth</Text>
        <Text style={styles.amount}>{moneyText(money?.netWorth ?? 0)}</Text>
        <View style={styles.amountRow}>
          <Text style={styles.budgetLabel}>Budget remaining</Text>
          <Text style={styles.ofAmount}>{moneyText(remaining)} of {moneyText(budget)}</Text>
        </View>
        <View style={styles.track}><View style={[styles.progress, { width: `${progress}%` as `${number}%` }]} /></View>
        <Text style={styles.used}>{moneyText(spent)} confirmed expenses this month</Text>
      </View>

      <SectionLabel>Filter account</SectionLabel>
      <View style={styles.chips}>
        <Chip label="All" selected={!selectedAccount} onPress={() => setSelectedAccount(undefined)} />
        {(money?.accounts ?? []).map((account) => (
          <Chip key={account._id} label={`${account.name} · ${moneyText(account.balance)}`} selected={selectedAccount === account._id} onPress={() => setSelectedAccount(account._id)} />
        ))}
      </View>

      <SectionLabel>Add transaction</SectionLabel>
      <Surface style={styles.form}>
        <View style={styles.chips}>
          <Chip label="Expense" selected={expense.type === "expense"} onPress={() => setExpense((current) => ({ ...current, category: "Food", type: "expense" }))} />
          <Chip label="Income" selected={expense.type === "income"} onPress={() => setExpense((current) => ({ ...current, category: "Salary", type: "income" }))} />
          <Chip label="Online" selected={expense.paymentMethod === "online"} onPress={() => setExpense((current) => ({ ...current, paymentMethod: "online" }))} />
          <Chip label="Cash" selected={expense.paymentMethod === "cash"} onPress={() => setExpense((current) => ({ ...current, paymentMethod: "cash" }))} />
        </View>
        <TextInput accessibilityLabel="Amount" keyboardType="decimal-pad" onChangeText={(amount) => setExpense((current) => ({ ...current, amount }))} placeholder="Amount" placeholderTextColor={colors.muted} style={styles.input} value={expense.amount} />
        <TextInput accessibilityLabel="Merchant or payer" onChangeText={(merchant) => setExpense((current) => ({ ...current, merchant }))} placeholder={expense.type === "income" ? "Payer (optional)" : "Merchant (optional)"} placeholderTextColor={colors.muted} style={styles.input} value={expense.merchant} />
        <CategoryDropdown
          categories={categories}
          onDelete={(categoryId) => removeCategory({ categoryId: categoryId as Id<"transactionCategories"> })}
          onSelect={(category) => setExpense((current) => ({ ...current, category }))}
          selected={expense.category}
        />
        <Pressable accessibilityRole="button" onPress={() => setShowCategoryForm((open) => !open)} style={styles.categoryToggle}>
          <Ionicons color={colors.primaryDark} name={showCategoryForm ? "remove" : "add"} size={20} />
          <Text style={styles.categoryToggleText}>{showCategoryForm ? "Close category form" : "Add category"}</Text>
        </Pressable>
        {showCategoryForm ? (
          <View style={styles.inline}>
            <TextInput accessibilityLabel="New category" onChangeText={setNewCategory} placeholder="New category" placeholderTextColor={colors.muted} style={[styles.input, styles.grow]} value={newCategory} />
            <Pressable accessibilityLabel="Save category" accessibilityRole="button" onPress={saveCategory} style={styles.iconButton}>
              <Ionicons color={colors.primaryDark} name="checkmark" size={22} />
            </Pressable>
          </View>
        ) : null}
        <DatePickerField label="Transaction date" onChange={(date) => setExpense((current) => ({ ...current, date }))} value={expense.date} />
        <TextInput accessibilityLabel="Transaction note" onChangeText={(note) => setExpense((current) => ({ ...current, note }))} placeholder="Note (optional)" placeholderTextColor={colors.muted} style={styles.input} value={expense.note} />
        <Pressable accessibilityRole="button" onPress={saveTransaction} style={styles.addButton}>
          <Text style={styles.addButtonText}>Save transaction</Text>
        </Pressable>
      </Surface>

      <SectionLabel>Accounts</SectionLabel>
      <Surface>
        {(money?.accounts ?? []).map((account) => (
          <View key={account._id} style={styles.accountRow}>
            <View style={styles.grow}>
              <Text style={styles.transactionTitle}>{account.name}</Text>
              <Text style={styles.meta}>{moneyText(account.balance)}</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => {
              setEditingAccount(account._id);
              setAccountForm({ balance: String(account.baseBalance), name: account.name });
              setShowAccountForm(true);
            }} style={styles.iconButton}>
              <Ionicons color={colors.primaryDark} name="create-outline" size={20} />
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => archiveAccount({ accountId: account._id })} style={styles.iconButton}>
              <Ionicons color={colors.coral} name="trash-outline" size={20} />
            </Pressable>
          </View>
        ))}
        <Pressable accessibilityRole="button" onPress={() => {
          setShowAccountForm((open) => !open);
          setEditingAccount(null);
          setAccountForm({ balance: "", name: "" });
        }} style={styles.accountToggle}>
          <Ionicons color={colors.primaryDark} name={showAccountForm ? "remove" : "add"} size={21} />
          <Text style={styles.accountToggleText}>{showAccountForm ? "Close account form" : "Add wallet"}</Text>
        </Pressable>
        {showAccountForm ? (
          <View style={styles.form}>
            <TextInput accessibilityLabel="Account name" onChangeText={(name) => setAccountForm((current) => ({ ...current, name }))} placeholder="Account name" placeholderTextColor={colors.muted} style={styles.input} value={accountForm.name} />
            <TextInput accessibilityLabel="Starting balance" keyboardType="decimal-pad" onChangeText={(balance) => setAccountForm((current) => ({ ...current, balance }))} placeholder="Starting balance" placeholderTextColor={colors.muted} style={styles.input} value={accountForm.balance} />
            <Pressable accessibilityRole="button" onPress={saveAccount} style={styles.addButton}>
              <Text style={styles.addButtonText}>{editingAccount ? "Save account" : "Add account"}</Text>
            </Pressable>
          </View>
        ) : null}
      </Surface>

      {money?.pending.length ? (
        <>
          <SectionLabel>Pending confirmation</SectionLabel>
          <Surface>
            {money.pending.map((transaction) => (
              <View key={transaction._id} style={styles.pending}>
                <View style={styles.grow}>
                  <Text style={styles.transactionTitle}>{transaction.merchant || transaction.category}</Text>
                  <Text style={styles.meta}>{new Date(transaction.occurredAt).toLocaleDateString()} · {transaction.paymentMethod ?? "online"}</Text>
                  {transaction.note ? <Text style={styles.meta}>{transaction.note}</Text> : null}
                </View>
                <Text style={styles.transactionTitle}>{moneyText(transaction.amount)}</Text>
                <Pressable accessibilityLabel={`Confirm ${transaction.category} transaction`} accessibilityRole="button" onPress={() => updateTransaction({ status: "confirmed", transactionId: transaction._id })} style={styles.confirm}>
                  <Ionicons color={colors.surface} name="checkmark" size={20} />
                </Pressable>
                <Pressable accessibilityLabel={`Ignore ${transaction.category} transaction`} accessibilityRole="button" onPress={() => updateTransaction({ status: "ignored", transactionId: transaction._id })} style={styles.iconButton}>
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
              <Ionicons color={colors.primaryDark} name={(transaction.type ?? "expense") === "income" ? "arrow-down" : "receipt-outline"} size={20} />
            </View>
            <View style={styles.grow}>
              <Text style={styles.transactionTitle}>{transaction.merchant || transaction.category}</Text>
              <Text style={styles.meta}>{new Date(transaction.occurredAt).toLocaleDateString()} · {transaction.category} · {transaction.paymentMethod ?? "online"}</Text>
              {transaction.note ? <Text style={styles.meta}>{transaction.note}</Text> : null}
            </View>
            <Text style={styles.transactionTitle}>{(transaction.type ?? "expense") === "income" ? "+" : "-"}{moneyText(transaction.amount)}</Text>
          </View>
        ))}
        {money?.confirmed.length === 0 ? <Text style={styles.emptyText}>No confirmed transactions yet.</Text> : null}
      </Surface>

      <SectionLabel>Category analytics</SectionLabel>
      <Surface style={styles.analytics}>
        {(money?.summary ?? []).map((item) => (
          <View key={`${item.type}-${item.category}`} style={styles.barRow}>
            <View style={styles.barLabel}>
              <Text style={styles.transactionTitle}>{item.category}</Text>
              <Text style={styles.meta}>{item.type} · {moneyText(item.amount)}</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${Math.max(8, Math.round((item.amount / maxSummary) * 100))}%` as `${number}%`, backgroundColor: item.type === "income" ? colors.primary : colors.coral }]} />
            </View>
          </View>
        ))}
        {money?.summary.length === 0 ? <Text style={styles.emptyText}>Add confirmed transactions to build analytics.</Text> : null}
      </Surface>
    </Screen>
  );
}

function Chip({ label, onPress, selected }: { label: string; onPress: () => void; selected: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  budget: { backgroundColor: colors.sageSurface, borderColor: colors.border, borderRadius: radii.card, borderWidth: 1, padding: spacing.lg },
  budgetLabel: { color: colors.text, fontSize: 14 },
  amountRow: { alignItems: "baseline", flexDirection: "row", gap: spacing.sm, justifyContent: "space-between", marginTop: spacing.md },
  amount: { color: colors.text, fontSize: 34, fontWeight: "700", marginTop: spacing.sm },
  ofAmount: { color: colors.muted, fontSize: 14 },
  track: { backgroundColor: colors.surface, borderRadius: radii.pill, height: 10, marginTop: spacing.lg, overflow: "hidden" },
  progress: { backgroundColor: colors.primary, height: "100%" },
  used: { color: colors.primaryDark, fontSize: 13, fontWeight: "600", marginTop: spacing.sm },
  form: { gap: spacing.sm, padding: spacing.md },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: { alignItems: "center", borderColor: colors.border, borderRadius: radii.pill, borderWidth: 1, minHeight: 44, paddingHorizontal: spacing.md, justifyContent: "center" },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 13, fontWeight: "600" },
  chipTextSelected: { color: colors.surface },
  categoryToggle: { alignItems: "center", flexDirection: "row", gap: spacing.sm, minHeight: 44 },
  categoryToggleText: { color: colors.primaryDark, fontSize: 14, fontWeight: "700" },
  inline: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  grow: { flex: 1 },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.control, borderWidth: 1, color: colors.text, fontSize: 14, minHeight: 44, paddingHorizontal: spacing.sm },
  addButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: radii.control, justifyContent: "center", minHeight: 48 },
  addButtonText: { color: colors.surface, fontSize: 15, fontWeight: "700" },
  iconButton: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.pill, borderWidth: 1, height: 44, justifyContent: "center", width: 44 },
  accountRow: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: spacing.sm, minHeight: 72, paddingHorizontal: spacing.md },
  accountToggle: { alignItems: "center", flexDirection: "row", gap: spacing.sm, minHeight: 56, paddingHorizontal: spacing.md },
  accountToggleText: { color: colors.primaryDark, fontSize: 14, fontWeight: "700" },
  pending: { alignItems: "center", backgroundColor: colors.coralSurface, borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: spacing.sm, minHeight: 72, paddingHorizontal: spacing.md },
  transaction: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: spacing.sm, minHeight: 72, paddingHorizontal: spacing.md },
  transactionIcon: { alignItems: "center", backgroundColor: colors.sageSurface, borderRadius: radii.pill, height: 40, justifyContent: "center", width: 40 },
  transactionTitle: { color: colors.text, fontSize: 14, fontWeight: "600" },
  meta: { color: colors.muted, fontSize: 12, marginTop: spacing.xs },
  confirm: { alignItems: "center", backgroundColor: colors.primary, borderRadius: radii.pill, height: 44, justifyContent: "center", width: 44 },
  emptyText: { color: colors.muted, fontSize: 14, padding: spacing.md },
  analytics: { gap: spacing.md, padding: spacing.md },
  barRow: { gap: spacing.sm },
  barLabel: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  barTrack: { backgroundColor: colors.sageSurface, borderRadius: radii.pill, height: 10, overflow: "hidden" },
  barFill: { height: "100%" },
});
