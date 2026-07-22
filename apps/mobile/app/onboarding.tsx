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
import { HourField } from "../src/components/HourField";
import { Chip, Mascot, PrimaryButton, Surface } from "../src/components/ui";
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
    notificationsEnabled: false,
    preferredHour: "9",
    reflectionHour: "20",
    targetType: "sessions_per_week" as TargetType,
    targetValue: "3",
  });

  async function startPlan() {
    await bootstrap({
      focusName: values.focusName,
      monthlyBudget: Number(values.monthlyBudget) || 0,
      notificationsEnabled: values.notificationsEnabled,
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
          <Mascot size={184} variant="watering" />
        </View>

        <View>
          <Text style={styles.title}>Set up your plan</Text>
          <Text style={styles.helper}>A few defaults make Today useful. You can change all of this later.</Text>
        </View>

        <Surface style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>What do you want to focus on?</Text>
            <TextInput
              accessibilityLabel="Tracked focus category"
              onChangeText={(focusName) => setValues((current) => ({ ...current, focusName }))}
              placeholder="e.g. Study, Gym, Reading"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={values.focusName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>How do you want to measure it?</Text>
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
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Weekly goal</Text>
            <View style={styles.amountRow}>
              <TextInput
                accessibilityLabel="Weekly session target"
                keyboardType="number-pad"
                onChangeText={(targetValue) => setValues((current) => ({ ...current, targetValue }))}
                placeholder="3"
                placeholderTextColor={colors.muted}
                style={styles.amountInput}
                value={values.targetValue}
              />
              <Text style={styles.amountSuffix}>{targetOptions.find(([type]) => type === values.targetType)?.[1] ?? ""}</Text>
            </View>
          </View>

          <HourField
            label="Preferred focus time"
            onChange={(hour) => setValues((current) => ({ ...current, preferredHour: String(hour) }))}
            value={Number(values.preferredHour) || 9}
          />
          <HourField
            label="Reflection time"
            maxHour={23}
            minHour={17}
            onChange={(hour) => setValues((current) => ({ ...current, reflectionHour: String(hour) }))}
            value={Number(values.reflectionHour) || 20}
          />

          <View style={styles.field}>
            <Text style={styles.label}>Monthly budget</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountPrefix}>₹</Text>
              <TextInput
                accessibilityLabel="Monthly budget"
                keyboardType="number-pad"
                onChangeText={(monthlyBudget) => setValues((current) => ({ ...current, monthlyBudget }))}
                placeholder="25000"
                placeholderTextColor={colors.muted}
                style={styles.amountInput}
                value={values.monthlyBudget}
              />
            </View>
          </View>

          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: values.notificationsEnabled }}
            onPress={() => setValues((current) => ({ ...current, notificationsEnabled: !current.notificationsEnabled }))}
            style={styles.toggleRow}
          >
            <View style={styles.toggleCopy}>
              <Text style={styles.setupLabel}>Reminders</Text>
              <Text style={styles.helperText}>Optional. You can skip and still use the app.</Text>
            </View>
            <Ionicons color={values.notificationsEnabled ? colors.primaryDark : colors.muted} name={values.notificationsEnabled ? "toggle" : "toggle-outline"} size={32} />
          </Pressable>
        </Surface>

        <PrimaryButton label="Start my plan" onPress={startPlan} />
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
  setupLabel: { color: colors.text, flex: 1, fontSize: 14, marginLeft: spacing.sm },
  form: { gap: spacing.md, marginTop: spacing.md, padding: spacing.md },
  field: { gap: spacing.xs },
  label: { color: colors.text, fontSize: 14, fontWeight: "700" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.control,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  amountRow: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.control, borderWidth: 1, flexDirection: "row", minHeight: 48, paddingHorizontal: spacing.md },
  amountPrefix: { color: colors.muted, fontSize: 15, fontWeight: "700", marginRight: spacing.xs },
  amountSuffix: { color: colors.muted, fontSize: 13, fontWeight: "600", marginLeft: spacing.xs },
  amountInput: { color: colors.text, flex: 1, fontSize: 15 },
  toggleRow: { alignItems: "center", borderColor: colors.border, borderRadius: radii.control, borderWidth: 1, flexDirection: "row", minHeight: 56, paddingHorizontal: spacing.md },
  toggleCopy: { flex: 1 },
  helperText: { color: colors.muted, fontSize: 12, marginTop: 2 },
  footnote: { color: colors.muted, fontSize: 12, marginTop: spacing.sm, textAlign: "center" },
});
