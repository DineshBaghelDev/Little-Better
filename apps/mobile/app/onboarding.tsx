import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { api } from "../convex/_generated/api";
import { Mascot, PrimaryButton, Surface } from "../src/components/ui";
import { colors, radii, spacing } from "../src/theme";

type TargetType = "sessions_per_week" | "minutes_per_day" | "minutes_per_week" | "binary_days";

const targetOptions = [
  ["sessions_per_week", "Sessions / week"],
  ["minutes_per_day", "Minutes / day"],
  ["minutes_per_week", "Minutes / week"],
  ["binary_days", "Days / week"],
] as const satisfies readonly [TargetType, string][];

export default function OnboardingScreen() {
  const bootstrap = useMutation(api.core.bootstrap);
  const [values, setValues] = useState({
    focusName: "Study",
    monthlyBudget: "25000",
    preferredHour: "9",
    reflectionHour: "20",
    targetType: "sessions_per_week" as TargetType,
    targetValue: "3",
  });
  const setupRows = [
    { icon: "heart-outline", label: "Focus area", value: values.focusName || "Study" },
    { icon: "flag-outline", label: "Target", value: `${values.targetValue || "3"} ${targetOptions.find(([type]) => type === values.targetType)?.[1] ?? "sessions"}` },
    { icon: "alarm-outline", label: "Preferred focus time", value: `${values.preferredHour || "9"}:00` },
    { icon: "moon-outline", label: "Reflection time", value: `${values.reflectionHour || "20"}:00` },
    { icon: "wallet-outline", label: "Monthly budget", value: values.monthlyBudget || "0" },
  ] as const;

  async function startPlan() {
    await bootstrap({
      focusName: values.focusName,
      monthlyBudget: Number(values.monthlyBudget) || 0,
      preferredHour: Number(values.preferredHour) || 9,
      reflectionHour: Number(values.reflectionHour) || 20,
      targetType: values.targetType,
      targetValue: Number(values.targetValue) || 3,
    });
    router.replace("/(tabs)/today");
  }

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
          <Text style={styles.title}>Set up your plan</Text>
          <Text style={styles.helper}>A few defaults make Today useful.</Text>
        </View>

        <Surface>
          {setupRows.map((row, index) => (
            <Pressable
              accessibilityRole="button"
              key={row.label}
              style={[styles.setupRow, index === 0 && styles.setupRowSelected]}
            >
              <Ionicons color={colors.primaryDark} name={row.icon} size={20} />
              <Text style={styles.setupLabel}>{row.label}</Text>
              <Text style={styles.setupValue}>{row.value}</Text>
            </Pressable>
          ))}
        </Surface>

        <Surface style={styles.form}>
          <TextInput
            accessibilityLabel="Tracked focus category"
            onChangeText={(focusName) => setValues((current) => ({ ...current, focusName }))}
            placeholder="Focus area"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={values.focusName}
          />
          <TextInput
            accessibilityLabel="Weekly session target"
            keyboardType="number-pad"
            onChangeText={(targetValue) => setValues((current) => ({ ...current, targetValue }))}
            placeholder="Target value"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={values.targetValue}
          />
          <View style={styles.chips}>
            {targetOptions.map(([type, label]) => (
              <Chip
                key={type}
                label={label}
                selected={values.targetType === type}
                onPress={() => setValues((current) => ({ ...current, targetType: type }))}
              />
            ))}
          </View>
          <TextInput
            accessibilityLabel="Preferred focus hour"
            keyboardType="number-pad"
            onChangeText={(preferredHour) => setValues((current) => ({ ...current, preferredHour }))}
            placeholder="Focus hour, 0 to 23"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={values.preferredHour}
          />
          <TextInput
            accessibilityLabel="Evening reflection hour"
            keyboardType="number-pad"
            onChangeText={(reflectionHour) => setValues((current) => ({ ...current, reflectionHour }))}
            placeholder="Reflection hour, 17 to 23"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={values.reflectionHour}
          />
          <TextInput
            accessibilityLabel="Monthly budget"
            keyboardType="number-pad"
            onChangeText={(monthlyBudget) => setValues((current) => ({ ...current, monthlyBudget }))}
            placeholder="Monthly budget"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={values.monthlyBudget}
          />
        </Surface>

        <PrimaryButton label="Start my plan" onPress={startPlan} />
        <Text style={styles.footnote}>You can change this anytime.</Text>
      </ScrollView>
    </SafeAreaView>
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
  form: { gap: spacing.sm, marginTop: spacing.md, padding: spacing.md },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: { alignItems: "center", borderColor: colors.border, borderRadius: radii.pill, borderWidth: 1, justifyContent: "center", minHeight: 44, paddingHorizontal: spacing.md },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 13, fontWeight: "600" },
  chipTextSelected: { color: colors.surface },
  input: {
    borderColor: colors.border,
    borderRadius: radii.control,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  footnote: { color: colors.muted, fontSize: 12, marginTop: spacing.sm, textAlign: "center" },
});
