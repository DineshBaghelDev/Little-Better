import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { api } from "../convex/_generated/api";
import { Mascot, useAppearance } from "../src/components/ui";
import { enqueueOffline, readLocalTimer, saveLocalTimer, type LocalTimer } from "../src/offlineQueue";
import { colors, radii, spacing } from "../src/theme";

const SESSION_SECONDS = 30 * 60;
const ringSegments = Array.from({ length: 12 }, (_, index) => index);

export default function FocusScreen() {
  const focus = useQuery(api.core.focusState);
  const startFocus = useMutation(api.core.startFocus);
  const setPaused = useMutation(api.core.setFocusPaused);
  const endFocus = useMutation(api.core.endFocus);
  const addManualFocus = useMutation(api.core.addManualFocus);
  const [localTimer, setLocalTimer] = useState<LocalTimer | null>(null);
  const [now, setNow] = useState(Date.now());
  const appearance = useAppearance();

  useEffect(() => {
    readLocalTimer().then(setLocalTimer);
  }, []);

  useEffect(() => {
    if (focus?.activeTimer || localTimer) return;
    startFocus({}).catch(async () => {
      const timer = {
        categoryName: focus?.focusCategory?.name ?? "Focus",
        elapsedSeconds: 0,
        startedAt: Date.now(),
        status: "running" as const,
      };
      setLocalTimer(timer);
      await saveLocalTimer(timer);
    });
  }, [focus?.activeTimer, focus?.focusCategory?.name, localTimer, startFocus]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timer = focus?.activeTimer ?? localTimer;
  const elapsed = timer
    ? timer.elapsedSeconds + (timer.status === "running" ? Math.floor((now - timer.startedAt) / 1000) : 0)
    : 0;
  const remaining = Math.max(0, SESSION_SECONDS - elapsed);
  const completedSegments = Math.min(ringSegments.length, Math.floor((elapsed / SESSION_SECONDS) * ringSegments.length));
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
        <Text style={styles.title}>{focus?.focusCategory?.name ?? localTimer?.categoryName ?? "Focus"}</Text>
        <Text style={styles.meta}>Focus session</Text>
        <View accessibilityLabel={`${minutes} minutes ${seconds} seconds remaining`} style={styles.timerRing}>
          <View style={styles.segmentRing}>
            {ringSegments.map((segment) => (
              <View
                key={segment}
                style={[
                  styles.ringSegment,
                  segment < completedSegments && [styles.ringSegmentDone, { backgroundColor: appearance.primary }],
                  { transform: [{ rotate: `${segment * 30}deg` }, { translateY: -100 }] },
                ]}
              />
            ))}
          </View>
          <Text style={styles.timer}>
            {minutes}:{seconds}
          </Text>
          <Text style={styles.timerMeta}>of 30:00</Text>
        </View>
        <Mascot size={96} variant="focus" />
      </View>

      <View style={styles.controls}>
        <View style={styles.controlGroup}>
          <Pressable
            accessibilityRole="button"
            onPress={async () => {
              if (!timer) return;
              if ("_id" in timer) await setPaused({ paused: !paused, timerId: timer._id });
              else {
                const next = {
                  ...timer,
                  elapsedSeconds: elapsed,
                  startedAt: Date.now(),
                  status: paused ? "running" as const : "paused" as const,
                };
                setLocalTimer(next);
                await saveLocalTimer(next);
              }
            }}
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
              if (timer && "_id" in timer) await endFocus({ timerId: timer._id });
              else if (timer) {
                const minutes = Math.max(1, Math.round(elapsed / 60));
                try {
                  await addManualFocus({ minutes });
                } catch {
                  await enqueueOffline("addManualFocus", { minutes });
                }
                setLocalTimer(null);
                await saveLocalTimer(null);
              }
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
  timerRing: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 130, height: 230, justifyContent: "center", marginVertical: spacing.xl, width: 230 },
  segmentRing: { alignItems: "center", bottom: 0, justifyContent: "center", left: 0, position: "absolute", right: 0, top: 0 },
  ringSegment: { backgroundColor: colors.border, borderRadius: radii.pill, height: 24, position: "absolute", width: 8 },
  ringSegmentDone: { backgroundColor: colors.primary },
  timer: { color: colors.text, fontSize: 44, fontWeight: "700" },
  timerMeta: { color: colors.muted, fontSize: 13, marginTop: spacing.xs },
  controls: { flexDirection: "row", justifyContent: "space-around", paddingBottom: spacing.lg },
  controlGroup: { alignItems: "center", gap: spacing.sm },
  control: { alignItems: "center", backgroundColor: colors.surface, borderRadius: radii.pill, height: 56, justifyContent: "center", width: 56 },
  controlLabel: { color: colors.text, fontSize: 12 },
});
