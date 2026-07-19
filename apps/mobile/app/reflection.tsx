import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { Mascot, PrimaryButton } from "../src/components/ui";
import { colors, radii, spacing } from "../src/theme";

const descriptors = [
  ["Productive", "leaf-outline", colors.sageSurface],
  ["Distracted", "flash-outline", colors.lavenderSurface],
  ["Tired", "moon-outline", colors.mustardSurface],
  ["Stressed", "pulse-outline", colors.coralSurface],
  ["Good day", "sunny-outline", colors.sageSurface],
] as const;

export default function ReflectionScreen() {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(label: string) {
    setSelected((items) => items.includes(label) ? items.filter((item) => item !== label) : [...items, label]);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable accessibilityLabel="Close reflection" accessibilityRole="button" onPress={() => router.back()} style={styles.close}>
          <Ionicons color={colors.text} name="close" size={24} />
        </Pressable>
        <Text style={styles.title}>What affected your day?</Text>
        <Text style={styles.subtitle}>Pick all that apply.</Text>
        <View style={styles.mascot}><Mascot size={132} /></View>

        <View style={styles.options}>
          {descriptors.map(([label, icon, background]) => {
            const isSelected = selected.includes(label);
            return (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                key={label}
                onPress={() => toggle(label)}
                style={[styles.option, { backgroundColor: background }, isSelected && styles.optionSelected]}
              >
                <Ionicons color={colors.primaryDark} name={icon} size={21} />
                <Text style={styles.optionLabel}>{label}</Text>
                {isSelected ? <Ionicons color={colors.primaryDark} name="checkmark-circle" size={22} /> : null}
              </Pressable>
            );
          })}
        </View>

        <TextInput
          accessibilityLabel="Optional reflection note"
          multiline
          placeholder="Anything else? (optional)"
          placeholderTextColor={colors.muted}
          style={styles.note}
        />
        <PrimaryButton label="Done" onPress={() => router.back()} />
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.skip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
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
});
