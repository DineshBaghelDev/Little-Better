import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "../../src/components/Screen";
import { SectionLabel, Surface } from "../../src/components/ui";
import { colors, spacing } from "../../src/theme";

const days = [
  ["S", "19"], ["M", "20"], ["T", "21"], ["W", "22"], ["T", "23"], ["F", "24"], ["S", "25"],
];

const events = [
  { color: colors.primary, time: "9:00 – 9:30 AM", title: "Team stand-up" },
  { color: colors.lavender, time: "10:00 AM – 12:00 PM", title: "Deep work session" },
  { color: colors.coral, time: "12:30 – 1:30 PM", title: "Lunch with Alex" },
  { color: colors.primary, time: "6:00 – 7:00 PM", title: "Workout" },
];

export default function CalendarScreen() {
  const [selectedDay, setSelectedDay] = useState(0);

  return (
    <Screen
      headerAction={<Ionicons color={colors.text} name="calendar-outline" size={24} />}
      subtitle="This week"
      title="Calendar"
    >
      <View style={styles.week}>
        {days.map(([day, date], index) => (
          <Pressable
            accessibilityLabel={`${day} ${date}`}
            accessibilityRole="button"
            key={`${day}-${date}`}
            onPress={() => setSelectedDay(index)}
            style={[styles.day, selectedDay === index && styles.daySelected]}
          >
            <Text style={[styles.dayName, selectedDay === index && styles.dayTextSelected]}>{day}</Text>
            <Text style={[styles.date, selectedDay === index && styles.dayTextSelected]}>{date}</Text>
          </Pressable>
        ))}
      </View>

      <SectionLabel>{selectedDay === 0 ? "Today · July 19" : `${days[selectedDay][0]} · July ${days[selectedDay][1]}`}</SectionLabel>
      <View style={styles.events}>
        {events.map((event) => (
          <Surface key={event.title} style={styles.event}>
            <View style={[styles.eventRail, { backgroundColor: event.color }]} />
            <View style={styles.eventCopy}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventTime}>{event.time}</Text>
            </View>
            <Ionicons color={colors.muted} name="chevron-forward" size={18} />
          </Surface>
        ))}
      </View>

      <SectionLabel>Tomorrow · July 20</SectionLabel>
      <Surface style={styles.event}>
        <View style={[styles.eventRail, { backgroundColor: colors.primary }]} />
        <View style={styles.eventCopy}>
          <Text style={styles.eventTitle}>Review blog draft</Text>
          <Text style={styles.eventTime}>10:00 – 11:00 AM</Text>
        </View>
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
});
