import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "../convex/_generated/api";
import { PrimaryButton, Surface } from "../src/components/ui";
import { colors, radii, spacing } from "../src/theme";

const types = [
  ["Task", "Action or to-do", "checkbox-outline", colors.lavenderSurface],
  ["Expense", "Spend or purchase", "cash-outline", colors.sageSurface],
  ["Focus", "Start or log focus", "timer-outline", colors.lavenderSurface],
  ["Note", "Save as a task note", "document-text-outline", colors.mustardSurface],
  ["Voice", "Type the captured words", "mic-outline", colors.coralSurface],
] as const;

export default function QuickAddModal() {
  const addTask = useMutation(api.core.addTask);
  const addExpense = useMutation(api.core.addExpense);
  const addManualFocus = useMutation(api.core.addManualFocus);
  const startFocus = useMutation(api.core.startFocus);
  const [selected, setSelected] = useState<string | null>(null);
  const [value, setValue] = useState("");

  async function save() {
    const text = value.trim();
    if (selected === "Focus") {
      if (text) await addManualFocus({ minutes: Number(text) || 30 });
      else await startFocus({});
      router.back();
      return;
    }
    if (!text) return;
    if (selected === "Expense") {
      await addExpense({
        amount: Number(text.replace(/[^0-9.]/g, "")),
        category: text.replace(/[0-9.]/g, "").trim() || "General",
      });
    } else {
      await addTask({ title: text });
    }
    router.back();
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.overlay}>
      <Pressable accessibilityLabel="Close quick add" onPress={() => router.back()} style={styles.scrim} />
      <SafeAreaView edges={["bottom"]} style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.headingRow}>
          <View>
            <Text style={styles.title}>What would you like to add?</Text>
            <Text style={styles.subtitle}>Captured items update Today.</Text>
          </View>
          <Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={() => router.back()} style={styles.close}>
            <Ionicons color={colors.text} name="close" size={22} />
          </Pressable>
        </View>

        {selected ? (
          <View style={styles.confirmation}>
            <Text style={styles.selectedLabel}>{selected}</Text>
            <TextInput
              accessibilityLabel={`${selected} details`}
              autoFocus
              onChangeText={setValue}
              placeholder={selected === "Focus" ? "Minutes completed, or leave blank to start" : `Describe your ${selected.toLowerCase()}`}
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={value}
            />
            <PrimaryButton label={value.trim() || selected === "Focus" ? `Save ${selected.toLowerCase()}` : "Add details"} onPress={save} />
            <Pressable accessibilityRole="button" onPress={() => setSelected(null)} style={styles.changeType}>
              <Text style={styles.changeTypeText}>Choose another type</Text>
            </Pressable>
          </View>
        ) : (
          <Surface>
            {types.map(([title, detail, icon, background]) => (
              <Pressable accessibilityRole="button" key={title} onPress={() => setSelected(title)} style={styles.typeRow}>
                <View style={[styles.typeIcon, { backgroundColor: background }]}>
                  <Ionicons color={colors.primaryDark} name={icon} size={22} />
                </View>
                <View style={styles.grow}>
                  <Text style={styles.typeTitle}>{title}</Text>
                  <Text style={styles.typeDetail}>{detail}</Text>
                </View>
                <Ionicons color={colors.muted} name="chevron-forward" size={18} />
              </Pressable>
            ))}
          </Surface>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(47,58,51,0.42)" },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg },
  handle: { alignSelf: "center", backgroundColor: colors.border, borderRadius: radii.pill, height: 4, marginBottom: spacing.lg, width: 48 },
  headingRow: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: 20, fontWeight: "700" },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: spacing.xs },
  close: { alignItems: "center", height: 44, justifyContent: "center", width: 44 },
  typeRow: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: spacing.md, minHeight: 68, paddingHorizontal: spacing.md },
  typeIcon: { alignItems: "center", borderRadius: radii.pill, height: 40, justifyContent: "center", width: 40 },
  grow: { flex: 1 },
  typeTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  typeDetail: { color: colors.muted, fontSize: 12, marginTop: 3 },
  confirmation: { gap: spacing.md },
  selectedLabel: { color: colors.primaryDark, fontSize: 14, fontWeight: "700" },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.control, borderWidth: 1, color: colors.text, fontSize: 16, minHeight: 52, paddingHorizontal: spacing.md },
  changeType: { alignItems: "center", minHeight: 44, paddingTop: spacing.sm },
  changeTypeText: { color: colors.primaryDark, fontSize: 14, fontWeight: "600" },
});
