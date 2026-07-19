import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "../../src/components/Screen";
import { SectionLabel, Surface } from "../../src/components/ui";
import { colors, radii, spacing } from "../../src/theme";

const transactions = [
  ["basket-outline", "Grocery Store", "July 18", "-₹2,140"],
  ["cafe-outline", "Coffee Shop", "July 17", "-₹380"],
  ["cart-outline", "Amazon", "July 16", "-₹1,799"],
] as const;

export default function MoneyScreen() {
  const [pending, setPending] = useState(true);

  return (
    <Screen
      headerAction={<Ionicons color={colors.text} name="ellipsis-horizontal" size={24} />}
      subtitle="Your progress, in pictures"
      title="Money"
    >
      <View style={styles.budget}>
        <Text style={styles.budgetLabel}>Budget remaining</Text>
        <View style={styles.amountRow}>
          <Text style={styles.amount}>₹17,420</Text>
          <Text style={styles.ofAmount}>of ₹25,000</Text>
        </View>
        <View style={styles.track}><View style={styles.progress} /></View>
        <Text style={styles.used}>30% used · resets in 12 days</Text>
      </View>

      <SectionLabel>Recent activity</SectionLabel>
      <Surface>
        {transactions.map(([icon, title, date, amount]) => (
          <View key={title} style={styles.transaction}>
            <View style={styles.transactionIcon}>
              <Ionicons color={colors.primaryDark} name={icon} size={20} />
            </View>
            <View style={styles.grow}>
              <Text style={styles.transactionTitle}>{title}</Text>
              <Text style={styles.meta}>{date}</Text>
            </View>
            <Text style={styles.transactionTitle}>{amount}</Text>
          </View>
        ))}
      </Surface>

      {pending ? (
        <>
          <SectionLabel>Pending confirmation</SectionLabel>
          <Surface style={styles.pending}>
            <View style={styles.grow}>
              <Text style={styles.transactionTitle}>Sharma Cafe</Text>
              <Text style={styles.meta}>July 19 · detected payment</Text>
            </View>
            <Text style={styles.transactionTitle}>₹240</Text>
            <Pressable
              accessibilityLabel="Confirm Sharma Cafe expense"
              accessibilityRole="button"
              onPress={() => setPending(false)}
              style={styles.confirm}
            >
              <Ionicons color={colors.surface} name="checkmark" size={20} />
            </Pressable>
          </Surface>
        </>
      ) : (
        <Text accessibilityRole="alert" style={styles.confirmed}>Expense confirmed. Undo is available from transaction details.</Text>
      )}
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
  progress: { backgroundColor: colors.primary, height: "100%", width: "30%" },
  used: { color: colors.primaryDark, fontSize: 13, fontWeight: "600", marginTop: spacing.sm },
  transaction: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: spacing.sm, minHeight: 72, paddingHorizontal: spacing.md },
  transactionIcon: { alignItems: "center", backgroundColor: colors.sageSurface, borderRadius: radii.pill, height: 40, justifyContent: "center", width: 40 },
  grow: { flex: 1 },
  transactionTitle: { color: colors.text, fontSize: 14, fontWeight: "600" },
  meta: { color: colors.muted, fontSize: 12, marginTop: spacing.xs },
  pending: { alignItems: "center", backgroundColor: colors.coralSurface, flexDirection: "row", gap: spacing.md, padding: spacing.md },
  confirm: { alignItems: "center", backgroundColor: colors.primary, borderRadius: radii.pill, height: 44, justifyContent: "center", width: 44 },
  confirmed: { color: colors.primaryDark, fontSize: 14, fontWeight: "600" },
});
