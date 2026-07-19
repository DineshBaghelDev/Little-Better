import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "../theme";

type Category = { _id: string; name: string };

export function CategoryDropdown({
  categories,
  onDelete,
  onSelect,
  selected,
}: {
  categories: Category[];
  onDelete: (id: string) => void;
  onSelect: (name: string) => void;
  selected: string;
}) {
  const [open, setOpen] = useState(false);
  const [managing, setManaging] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable accessibilityRole="button" onPress={() => setOpen((value) => !value)} style={styles.trigger}>
        <Ionicons color={colors.primaryDark} name="pricetag-outline" size={20} />
        <View style={styles.grow}>
          <Text style={styles.label}>Category</Text>
          <Text style={styles.value}>{selected || "Choose category"}</Text>
        </View>
        <Ionicons color={colors.muted} name={open ? "chevron-up" : "chevron-down"} size={18} />
      </Pressable>
      {open ? (
        <View style={styles.menu}>
          {categories.map((category) => (
            <Pressable
              accessibilityRole="button"
              key={category._id}
              onPress={() => {
                onSelect(category.name);
                setOpen(false);
              }}
              style={styles.option}
            >
              <Text style={styles.optionText}>{category.name}</Text>
              {selected === category.name ? <Ionicons color={colors.primaryDark} name="checkmark" size={20} /> : null}
            </Pressable>
          ))}
          <Pressable accessibilityRole="button" onPress={() => setManaging((value) => !value)} style={styles.manageToggle}>
            <Ionicons color={colors.coral} name={managing ? "close" : "trash-outline"} size={18} />
            <Text style={styles.manageText}>{managing ? "Done managing" : "Manage categories"}</Text>
          </Pressable>
          {managing ? (
            <View style={styles.manageList}>
              {categories.map((category) => (
                <View key={`manage-${category._id}`} style={styles.manageRow}>
                  <Text style={styles.optionText}>{category.name}</Text>
                  <Pressable accessibilityLabel={`Delete ${category.name} category`} accessibilityRole="button" onPress={() => onDelete(category._id)} style={styles.deleteButton}>
                    <Ionicons color={colors.coral} name="trash-outline" size={20} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
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
    maxHeight: 360,
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
  option: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  optionText: { color: colors.text, flex: 1, fontSize: 14, fontWeight: "600" },
  manageToggle: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  manageText: { color: colors.coral, fontSize: 14, fontWeight: "700" },
  manageList: { backgroundColor: colors.coralSurface, borderTopColor: colors.border, borderTopWidth: 1 },
  manageRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 52,
    paddingLeft: spacing.md,
  },
  deleteButton: { alignItems: "center", height: 52, justifyContent: "center", width: 56 },
});
