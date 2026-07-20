import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { PropsWithChildren, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { api } from "../convex/_generated/api";
import { Screen } from "../src/components/Screen";
import { PrimaryButton, SectionLabel, Surface } from "../src/components/ui";
import { colors, radii, spacing } from "../src/theme";

type TargetType = "sessions_per_week" | "minutes_per_day" | "minutes_per_week" | "binary_days";

const targetOptions = [
  {
    description: "Counts how many focus sessions you finish in a week.",
    label: "Sessions / week",
    type: "sessions_per_week",
  },
  {
    description: "Tracks minutes completed each day.",
    label: "Minutes / day",
    type: "minutes_per_day",
  },
  {
    description: "Adds all focus minutes completed across the week.",
    label: "Minutes / week",
    type: "minutes_per_week",
  },
  {
    description: "Counts days where you did at least one focus session.",
    label: "Days / week",
    type: "binary_days",
  },
] as const satisfies readonly { description: string; label: string; type: TargetType }[];

export default function SettingsScreen() {
  const settings = useQuery(api.core.settingsView);
  const updateSettings = useMutation(api.core.updateSettings);
  const [form, setForm] = useState({
    focusName: "",
    monthlyBudget: "",
    notificationsEnabled: false,
    preferredHour: "",
    reflectionHour: "",
    targetType: "sessions_per_week" as TargetType,
    targetValue: "",
  });

  useEffect(() => {
    if (!settings?.settings || !settings.focusCategory) return;
    setForm({
      focusName: settings.focusCategory.name,
      monthlyBudget: String(settings.settings.monthlyBudget),
      notificationsEnabled: settings.settings.notificationsEnabled ?? false,
      preferredHour: String(settings.focusCategory.preferredHour ?? 9),
      reflectionHour: String(settings.settings.reflectionHour),
      targetType: settings.focusCategory.targetType,
      targetValue: String(settings.focusCategory.targetValue ?? 3),
    });
  }, [settings?.focusCategory, settings?.settings]);

  async function save() {
    await updateSettings({
      focusName: form.focusName,
      monthlyBudget: Number(form.monthlyBudget) || 0,
      notificationsEnabled: form.notificationsEnabled,
      preferredHour: Number(form.preferredHour) || 9,
      reflectionHour: Number(form.reflectionHour) || 20,
      targetType: form.targetType,
      targetValue: Number(form.targetValue) || 1,
    });
    router.back();
  }

  return (
    <Screen
      headerAction={
        <Pressable accessibilityLabel="Close settings" accessibilityRole="button" onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons color={colors.text} name="close" size={22} />
        </Pressable>
      }
      subtitle="Focus, reflection, budget, and reminders"
      title="Settings"
    >
      <Surface style={styles.form}>
        <Field help="This is the habit or life area shown on Today and Progress." label="Focus area">
          <TextInput accessibilityLabel="Tracked focus category" onChangeText={(focusName) => setForm((current) => ({ ...current, focusName }))} placeholder="Study" placeholderTextColor={colors.muted} style={styles.input} value={form.focusName} />
        </Field>
        <Field help="The number to hit for the goal type below, like 3 sessions or 120 minutes." label="Target value">
          <TextInput accessibilityLabel="Target value" keyboardType="number-pad" onChangeText={(targetValue) => setForm((current) => ({ ...current, targetValue }))} placeholder="3" placeholderTextColor={colors.muted} style={styles.input} value={form.targetValue} />
        </Field>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Goal type</Text>
          <Text style={styles.fieldHelp}>Choose how Little Better decides your focus goal is complete.</Text>
          <View style={styles.options}>
            {targetOptions.map((option) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: form.targetType === option.type }}
                key={option.type}
                onPress={() => setForm((current) => ({ ...current, targetType: option.type }))}
                style={[styles.option, form.targetType === option.type && styles.optionSelected]}
              >
                <View style={styles.grow}>
                  <Text style={styles.optionTitle}>{option.label}</Text>
                  <Text style={styles.meta}>{option.description}</Text>
                </View>
                {form.targetType === option.type ? <Ionicons color={colors.primaryDark} name="checkmark" size={20} /> : null}
              </Pressable>
            ))}
          </View>
        </View>
        <Field help="Use 24-hour time for your focus reminder. Example: 17 means 5 PM." label="Preferred focus hour">
          <TextInput accessibilityLabel="Preferred focus hour" keyboardType="number-pad" onChangeText={(preferredHour) => setForm((current) => ({ ...current, preferredHour }))} placeholder="9" placeholderTextColor={colors.muted} style={styles.input} value={form.preferredHour} />
        </Field>
        <Field help="Use 17 to 23. This controls the evening reflection reminder." label="Reflection hour">
          <TextInput accessibilityLabel="Evening reflection hour" keyboardType="number-pad" onChangeText={(reflectionHour) => setForm((current) => ({ ...current, reflectionHour }))} placeholder="20" placeholderTextColor={colors.muted} style={styles.input} value={form.reflectionHour} />
        </Field>
        <Field help="Monthly spending limit used by Money alerts and Progress summaries." label="Monthly budget">
          <TextInput accessibilityLabel="Monthly budget" keyboardType="number-pad" onChangeText={(monthlyBudget) => setForm((current) => ({ ...current, monthlyBudget }))} placeholder="10000" placeholderTextColor={colors.muted} style={styles.input} value={form.monthlyBudget} />
        </Field>
        <PrimaryButton label="Save settings" onPress={save} />
      </Surface>

      <SectionLabel>Notification controls</SectionLabel>
      <Surface>
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: form.notificationsEnabled }}
          onPress={() => setForm((current) => ({ ...current, notificationsEnabled: !current.notificationsEnabled }))}
          style={styles.toggleRow}
        >
          <View style={styles.grow}>
            <Text style={styles.title}>Reminders</Text>
            <Text style={styles.meta}>Tasks, focus, reflection, pending expenses, and weekly insights.</Text>
          </View>
          <Ionicons color={form.notificationsEnabled ? colors.primaryDark : colors.muted} name={form.notificationsEnabled ? "toggle" : "toggle-outline"} size={32} />
        </Pressable>
        <View style={styles.notice}>
          <Text style={styles.meta}>If permission is denied, Today, Money, and Progress remain the manual fallback.</Text>
        </View>
      </Surface>

      <SectionLabel>Focus history</SectionLabel>
      <Surface>
        {(settings?.focusCategories ?? []).map((category) => (
          <View key={category._id} style={styles.row}>
            <View style={styles.grow}>
              <Text style={styles.title}>{category.name}</Text>
              <Text style={styles.meta}>
                {category.targetValue ?? 1} {targetOptions.find((option) => option.type === category.targetType)?.label ?? "target"}
              </Text>
            </View>
            {settings?.settings?.focusCategoryId === category._id ? <Text style={styles.active}>Active</Text> : null}
          </View>
        ))}
      </Surface>
    </Screen>
  );
}

function Field({ children, help, label }: PropsWithChildren<{ help: string; label: string }>) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      <Text style={styles.fieldHelp}>{help}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconButton: { alignItems: "center", height: 44, justifyContent: "center", width: 44 },
  form: { gap: spacing.md, padding: spacing.md },
  field: { gap: spacing.xs },
  fieldLabel: { color: colors.text, fontSize: 14, fontWeight: "700" },
  fieldHelp: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.control, borderWidth: 1, color: colors.text, fontSize: 15, minHeight: 48, paddingHorizontal: spacing.md },
  options: { gap: spacing.sm },
  option: { alignItems: "center", borderColor: colors.border, borderRadius: radii.control, borderWidth: 1, flexDirection: "row", gap: spacing.sm, minHeight: 64, padding: spacing.md },
  optionSelected: { backgroundColor: colors.sageSurface, borderColor: colors.primary },
  optionTitle: { color: colors.text, fontSize: 14, fontWeight: "700" },
  notice: { gap: spacing.xs, padding: spacing.md },
  toggleRow: { alignItems: "center", flexDirection: "row", gap: spacing.md, minHeight: 72, padding: spacing.md },
  row: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", minHeight: 64, paddingHorizontal: spacing.md },
  grow: { flex: 1 },
  title: { color: colors.text, fontSize: 15, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 12, marginTop: spacing.xs },
  active: { color: colors.primaryDark, fontSize: 13, fontWeight: "700" },
});
