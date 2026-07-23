import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radii, spacing } from "../theme";
import { PrimaryButton, useAppearance } from "./ui";

export function hourLabel(hour: number) {
  const h = ((hour % 24) + 24) % 24;
  const suffix = h < 12 ? "AM" : "PM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:00 ${suffix}`;
}

export function HourField({
  help,
  label,
  maxHour = 23,
  minHour = 0,
  onChange,
  value,
}: {
  help?: string;
  label: string;
  maxHour?: number;
  minHour?: number;
  onChange: (hour: number) => void;
  value: number;
}) {
  const appearance = useAppearance();
  const [open, setOpen] = useState(false);
  const hours = Array.from({ length: maxHour - minHour + 1 }, (_, index) => minHour + index);
  const safeValue = Math.max(minHour, Math.min(maxHour, value));

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={() => setOpen(true)} style={styles.trigger}>
        <Ionicons color={appearance.primaryDark} name="time-outline" size={20} />
        <Text style={styles.value}>{hourLabel(safeValue)}</Text>
        <Ionicons color={colors.muted} name="chevron-down" size={18} />
      </Pressable>
      {help ? <Text style={styles.help}>{help}</Text> : null}
      <Modal animationType="fade" transparent visible={open} onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.backdrop}>
          <Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={() => setOpen(false)} style={StyleSheet.absoluteFill} />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <ScrollView contentContainerStyle={styles.grid} style={styles.gridScroll}>
              {hours.map((hour) => {
                const selected = hour === safeValue;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    key={hour}
                    onPress={() => {
                      onChange(hour);
                      setOpen(false);
                    }}
                    style={[styles.option, selected && { backgroundColor: appearance.primary, borderColor: appearance.primary }]}
                  >
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{hourLabel(hour)}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <PrimaryButton label="Done" onPress={() => setOpen(false)} />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  label: { color: colors.text, fontSize: 14, fontWeight: "700" },
  trigger: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  value: { color: colors.text, flex: 1, fontSize: 15, fontWeight: "600" },
  help: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  backdrop: { alignItems: "center", backgroundColor: "rgba(47,58,51,0.42)", flex: 1, justifyContent: "center", padding: spacing.lg },
  sheet: { backgroundColor: colors.surface, borderRadius: radii.card, gap: spacing.md, maxWidth: 380, padding: spacing.lg, width: "100%" },
  sheetTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  gridScroll: { maxHeight: 320 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  option: { alignItems: "center", borderColor: colors.border, borderRadius: radii.pill, borderWidth: 1, justifyContent: "center", minHeight: 44, paddingHorizontal: spacing.md, width: "31%" },
  optionText: { color: colors.text, fontSize: 13, fontWeight: "700" },
  optionTextSelected: { color: colors.surface },
});
