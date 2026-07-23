import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "../convex/_generated/api";
import { Mascot, PrimaryButton, useAppearance } from "../src/components/ui";
import { enqueueOffline } from "../src/offlineQueue";
import { colors, radii, spacing } from "../src/theme";

const descriptors = [
  ["Productive", "leaf-outline", colors.sageSurface],
  ["Distracted", "flash-outline", colors.lavenderSurface],
  ["Tired", "moon-outline", colors.mustardSurface],
  ["Stressed", "pulse-outline", colors.coralSurface],
  ["Good day", "sunny-outline", colors.sageSurface],
] as const;

export default function ReflectionScreen() {
  const viewer = useQuery(api.core.viewer);
  const addReflection = useMutation(api.core.addReflection);
  const dismissReflection = useMutation(api.core.dismissReflection);
  const snoozeReflection = useMutation(api.core.snoozeReflection);
  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [syncMessage, setSyncMessage] = useState("");
  const appearance = useAppearance();

  function toggle(label: string) {
    setSelected((items) => items.includes(label) ? items.filter((item) => item !== label) : [...items, label]);
  }

  async function finish() {
    if (!selected.length && !note.trim()) await dismissReflection({});
    else {
      const payload = { note, tags: selected };
      try {
        await addReflection(payload);
      } catch {
        if (!viewer) return;
        await enqueueOffline(viewer._id, "addReflection", payload);
        setSyncMessage("Saved offline. It will sync when the app reconnects.");
        return;
      }
    }
    router.back();
  }

  async function skip() {
    await dismissReflection({});
    router.back();
  }

  async function snooze() {
    await snoozeReflection({});
    router.back();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.grow}>
      <ScrollView automaticallyAdjustKeyboardInsets contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable accessibilityLabel="Close reflection" accessibilityRole="button" onPress={() => router.back()} style={styles.close}>
          <Ionicons color={colors.text} name="close" size={24} />
        </Pressable>
        <Text style={styles.title}>What affected your day?</Text>
        <Text style={styles.subtitle}>Pick all that apply.</Text>
        <View style={styles.mascot}><Mascot size={160} variant="reflection" /></View>

        <View style={styles.options}>
          {descriptors.map(([label, icon, background]) => {
            const isSelected = selected.includes(label);
            return (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                key={label}
                onPress={() => toggle(label)}
                style={[styles.option, { backgroundColor: background }, isSelected && { borderColor: appearance.primary }]}
              >
                <Ionicons color={appearance.primaryDark} name={icon} size={21} />
                <Text style={styles.optionLabel}>{label}</Text>
                {isSelected ? <Ionicons color={appearance.primaryDark} name="checkmark-circle" size={22} /> : null}
              </Pressable>
            );
          })}
        </View>

        <TextInput
          accessibilityLabel="Optional reflection note"
          multiline
          onChangeText={setNote}
          placeholder="Anything else? (optional)"
          placeholderTextColor={colors.muted}
          style={styles.note}
          value={note}
        />
        <PrimaryButton label="Done" onPress={finish} />
        {syncMessage ? <Text style={styles.syncText}>{syncMessage}</Text> : null}
        <Pressable accessibilityRole="button" onPress={snooze} style={styles.skip}>
          <Text style={styles.skipText}>Snooze</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={skip} style={styles.skip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  grow: { flex: 1 },
  content: { alignSelf: "center", maxWidth: 720, padding: spacing.lg, paddingBottom: spacing.xl, width: "100%" },
  close: { alignItems: "center", height: 44, justifyContent: "center", marginLeft: -10, width: 44 },
  title: { color: colors.text, fontSize: 30, fontWeight: "700", lineHeight: 36, marginTop: spacing.md, textAlign: "center" },
  subtitle: { color: colors.muted, fontSize: 15, marginTop: spacing.sm, textAlign: "center" },
  mascot: { alignItems: "center", marginVertical: spacing.lg },
  options: { gap: spacing.sm },
  option: { alignItems: "center", borderColor: "transparent", borderRadius: radii.pill, borderWidth: 2, flexDirection: "row", gap: spacing.md, minHeight: 52, paddingHorizontal: spacing.md },
  optionSelected: { borderColor: colors.primary },
  optionLabel: { color: colors.text, flex: 1, fontSize: 15, fontWeight: "600" },
  note: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.card, borderWidth: 1, color: colors.text, fontSize: 15, marginVertical: spacing.lg, minHeight: 88, padding: spacing.md, textAlignVertical: "top" },
  skip: { alignItems: "center", minHeight: 44, paddingTop: spacing.md },
  skipText: { color: colors.muted, fontSize: 14, fontWeight: "600" },
  syncText: { color: colors.primaryDark, fontSize: 13, fontWeight: "600", marginTop: spacing.sm, textAlign: "center" },
});
