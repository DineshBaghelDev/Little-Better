import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radii, spacing } from "../theme";
import { useAppearance } from "./ui";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(value: number) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function dateInput(ms: number) {
  const date = new Date(ms);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day).getTime() : Date.now();
}

export function DatePickerField({
  defaultOpen = false,
  iconOnly = false,
  label,
  onChange,
  value,
}: {
  defaultOpen?: boolean;
  iconOnly?: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const appearance = useAppearance();
  const selected = useMemo(() => startOfDay(parseDateInput(value)), [value]);
  const [open, setOpen] = useState(defaultOpen);
  const [cursor, setCursor] = useState(() => {
    const date = new Date(selected);
    date.setDate(1);
    return date.getTime();
  });
  const cursorDate = new Date(cursor);
  const firstWeekday = new Date(cursorDate.getFullYear(), cursorDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(cursorDate.getFullYear(), cursorDate.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: firstWeekday + daysInMonth }, (_, index) =>
    index < firstWeekday ? null : new Date(cursorDate.getFullYear(), cursorDate.getMonth(), index - firstWeekday + 1),
  );

  function moveMonth(delta: number) {
    setCursor(new Date(cursorDate.getFullYear(), cursorDate.getMonth() + delta, 1).getTime());
  }

  return (
    <View>
      <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={() => setOpen(true)} style={iconOnly ? styles.iconTrigger : styles.trigger}>
        <Ionicons color={appearance.primaryDark} name="calendar-outline" size={20} />
        {!iconOnly ? <View style={styles.grow}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{dateInput(selected)}</Text>
        </View> : null}
        {!iconOnly ? <Ionicons color={colors.muted} name="chevron-down" size={18} /> : null}
      </Pressable>
      <Modal animationType="fade" transparent visible={open} onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.backdrop}>
          <Pressable accessibilityLabel="Close date picker" accessibilityRole="button" onPress={() => setOpen(false)} style={StyleSheet.absoluteFill} />
          <View style={styles.calendar}>
            <View style={styles.header}>
              <Pressable accessibilityRole="button" onPress={() => moveMonth(-1)} style={styles.iconButton}>
                <Ionicons color={appearance.primaryDark} name="chevron-back" size={20} />
              </Pressable>
              <Text style={styles.month}>{cursorDate.toLocaleDateString([], { month: "long", year: "numeric" })}</Text>
              <Pressable accessibilityRole="button" onPress={() => moveMonth(1)} style={styles.iconButton}>
                <Ionicons color={appearance.primaryDark} name="chevron-forward" size={20} />
              </Pressable>
            </View>
            <View style={styles.grid}>
              {cells.map((date, index) => {
                const time = date ? startOfDay(date.getTime()) : null;
                const isSelected = time === selected;
                return (
                  <Pressable
                    accessibilityRole={date ? "button" : undefined}
                    disabled={!date}
                    key={`${time ?? "blank"}-${index}`}
                    onPress={() => {
                      if (!time) return;
                      onChange(dateInput(time));
                      setOpen(false);
                    }}
                    style={styles.day}
                  >
                    <View style={[styles.dayCircle, isSelected && { backgroundColor: appearance.primary }]}>
                      <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{date?.getDate() ?? ""}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                onChange(dateInput(Date.now()));
                setOpen(false);
              }}
              style={styles.today}
            >
              <Text style={[styles.todayText, { color: appearance.primaryDark }]}>Today</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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
  iconTrigger: { alignItems: "center", height: 44, justifyContent: "center", width: 44 },
  label: { color: colors.muted, fontSize: 12 },
  value: { color: colors.text, fontSize: 15, fontWeight: "600", marginTop: 2 },
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(47,58,51,0.32)",
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  calendar: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.sm,
    maxWidth: 360,
    padding: spacing.md,
    width: "100%",
  },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  iconButton: { alignItems: "center", height: 44, justifyContent: "center", width: 44 },
  month: { color: colors.text, fontSize: 15, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  day: { alignItems: "center", height: 40, justifyContent: "center", width: `${100 / 7}%` as `${number}%` },
  dayCircle: { alignItems: "center", borderRadius: radii.pill, height: 40, justifyContent: "center", width: 40 },
  dayText: { color: colors.text, fontSize: 14, fontWeight: "600" },
  dayTextSelected: { color: colors.surface },
  today: { alignItems: "center", minHeight: 44, justifyContent: "center" },
  todayText: { color: colors.primaryDark, fontSize: 14, fontWeight: "700" },
});
