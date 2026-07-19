import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { api } from "../../convex/_generated/api";
import { Screen } from "../../src/components/Screen";
import { PrimaryButton, SectionLabel, Surface } from "../../src/components/ui";
import { colors, spacing } from "../../src/theme";

const DAY_MS = 24 * 60 * 60 * 1000;

export default function CalendarScreen() {
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => new Date(today.getTime() + index * DAY_MS)), [today]);
  const calendar = useQuery(api.core.calendar, {
    from: days[0].getTime(),
    to: days[6].getTime() + DAY_MS - 1,
  });
  const addTask = useMutation(api.core.addTask);
  const scheduleTask = useMutation(api.core.scheduleTask);
  const [selectedDay, setSelectedDay] = useState(0);
  const [title, setTitle] = useState("");
  const selectedDate = days[selectedDay];
  const dayStart = selectedDate.getTime();
  const dayEnd = dayStart + DAY_MS;
  const scheduled = calendar?.scheduledTasks.filter((task) => (task.scheduledAt ?? 0) >= dayStart && (task.scheduledAt ?? 0) < dayEnd) ?? [];
  const sessions = calendar?.focusSessions.filter((session) => session.completedAt >= dayStart && session.completedAt < dayEnd) ?? [];

  async function addToDay() {
    const trimmed = title.trim();
    if (!trimmed) return;
    await addTask({ scheduledAt: dayStart + 9 * 60 * 60 * 1000, title: trimmed });
    setTitle("");
  }

  return (
    <Screen
      headerAction={<Ionicons color={colors.text} name="calendar-outline" size={24} />}
      subtitle="This week"
      title="Calendar"
    >
      <View style={styles.week}>
        {days.map((day, index) => (
          <Pressable
            accessibilityLabel={day.toDateString()}
            accessibilityRole="button"
            key={day.toISOString()}
            onPress={() => setSelectedDay(index)}
            style={[styles.day, selectedDay === index && styles.daySelected]}
          >
            <Text style={[styles.dayName, selectedDay === index && styles.dayTextSelected]}>
              {day.toLocaleDateString([], { weekday: "short" }).slice(0, 1)}
            </Text>
            <Text style={[styles.date, selectedDay === index && styles.dayTextSelected]}>{day.getDate()}</Text>
          </Pressable>
        ))}
      </View>

      <SectionLabel>{selectedDate.toLocaleDateString([], { day: "numeric", month: "long", weekday: "long" })}</SectionLabel>
      <View style={styles.events}>
        {scheduled.map((task) => (
          <Surface key={task._id} style={styles.event}>
            <View style={[styles.eventRail, { backgroundColor: colors.primary }]} />
            <View style={styles.eventCopy}>
              <Text style={styles.eventTitle}>{task.title}</Text>
              <Text style={styles.eventTime}>{new Date(task.scheduledAt ?? dayStart).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</Text>
            </View>
          </Surface>
        ))}
        {sessions.map((session) => (
          <Surface key={session._id} style={styles.event}>
            <View style={[styles.eventRail, { backgroundColor: colors.lavender }]} />
            <View style={styles.eventCopy}>
              <Text style={styles.eventTitle}>Focus session</Text>
              <Text style={styles.eventTime}>{session.durationMinutes} minutes logged</Text>
            </View>
          </Surface>
        ))}
        {!scheduled.length && !sessions.length ? (
          <Surface style={styles.empty}>
            <Text style={styles.eventTitle}>Nothing planned yet</Text>
            <Text style={styles.eventTime}>Add one task or schedule an unscheduled item.</Text>
          </Surface>
        ) : null}
      </View>

      <Surface style={styles.quickAdd}>
        <TextInput
          accessibilityLabel="New scheduled task"
          onChangeText={setTitle}
          placeholder="Add task at 9 AM"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={title}
        />
        <PrimaryButton label="Add" onPress={addToDay} />
      </Surface>

      <SectionLabel>Unscheduled tasks</SectionLabel>
      <Surface>
        {(calendar?.unscheduledTasks ?? []).map((task) => (
          <Pressable
            accessibilityRole="button"
            key={task._id}
            onPress={() => scheduleTask({ scheduledAt: dayStart + 9 * 60 * 60 * 1000, taskId: task._id })}
            style={styles.unscheduled}
          >
            <View style={styles.eventCopy}>
              <Text style={styles.eventTitle}>{task.title}</Text>
              <Text style={styles.eventTime}>Tap to schedule at 9 AM</Text>
            </View>
            <Ionicons color={colors.primaryDark} name="calendar-outline" size={21} />
          </Pressable>
        ))}
        {calendar?.unscheduledTasks.length === 0 ? <Text style={styles.emptyText}>No unscheduled tasks.</Text> : null}
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  week: { flexDirection: "row", justifyContent: "space-between" },
  day: { alignItems: "center", borderRadius: 22, gap: 6, minHeight: 64, paddingHorizontal: 10, paddingVertical: 8 },
  daySelected: { backgroundColor: colors.primary },
  dayName: { color: colors.muted, fontSize: 11, fontWeight: "600" },
  date: { color: colors.text, fontSize: 14, fontWeight: "700" },
  dayTextSelected: { color: colors.surface },
  events: { gap: spacing.md },
  event: { alignItems: "center", flexDirection: "row", minHeight: 76 },
  eventRail: { alignSelf: "stretch", width: 4 },
  eventCopy: { flex: 1, padding: spacing.md },
  eventTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  eventTime: { color: colors.muted, fontSize: 12, marginTop: spacing.xs },
  empty: { padding: spacing.md },
  quickAdd: { gap: spacing.sm, padding: spacing.md },
  input: { borderColor: colors.border, borderRadius: 14, borderWidth: 1, color: colors.text, fontSize: 15, minHeight: 48, paddingHorizontal: spacing.md },
  unscheduled: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", minHeight: 68 },
  emptyText: { color: colors.muted, fontSize: 14, padding: spacing.md },
});
