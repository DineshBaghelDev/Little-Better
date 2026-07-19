import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { Mascot, PrimaryButton, Surface } from "../src/components/ui";
import { colors, radii, spacing } from "../src/theme";

const setupRows = [
  { icon: "heart-outline", label: "Focus area", value: "Health" },
  { icon: "time-outline", label: "Available time", value: "3 hours" },
  { icon: "flag-outline", label: "Weekly intent", value: "Feel better" },
  { icon: "alarm-outline", label: "Preferred focus time", value: "9:00 AM" },
  { icon: "wallet-outline", label: "Monthly budget", value: "₹25,000" },
] as const;

export default function OnboardingScreen() {
  const [selected, setSelected] = useState(0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brandRow}>
          <Ionicons color={colors.primary} name="leaf" size={22} />
          <Text style={styles.brand}>Little Better</Text>
        </View>
        <Text style={styles.tagline}>See what matters now.</Text>
        <Text style={styles.promise}>One focus. One weekly improvement.</Text>

        <View style={styles.mascotWrap}>
          <Mascot size={156} />
        </View>

        <View>
          <Text style={styles.title}>Let’s set up your plan</Text>
          <Text style={styles.helper}>A few calm defaults to make Today useful.</Text>
        </View>

        <Surface>
          {setupRows.map((row, index) => (
            <Pressable
              accessibilityRole="button"
              key={row.label}
              onPress={() => setSelected(index)}
              style={[styles.setupRow, index === selected && styles.setupRowSelected]}
            >
              <Ionicons color={colors.primaryDark} name={row.icon} size={20} />
              <Text style={styles.setupLabel}>{row.label}</Text>
              <Text style={styles.setupValue}>{row.value}</Text>
            </Pressable>
          ))}
        </Surface>

        <PrimaryButton label="Start my plan" onPress={() => router.replace("/(tabs)/today")} />
        <Text style={styles.footnote}>You can change this anytime.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  brandRow: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  brand: { color: colors.text, fontSize: 24, fontWeight: "800" },
  tagline: { color: colors.primaryDark, fontSize: 18, fontWeight: "700", marginTop: spacing.lg },
  promise: { color: colors.muted, fontSize: 15, marginTop: spacing.xs },
  mascotWrap: { alignItems: "center", marginVertical: spacing.lg },
  title: { color: colors.text, fontSize: 24, fontWeight: "700" },
  helper: { color: colors.muted, fontSize: 14, marginBottom: spacing.md, marginTop: spacing.xs },
  setupRow: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 56,
    paddingHorizontal: spacing.md,
  },
  setupRowSelected: { backgroundColor: colors.sageSurface },
  setupLabel: { color: colors.text, flex: 1, fontSize: 14, marginLeft: spacing.sm },
  setupValue: { color: colors.muted, fontSize: 13 },
  footnote: { color: colors.muted, fontSize: 12, marginTop: spacing.sm, textAlign: "center" },
});
