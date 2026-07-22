import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { api } from "../convex/_generated/api";
import { HourField } from "../src/components/HourField";
import { Screen } from "../src/components/Screen";
import { Mascot, PrimaryButton, SectionLabel, Surface, useAppearance } from "../src/components/ui";
import { backgroundPatterns, colorSchemes, colors, navStyles, radii, spacing } from "../src/theme";

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
  const appearance = useAppearance();
  const [form, setForm] = useState({
    backgroundPattern: "sprouts",
    colorScheme: "sage",
    focusName: "",
    monthlyBudget: "",
    navStyle: "floating",
    notificationsEnabled: false,
    preferredHour: "",
    reflectionHour: "",
    targetType: "sessions_per_week" as TargetType,
    targetValue: "",
  });

  useEffect(() => {
    if (!settings?.settings || !settings.focusCategory) return;
    setForm({
      backgroundPattern: settings.settings.backgroundPattern ?? "sprouts",
      colorScheme: settings.settings.colorScheme ?? "sage",
      focusName: settings.focusCategory.name,
      monthlyBudget: String(settings.settings.monthlyBudget),
      navStyle: settings.settings.navStyle ?? "floating",
      notificationsEnabled: settings.settings.notificationsEnabled ?? false,
      preferredHour: String(settings.focusCategory.preferredHour ?? 9),
      reflectionHour: String(settings.settings.reflectionHour),
      targetType: settings.focusCategory.targetType,
      targetValue: String(settings.focusCategory.targetValue ?? 3),
    });
  }, [settings?.focusCategory, settings?.settings]);

  async function save() {
    await updateSettings({
      backgroundPattern: form.backgroundPattern as "none" | "sprouts" | "dots" | "stars",
      colorScheme: form.colorScheme as "sage" | "teal" | "lavender" | "coral" | "mustard",
      focusName: form.focusName,
      monthlyBudget: Number(form.monthlyBudget) || 0,
      navStyle: form.navStyle as "floating" | "classic" | "compact",
      notificationsEnabled: form.notificationsEnabled,
      preferredHour: Number(form.preferredHour) || 9,
      reflectionHour: Number(form.reflectionHour) || 20,
      targetType: form.targetType,
      targetValue: Number(form.targetValue) || 1,
    });
    router.back();
  }

  const goalUnit = (targetOptions.find((option) => option.type === form.targetType)?.label ?? "").toLowerCase();

  return (
    <Screen
      headerAction={
        <Pressable accessibilityLabel="Close settings" accessibilityRole="button" onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons color={colors.text} name="close" size={22} />
        </Pressable>
      }
      subtitle="Set your habit goal, daily times, and budget"
      title="Settings"
    >
      <Surface style={[styles.hero, { backgroundColor: appearance.surface }]}>
        <Mascot size={120} variant="relaxed" />
        <View style={styles.grow}>
          <Text style={styles.heroTitle}>One thing at a time</Text>
          <Text style={styles.heroMeta}>Tune your plan below. Sprout keeps the rest simple.</Text>
        </View>
      </Surface>

      <SectionLabel>Your focus goal</SectionLabel>
      <Surface style={styles.form}>
        <Text style={styles.summary}>
          You&apos;re aiming for {form.targetValue || "3"} {goalUnit} of {(form.focusName || "your focus").trim()}.
        </Text>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>What are you working on?</Text>
          <TextInput accessibilityLabel="Tracked focus category" onChangeText={(focusName) => setForm((current) => ({ ...current, focusName }))} placeholder="e.g. Study, Gym, Reading" placeholderTextColor={colors.muted} style={styles.input} value={form.focusName} />
          <Text style={styles.fieldHelp}>Your one habit or life area. It shows on Today and Progress.</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>How do you want to measure it?</Text>
          <View style={styles.options}>
            {targetOptions.map((option) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: form.targetType === option.type }}
                key={option.type}
                onPress={() => setForm((current) => ({ ...current, targetType: option.type }))}
                style={[styles.option, form.targetType === option.type && { backgroundColor: appearance.surface, borderColor: appearance.primary }]}
              >
                <View style={styles.grow}>
                  <Text style={styles.optionTitle}>{option.label}</Text>
                  <Text style={styles.meta}>{option.description}</Text>
                </View>
                {form.targetType === option.type ? <Ionicons color={appearance.primaryDark} name="checkmark" size={20} /> : null}
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Your goal</Text>
          <View style={styles.amountRow}>
            <TextInput accessibilityLabel="Goal amount" keyboardType="number-pad" onChangeText={(targetValue) => setForm((current) => ({ ...current, targetValue }))} placeholder="3" placeholderTextColor={colors.muted} style={styles.amountInput} value={form.targetValue} />
            <Text style={styles.amountSuffix}>{goalUnit}</Text>
          </View>
        </View>
      </Surface>

      <SectionLabel>Daily times</SectionLabel>
      <Surface style={styles.form}>
        <HourField
          help="When we nudge you to start your focus session."
          label="Focus reminder"
          onChange={(hour) => setForm((current) => ({ ...current, preferredHour: String(hour) }))}
          value={Number(form.preferredHour) || 9}
        />
        <HourField
          help="Evening check-in on how your day went. Between 5 PM and 11 PM."
          label="Reflection reminder"
          maxHour={23}
          minHour={17}
          onChange={(hour) => setForm((current) => ({ ...current, reflectionHour: String(hour) }))}
          value={Number(form.reflectionHour) || 20}
        />
      </Surface>

      <SectionLabel>Monthly budget</SectionLabel>
      <Surface style={styles.form}>
        <View style={styles.field}>
          <View style={styles.amountRow}>
            <Text style={styles.amountPrefix}>₹</Text>
            <TextInput accessibilityLabel="Monthly budget" keyboardType="number-pad" onChangeText={(monthlyBudget) => setForm((current) => ({ ...current, monthlyBudget }))} placeholder="10000" placeholderTextColor={colors.muted} style={styles.amountInput} value={form.monthlyBudget} />
          </View>
          <Text style={styles.fieldHelp}>Used by Money alerts and Progress summaries.</Text>
        </View>
        <PrimaryButton label="Save settings" onPress={save} />
      </Surface>

      <SectionLabel>Appearance</SectionLabel>
      <Surface style={styles.form}>
        <ChoiceGroup
          label="Color scheme"
          options={Object.entries(colorSchemes).map(([value, item]) => ({ color: item.primary, label: item.label, value }))}
          selected={form.colorScheme}
          onSelect={(colorScheme) => setForm((current) => ({ ...current, colorScheme }))}
        />
        <ChoiceGroup
          label="Background pattern"
          options={Object.entries(backgroundPatterns).map(([value, label]) => ({ label, value }))}
          selected={form.backgroundPattern}
          onSelect={(backgroundPattern) => setForm((current) => ({ ...current, backgroundPattern }))}
        />
        <ChoiceGroup
          label="Navigation"
          options={Object.entries(navStyles).map(([value, label]) => ({ label, value }))}
          selected={form.navStyle}
          onSelect={(navStyle) => setForm((current) => ({ ...current, navStyle }))}
        />
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
          <Ionicons color={form.notificationsEnabled ? appearance.primaryDark : colors.muted} name={form.notificationsEnabled ? "toggle" : "toggle-outline"} size={32} />
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
            {settings?.settings?.focusCategoryId === category._id ? <Text style={[styles.active, { color: appearance.primaryDark }]}>Active</Text> : null}
          </View>
        ))}
      </Surface>
    </Screen>
  );
}

function ChoiceGroup({
  label,
  onSelect,
  options,
  selected,
}: {
  label: string;
  onSelect: (value: string) => void;
  options: { color?: string; label: string; value: string }[];
  selected: string;
}) {
  const appearance = useAppearance();
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.choiceRow}>
        {options.map((option) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: selected === option.value }}
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={[styles.choice, selected === option.value && { backgroundColor: appearance.surface, borderColor: appearance.primary }]}
          >
            {option.color ? <View style={[styles.swatch, { backgroundColor: option.color }]} /> : null}
            <Text style={styles.choiceText}>{option.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconButton: { alignItems: "center", height: 44, justifyContent: "center", width: 44 },
  form: { gap: spacing.md, padding: spacing.md },
  hero: { alignItems: "center", backgroundColor: colors.sageSurface, flexDirection: "row", gap: spacing.md, padding: spacing.md },
  heroTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  heroMeta: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: spacing.xs },
  summary: { color: colors.text, fontSize: 15, fontWeight: "700", lineHeight: 21 },
  field: { gap: spacing.xs },
  fieldLabel: { color: colors.text, fontSize: 14, fontWeight: "700" },
  fieldHelp: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.control, borderWidth: 1, color: colors.text, fontSize: 15, minHeight: 48, paddingHorizontal: spacing.md },
  amountRow: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.control, borderWidth: 1, flexDirection: "row", minHeight: 48, paddingHorizontal: spacing.md },
  amountPrefix: { color: colors.muted, fontSize: 15, fontWeight: "700", marginRight: spacing.xs },
  amountSuffix: { color: colors.muted, fontSize: 13, fontWeight: "600", marginLeft: spacing.xs },
  amountInput: { color: colors.text, flex: 1, fontSize: 15 },
  options: { gap: spacing.sm },
  option: { alignItems: "center", borderColor: colors.border, borderRadius: radii.control, borderWidth: 1, flexDirection: "row", gap: spacing.sm, minHeight: 64, padding: spacing.md },
  optionTitle: { color: colors.text, fontSize: 14, fontWeight: "700" },
  choiceRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  choice: { alignItems: "center", borderColor: colors.border, borderRadius: radii.pill, borderWidth: 1, flexDirection: "row", gap: spacing.xs, minHeight: 42, paddingHorizontal: spacing.md },
  choiceText: { color: colors.text, fontSize: 13, fontWeight: "700" },
  swatch: { borderColor: colors.border, borderRadius: radii.pill, borderWidth: 1, height: 18, width: 18 },
  notice: { gap: spacing.xs, padding: spacing.md },
  toggleRow: { alignItems: "center", flexDirection: "row", gap: spacing.md, minHeight: 72, padding: spacing.md },
  row: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", minHeight: 64, paddingHorizontal: spacing.md },
  grow: { flex: 1 },
  title: { color: colors.text, fontSize: 15, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 12, marginTop: spacing.xs },
  active: { color: colors.primaryDark, fontSize: 13, fontWeight: "700" },
});
