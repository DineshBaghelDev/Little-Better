import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "../theme";

type Option<T extends string> = { label: string; value: T };

export function ChoiceDropdown<T extends string>({
  label,
  onSelect,
  options,
  value,
}: {
  label: string;
  onSelect: (value: T) => void;
  options: Option<T>[];
  value: T;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value)?.label ?? "Choose";

  return (
    <View style={styles.container}>
      <Pressable accessibilityRole="button" onPress={() => setOpen((current) => !current)} style={styles.trigger}>
        <View style={styles.grow}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{selected}</Text>
        </View>
        <Ionicons color={colors.muted} name={open ? "chevron-up" : "chevron-down"} size={18} />
      </Pressable>
      {open ? (
        <View style={styles.menu}>
          <ScrollView nestedScrollEnabled style={styles.menuScroll}>
            {options.map((option) => (
              <Pressable
                accessibilityRole="button"
                key={option.value}
                onPress={() => {
                  onSelect(option.value);
                  setOpen(false);
                }}
                style={styles.option}
              >
                <Text style={styles.optionText}>{option.label}</Text>
                {option.value === value ? <Ionicons color={colors.primaryDark} name="checkmark" size={20} /> : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "relative", zIndex: 20 },
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
  grow: { flex: 1 },
  label: { color: colors.muted, fontSize: 12 },
  value: { color: colors.text, fontSize: 15, fontWeight: "600", marginTop: 2 },
  menu: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.card,
    borderWidth: 1,
    elevation: 8,
    left: 0,
    overflow: "hidden",
    position: "absolute",
    right: 0,
    shadowColor: colors.text,
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    top: 60,
    zIndex: 30,
  },
  menuScroll: { maxHeight: 420 },
  option: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  optionText: { color: colors.text, flex: 1, fontSize: 14, fontWeight: "600" },
});
