import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { api } from "../convex/_generated/api";
import { Screen } from "../src/components/Screen";
import { PrimaryButton, SectionLabel, Surface } from "../src/components/ui";
import { colors, radii, spacing } from "../src/theme";

type TargetType = "sessions_per_week" | "minutes_per_day" | "minutes_per_week" | "binary_days";

const targetOptions = [
  ["sessions_per_week", "Sessions / week"],
  ["minutes_per_day", "Minutes / day"],
  ["minutes_per_week", "Minutes / week"],
  ["binary_days", "Days / week"],
] as const satisfies readonly [TargetType, string][];

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
        <TextInput accessibilityLabel="Tracked focus category" onChangeText={(focusName) => setForm((current) => ({ ...current, focusName }))} placeholder="Focus area" placeholderTextColor={colors.muted} style={styles.input} value={form.focusName} />
        <TextInput accessibilityLabel="Target value" keyboardType="number-pad" onChangeText={(targetValue) => setForm((current) => ({ ...current, targetValue }))} placeholder="Target value" placeholderTextColor={colors.muted} style={styles.input} value={form.targetValue} />
        <View style={styles.chips}>
          {targetOptions.map(([type, label]) => (
            <Chip key={type} label={label} selected={form.targetType === type} onPress={() => setForm((current) => ({ ...current, targetType: type }))} />
          ))}
        </View>
        <TextInput accessibilityLabel="Preferred focus hour" keyboardType="number-pad" onChangeText={(preferredHour) => setForm((current) => ({ ...current, preferredHour }))} placeholder="Focus hour, 0 to 23" placeholderTextColor={colors.muted} style={styles.input} value={form.preferredHour} />
        <TextInput accessibilityLabel="Evening reflection hour" keyboardType="number-pad" onChangeText={(reflectionHour) => setForm((current) => ({ ...current, reflectionHour }))} placeholder="Reflection hour, 17 to 23" placeholderTextColor={colors.muted} style={styles.input} value={form.reflectionHour} />
        <TextInput accessibilityLabel="Monthly budget" keyboardType="number-pad" onChangeText={(monthlyBudget) => setForm((current) => ({ ...current, monthlyBudget }))} placeholder="Monthly budget" placeholderTextColor={colors.muted} style={styles.input} value={form.monthlyBudget} />
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
                {category.targetValue ?? 1} {targetOptions.find(([type]) => type === category.targetType)?.[1] ?? "target"}
              </Text>
            </View>
            {settings?.settings?.focusCategoryId === category._id ? <Text style={styles.active}>Active</Text> : null}
          </View>
        ))}
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
  iconButton: { alignItems: "center", height: 44, justifyContent: "center", width: 44 },
  form: { gap: spacing.sm, padding: spacing.md },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.control, borderWidth: 1, color: colors.text, fontSize: 15, minHeight: 48, paddingHorizontal: spacing.md },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: { alignItems: "center", borderColor: colors.border, borderRadius: radii.pill, borderWidth: 1, justifyContent: "center", minHeight: 44, paddingHorizontal: spacing.md },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 13, fontWeight: "600" },
  chipTextSelected: { color: colors.surface },
  notice: { gap: spacing.xs, padding: spacing.md },
  toggleRow: { alignItems: "center", flexDirection: "row", gap: spacing.md, minHeight: 72, padding: spacing.md },
  row: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", minHeight: 64, paddingHorizontal: spacing.md },
  grow: { flex: 1 },
  title: { color: colors.text, fontSize: 15, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 12, marginTop: spacing.xs },
  active: { color: colors.primaryDark, fontSize: 13, fontWeight: "700" },
});
