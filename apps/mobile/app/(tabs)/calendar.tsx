import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { api } from "../../convex/_generated/api";
import { DatePickerField, dateInput } from "../../src/components/DatePickerField";
import { Screen } from "../../src/components/Screen";
import { PrimaryButton, SectionLabel, Surface } from "../../src/components/ui";
import { colors, spacing } from "../../src/theme";

const DAY_MS = 24 * 60 * 60 * 1000;
const hours = Array.from({ length: 24 }, (_, index) => index);
const minutes = [0, 15, 30, 45];

function timeOnDay(dayStart: number, value: string) {
  const [hours = "9", minutes = "0"] = value.split(":");
  return dayStart + (Number(hours) || 9) * 60 * 60 * 1000 + (Number(minutes) || 0) * 60 * 1000;
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day).getTime() : Date.now();
}

function weekStartFor(value: number) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date.getTime();
}

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(dateInput(Date.now()));
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [schedulingTask, setSchedulingTask] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const dayStart = useMemo(() => parseDate(selectedDate), [selectedDate]);
  const selectedDay = useMemo(() => new Date(dayStart), [dayStart]);
  const weekStart = useMemo(() => weekStartFor(dayStart), [dayStart]);
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => new Date(weekStart + index * DAY_MS)), [weekStart]);
  const calendar = useQuery(api.core.calendar, {
    from: dayStart,
    to: dayStart + DAY_MS - 1,
  });
  const addTask = useMutation(api.core.addTask);
  const completeTask = useMutation(api.core.completeTask);
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
    setShowCreate(false);
  }

  function moveWeek(offset: number) {
    setSelectedDate(dateInput(dayStart + offset * 7 * DAY_MS));
  }

  return (
    <Screen
      headerAction={
        <Pressable accessibilityLabel="Choose calendar date" accessibilityRole="button" onPress={() => setDateModalOpen(true)} style={styles.headerIcon}>
          <Ionicons color={colors.text} name="calendar-outline" size={24} />
        </Pressable>
      }
      subtitle="Selected day"
      title="Calendar"
    >
      <View style={styles.weekNav}>
        <Pressable accessibilityLabel="Previous week" accessibilityRole="button" onPress={() => moveWeek(-1)} style={styles.headerIcon}>
          <Ionicons color={colors.text} name="chevron-back" size={22} />
        </Pressable>
        <View style={styles.week}>
          {days.map((day) => {
            const value = dateInput(day.getTime());
            const selected = selectedDate === value;
            return (
              <Pressable
                accessibilityLabel={day.toDateString()}
                accessibilityRole="button"
                key={value}
                onPress={() => setSelectedDate(value)}
                style={[styles.day, selected && styles.daySelected]}
              >
                <Text style={[styles.dayName, selected && styles.dayTextSelected]}>
                  {day.toLocaleDateString([], { weekday: "short" }).slice(0, 1)}
                </Text>
                <Text style={[styles.date, selected && styles.dayTextSelected]}>{day.getDate()}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable accessibilityLabel="Next week" accessibilityRole="button" onPress={() => moveWeek(1)} style={styles.headerIcon}>
          <Ionicons color={colors.text} name="chevron-forward" size={22} />
        </Pressable>
      </View>

      <SectionLabel>{selectedDay.toLocaleDateString([], { day: "numeric", month: "long", weekday: "long" })}</SectionLabel>
      <View style={styles.events}>
        {scheduled.map((task) => (
          <Surface key={task._id}>
          <Pressable accessibilityRole="button" onPress={() => setExpandedTask(expandedTask === task._id ? null : task._id)} style={styles.event}>
            <View style={[styles.eventRail, { backgroundColor: colors.primary }]} />
            <View style={styles.eventCopy}>
              <Text style={styles.eventTitle}>{task.title}</Text>
              <Text style={styles.eventTime}>{new Date(task.scheduledAt ?? dayStart).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</Text>
              {task.location ? <Text style={styles.eventTime}>{task.location}</Text> : null}
              {task.meetingLink ? <Text style={styles.eventTime}>{task.meetingLink}</Text> : null}
              {task.note ? <Text style={styles.eventTime}>{task.note}</Text> : null}
            </View>
          </Pressable>
          {expandedTask === task._id ? (
            <View style={styles.taskActions}>
              <ClockTimePicker value={taskForm.time} onChange={(time) => setTaskForm((current) => ({ ...current, time }))} />
              <View style={styles.actionRow}>
                <View style={styles.grow}><PrimaryButton label="Complete" onPress={() => completeTask({ taskId: task._id })} /></View>
                <View style={styles.grow}><PrimaryButton label="Move" onPress={() => scheduleTask({ scheduledAt: timeOnDay(dayStart, taskForm.time), taskId: task._id })} secondary /></View>
              </View>
            </View>
          ) : null}
          </Surface>
        ))}
        {sessions.map((session) => (
          <Surface key={session._id} style={styles.event}>
            <View style={[styles.eventRail, { backgroundColor: colors.lavender }]} />
            <View style={styles.eventCopy}>
              <Text style={styles.eventTitle}>Focus session</Text>
              <Text style={styles.eventTime}>
                {new Date(session.completedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} - {session.durationMinutes} minutes logged
              </Text>
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

      <Pressable accessibilityRole="button" onPress={() => setShowCreate((open) => !open)} style={styles.createToggle}>
        <Ionicons color={colors.primaryDark} name={showCreate ? "remove" : "add"} size={21} />
        <Text style={styles.createToggleText}>{showCreate ? "Close task form" : "Add task to this day"}</Text>
      </Pressable>

      {showCreate ? (
      <Surface style={styles.quickAdd}>
        <TextInput
          accessibilityLabel="New scheduled task"
          onChangeText={(title) => setTaskForm((current) => ({ ...current, title }))}
          placeholder="Task title"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={taskForm.title}
        />
        <ClockTimePicker value={taskForm.time} onChange={(time) => setTaskForm((current) => ({ ...current, time }))} />
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
      ) : null}

      <SectionLabel>Unscheduled tasks</SectionLabel>
      <Surface>
        {(calendar?.unscheduledTasks ?? []).map((task) => (
          <View key={task._id}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setSchedulingTask(schedulingTask === task._id ? null : task._id)}
              style={styles.unscheduled}
            >
              <View style={styles.eventCopy}>
                <Text style={styles.eventTitle}>{task.title}</Text>
                <Text style={styles.eventTime}>Choose a time to schedule</Text>
                {task.note ? <Text style={styles.eventTime}>{task.note}</Text> : null}
              </View>
              <Ionicons color={colors.primaryDark} name="calendar-outline" size={21} />
            </Pressable>
            {schedulingTask === task._id ? (
              <View style={styles.taskActions}>
                <ClockTimePicker value={taskForm.time} onChange={(time) => setTaskForm((current) => ({ ...current, time }))} />
                <PrimaryButton label="Schedule" onPress={() => {
                  scheduleTask({ scheduledAt: timeOnDay(dayStart, taskForm.time), taskId: task._id });
                  setSchedulingTask(null);
                }} />
              </View>
            ) : null}
          </View>
        ))}
        {calendar?.unscheduledTasks.length === 0 ? <Text style={styles.emptyText}>No unscheduled tasks.</Text> : null}
      </Surface>

      <Modal animationType="fade" transparent visible={dateModalOpen} onRequestClose={() => setDateModalOpen(false)}>
        <View style={styles.timeBackdrop}>
          <View style={styles.dateSheet}>
            <View style={styles.timeHeader}>
              <Text style={styles.timeTitle}>Choose date</Text>
              <Pressable accessibilityLabel="Close date picker" accessibilityRole="button" onPress={() => setDateModalOpen(false)} style={styles.closeButton}>
                <Ionicons color={colors.text} name="close" size={20} />
              </Pressable>
            </View>
            <DatePickerField
              defaultOpen
              key={selectedDate}
              label="Calendar date"
              onChange={(date) => {
                setSelectedDate(date);
                setDateModalOpen(false);
              }}
              value={selectedDate}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function ClockTimePicker({ onChange, value }: { onChange: (value: string) => void; value: string }) {
  const [open, setOpen] = useState(false);
  const [hourText = "09", minuteText = "00"] = value.split(":");
  const selectedHour = Number(hourText) || 0;
  const selectedMinute = Number(minuteText) || 0;

  function setTime(hour: number, minute: number) {
    onChange(`${`${hour}`.padStart(2, "0")}:${`${minute}`.padStart(2, "0")}`);
  }

  return (
    <View>
      <Pressable accessibilityRole="button" onPress={() => setOpen(true)} style={styles.timeTrigger}>
        <Ionicons color={colors.primaryDark} name="time-outline" size={20} />
        <View style={styles.eventCopy}>
          <Text style={styles.timeLabel}>Task time</Text>
          <Text style={styles.timeValue}>{value}</Text>
        </View>
      </Pressable>
      <Modal animationType="fade" transparent visible={open} onRequestClose={() => setOpen(false)}>
        <View style={styles.timeBackdrop}>
          <View style={styles.timeSheet}>
            <View style={styles.timeHeader}>
              <Text style={styles.timeTitle}>Pick time</Text>
              <Pressable accessibilityLabel="Close time picker" accessibilityRole="button" onPress={() => setOpen(false)} style={styles.closeButton}>
                <Ionicons color={colors.text} name="close" size={20} />
              </Pressable>
            </View>
            <Text style={styles.timePreview}>{value}</Text>
            <Text style={styles.timeLabel}>Hour</Text>
            <View style={styles.clockGrid}>
              {hours.map((hour) => (
                <Pressable accessibilityRole="button" key={hour} onPress={() => setTime(hour, selectedMinute)} style={[styles.clockOption, selectedHour === hour && styles.clockSelected]}>
                  <Text style={[styles.clockText, selectedHour === hour && styles.clockTextSelected]}>{hour}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.timeLabel}>Minute</Text>
            <View style={styles.minuteGrid}>
              {minutes.map((minute) => (
                <Pressable accessibilityRole="button" key={minute} onPress={() => setTime(selectedHour, minute)} style={[styles.minuteOption, selectedMinute === minute && styles.clockSelected]}>
                  <Text style={[styles.clockText, selectedMinute === minute && styles.clockTextSelected]}>{`${minute}`.padStart(2, "0")}</Text>
                </Pressable>
              ))}
            </View>
            <PrimaryButton label="Done" onPress={() => setOpen(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerIcon: { alignItems: "center", height: 44, justifyContent: "center", width: 44 },
  weekNav: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
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
  taskActions: { gap: spacing.sm, padding: spacing.md },
  actionRow: { flexDirection: "row", gap: spacing.sm },
  grow: { flex: 1 },
  createToggle: { alignItems: "center", flexDirection: "row", gap: spacing.sm, minHeight: 44 },
  createToggleText: { color: colors.primaryDark, fontSize: 14, fontWeight: "700" },
  quickAdd: { gap: spacing.sm, padding: spacing.md },
  input: { borderColor: colors.border, borderRadius: 14, borderWidth: 1, color: colors.text, fontSize: 15, minHeight: 48, paddingHorizontal: spacing.md },
  unscheduled: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", minHeight: 68 },
  emptyText: { color: colors.muted, fontSize: 14, padding: spacing.md },
  timeTrigger: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  timeLabel: { color: colors.muted, fontSize: 12, fontWeight: "600", marginBottom: spacing.xs },
  timeValue: { color: colors.text, fontSize: 15, fontWeight: "700" },
  timeBackdrop: { alignItems: "center", backgroundColor: "rgba(47,58,51,0.42)", flex: 1, justifyContent: "center", padding: spacing.lg },
  timeSheet: { backgroundColor: colors.surface, borderRadius: 22, gap: spacing.sm, maxWidth: 380, padding: spacing.lg, width: "100%" },
  dateSheet: { backgroundColor: colors.background, borderRadius: 22, gap: spacing.md, maxWidth: 380, overflow: "visible", padding: spacing.lg, width: "100%" },
  timeHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  timeTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  closeButton: { alignItems: "center", height: 40, justifyContent: "center", width: 40 },
  timePreview: { color: colors.primaryDark, fontSize: 30, fontWeight: "700", textAlign: "center" },
  clockGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  clockOption: { alignItems: "center", borderColor: colors.border, borderRadius: 24, borderWidth: 1, height: 44, justifyContent: "center", width: 44 },
  clockSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  clockText: { color: colors.text, fontSize: 13, fontWeight: "700" },
  clockTextSelected: { color: colors.surface },
  minuteGrid: { flexDirection: "row", gap: spacing.sm },
  minuteOption: { alignItems: "center", borderColor: colors.border, borderRadius: 24, borderWidth: 1, flex: 1, height: 44, justifyContent: "center" },
});
