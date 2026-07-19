import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { api } from "../../convex/_generated/api";
import { ChoiceDropdown } from "../../src/components/ChoiceDropdown";
import { DatePickerField, dateInput } from "../../src/components/DatePickerField";
import { Screen } from "../../src/components/Screen";
import { PrimaryButton, SectionLabel, Surface } from "../../src/components/ui";
import { colors, spacing } from "../../src/theme";

const DAY_MS = 24 * 60 * 60 * 1000;
const timeOptions = Array.from({ length: 34 }, (_, index) => {
  const total = 6 * 60 + index * 30;
  const hours = `${Math.floor(total / 60)}`.padStart(2, "0");
  const minutes = `${total % 60}`.padStart(2, "0");
  return { label: `${hours}:${minutes}`, value: `${hours}:${minutes}` };
});

function timeOnDay(dayStart: number, value: string) {
  const [hours = "9", minutes = "0"] = value.split(":");
  return dayStart + (Number(hours) || 9) * 60 * 60 * 1000 + (Number(minutes) || 0) * 60 * 1000;
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day).getTime() : Date.now();
}

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(dateInput(Date.now()));
  const dayStart = useMemo(() => parseDate(selectedDate), [selectedDate]);
  const selectedDay = useMemo(() => new Date(dayStart), [dayStart]);
  const calendar = useQuery(api.core.calendar, {
    from: dayStart,
    to: dayStart + DAY_MS - 1,
  });
  const addTask = useMutation(api.core.addTask);
  const scheduleTask = useMutation(api.core.scheduleTask);
  const [taskForm, setTaskForm] = useState({
    location: "",
    meetingLink: "",
    note: "",
    time: "09:00",
    title: "",
  });
  const dayEnd = dayStart + DAY_MS;
  const scheduled = calendar?.scheduledTasks.filter((task) => (task.scheduledAt ?? 0) >= dayStart && (task.scheduledAt ?? 0) < dayEnd) ?? [];
  const sessions = calendar?.focusSessions.filter((session) => session.completedAt >= dayStart && session.completedAt < dayEnd) ?? [];

  async function addToDay() {
    const trimmed = taskForm.title.trim();
    if (!trimmed) return;
    await addTask({
      location: taskForm.location,
      meetingLink: taskForm.meetingLink,
      note: taskForm.note,
      scheduledAt: timeOnDay(dayStart, taskForm.time),
      title: trimmed,
    });
    setTaskForm({ location: "", meetingLink: "", note: "", time: taskForm.time, title: "" });
  }

  return (
    <Screen
      headerAction={<Ionicons color={colors.text} name="calendar-outline" size={24} />}
      subtitle="Selected day"
      title="Calendar"
    >
      <Surface style={styles.pickerSurface}>
        <DatePickerField label="Calendar date" onChange={setSelectedDate} value={selectedDate} />
      </Surface>

      <SectionLabel>{selectedDay.toLocaleDateString([], { day: "numeric", month: "long", weekday: "long" })}</SectionLabel>
      <View style={styles.events}>
        {scheduled.map((task) => (
          <Surface key={task._id} style={styles.event}>
            <View style={[styles.eventRail, { backgroundColor: colors.primary }]} />
            <View style={styles.eventCopy}>
              <Text style={styles.eventTitle}>{task.title}</Text>
              <Text style={styles.eventTime}>{new Date(task.scheduledAt ?? dayStart).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</Text>
              {task.location ? <Text style={styles.eventTime}>{task.location}</Text> : null}
              {task.meetingLink ? <Text style={styles.eventTime}>{task.meetingLink}</Text> : null}
              {task.note ? <Text style={styles.eventTime}>{task.note}</Text> : null}
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
          onChangeText={(title) => setTaskForm((current) => ({ ...current, title }))}
          placeholder="Task title"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={taskForm.title}
        />
        <ChoiceDropdown label="Task time" onSelect={(time) => setTaskForm((current) => ({ ...current, time }))} options={timeOptions} value={taskForm.time} />
        <TextInput
          accessibilityLabel="Task location"
          onChangeText={(location) => setTaskForm((current) => ({ ...current, location }))}
          placeholder="Location (optional)"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={taskForm.location}
        />
        <TextInput
          accessibilityLabel="Meeting link"
          autoCapitalize="none"
          onChangeText={(meetingLink) => setTaskForm((current) => ({ ...current, meetingLink }))}
          placeholder="Meeting link (optional)"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={taskForm.meetingLink}
        />
        <TextInput
          accessibilityLabel="Task note"
          onChangeText={(note) => setTaskForm((current) => ({ ...current, note }))}
          placeholder="Notes (optional)"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={taskForm.note}
        />
        <PrimaryButton label="Add" onPress={addToDay} />
      </Surface>

      <SectionLabel>Unscheduled tasks</SectionLabel>
      <Surface>
        {(calendar?.unscheduledTasks ?? []).map((task) => (
          <Pressable
            accessibilityRole="button"
            key={task._id}
            onPress={() => scheduleTask({ scheduledAt: timeOnDay(dayStart, taskForm.time), taskId: task._id })}
            style={styles.unscheduled}
          >
            <View style={styles.eventCopy}>
              <Text style={styles.eventTitle}>{task.title}</Text>
              <Text style={styles.eventTime}>Tap to schedule at {taskForm.time}</Text>
              {task.note ? <Text style={styles.eventTime}>{task.note}</Text> : null}
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
  pickerSurface: { overflow: "visible", padding: spacing.md, zIndex: 10 },
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
