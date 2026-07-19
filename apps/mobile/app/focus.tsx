import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { api } from "../convex/_generated/api";
import { Mascot } from "../src/components/ui";
import { colors, radii, spacing } from "../src/theme";

const SESSION_SECONDS = 30 * 60;

export default function FocusScreen() {
  const focus = useQuery(api.core.focusState);
  const startFocus = useMutation(api.core.startFocus);
  const setPaused = useMutation(api.core.setFocusPaused);
  const endFocus = useMutation(api.core.endFocus);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    void startFocus({});
  }, [startFocus]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timer = focus?.activeTimer;
  const elapsed = timer
    ? timer.elapsedSeconds + (timer.status === "running" ? Math.floor((now - timer.startedAt) / 1000) : 0)
    : 0;
  const remaining = Math.max(0, SESSION_SECONDS - elapsed);
  const paused = timer?.status === "paused";
  const minutes = Math.floor(remaining / 60).toString().padStart(2, "0");
  const seconds = (remaining % 60).toString().padStart(2, "0");

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Close focus session" accessibilityRole="button" onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons color={colors.text} name="close" size={24} />
        </Pressable>
        <View style={styles.iconButton}>
          <Ionicons color={colors.text} name="timer-outline" size={22} />
        </View>
      </View>

      <View style={styles.center}>
        <Text style={styles.title}>{focus?.focusCategory?.name ?? "Focus"}</Text>
        <Text style={styles.meta}>Focus session</Text>
        <View accessibilityLabel={`${minutes} minutes ${seconds} seconds remaining`} style={styles.timerRing}>
          <Text style={styles.timer}>
            {minutes}:{seconds}
          </Text>
          <Text style={styles.timerMeta}>of 30:00</Text>
        </View>
        <Mascot size={96} />
      </View>

      <View style={styles.controls}>
        <View style={styles.controlGroup}>
          <Pressable
            accessibilityRole="button"
            onPress={() => timer && setPaused({ paused: !paused, timerId: timer._id })}
            style={styles.control}
          >
            <Ionicons color={colors.text} name={paused ? "play" : "pause"} size={24} />
          </Pressable>
          <Text style={styles.controlLabel}>{paused ? "Resume" : "Pause"}</Text>
        </View>
        <View style={styles.controlGroup}>
          <Pressable
            accessibilityRole="button"
            onPress={async () => {
              if (timer) await endFocus({ timerId: timer._id });
              router.back();
            }}
            style={styles.control}
          >
            <Ionicons color={colors.coral} name="stop" size={22} />
          </Pressable>
          <Text style={styles.controlLabel}>End</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.lavenderSurface, flex: 1, padding: spacing.lg },
  header: { flexDirection: "row", justifyContent: "space-between" },
  iconButton: { alignItems: "center", height: 44, justifyContent: "center", width: 44 },
  center: { alignItems: "center", flex: 1, gap: spacing.sm, justifyContent: "center" },
  title: { color: colors.text, fontSize: 22, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 14 },
  timerRing: { alignItems: "center", borderColor: colors.primary, borderRadius: 130, borderWidth: 8, height: 230, justifyContent: "center", marginVertical: spacing.xl, width: 230 },
  timer: { color: colors.text, fontSize: 44, fontWeight: "700" },
  timerMeta: { color: colors.muted, fontSize: 13, marginTop: spacing.xs },
  controls: { flexDirection: "row", justifyContent: "space-around", paddingBottom: spacing.lg },
  controlGroup: { alignItems: "center", gap: spacing.sm },
  control: { alignItems: "center", backgroundColor: colors.surface, borderRadius: radii.pill, height: 56, justifyContent: "center", width: 56 },
  controlLabel: { color: colors.text, fontSize: 12 },
});
