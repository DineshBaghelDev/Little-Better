import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "../theme";

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
  label,
  onChange,
  value,
}: {
  defaultOpen?: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
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
      <Pressable accessibilityRole="button" onPress={() => setOpen((value) => !value)} style={styles.trigger}>
        <Ionicons color={colors.primaryDark} name="calendar-outline" size={20} />
        <View style={styles.grow}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{dateInput(selected)}</Text>
        </View>
        <Ionicons color={colors.muted} name={open ? "chevron-up" : "chevron-down"} size={18} />
      </Pressable>
      {open ? (
        <View style={styles.calendar}>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" onPress={() => moveMonth(-1)} style={styles.iconButton}>
              <Ionicons color={colors.primaryDark} name="chevron-back" size={20} />
            </Pressable>
            <Text style={styles.month}>{cursorDate.toLocaleDateString([], { month: "long", year: "numeric" })}</Text>
            <Pressable accessibilityRole="button" onPress={() => moveMonth(1)} style={styles.iconButton}>
              <Ionicons color={colors.primaryDark} name="chevron-forward" size={20} />
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
                  style={[styles.day, isSelected && styles.daySelected]}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{date?.getDate() ?? ""}</Text>
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
            <Text style={styles.todayText}>Today</Text>
          </Pressable>
        </View>
      ) : null}
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
  label: { color: colors.muted, fontSize: 12 },
  value: { color: colors.text, fontSize: 15, fontWeight: "600", marginTop: 2 },
  calendar: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  iconButton: { alignItems: "center", height: 44, justifyContent: "center", width: 44 },
  month: { color: colors.text, fontSize: 15, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  day: { alignItems: "center", borderRadius: radii.pill, height: 40, justifyContent: "center", width: `${100 / 7}%` as `${number}%` },
  daySelected: { backgroundColor: colors.primary },
  dayText: { color: colors.text, fontSize: 14, fontWeight: "600" },
  dayTextSelected: { color: colors.surface },
  today: { alignItems: "center", minHeight: 44, justifyContent: "center" },
  todayText: { color: colors.primaryDark, fontSize: 14, fontWeight: "700" },
});
