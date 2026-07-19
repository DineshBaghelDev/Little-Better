import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { Mascot } from "../src/components/ui";
import { colors, radii, spacing } from "../src/theme";

const SESSION_SECONDS = 30 * 60;

export default function FocusScreen() {
  const [remaining, setRemaining] = useState(SESSION_SECONDS);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || remaining === 0) return;
    const timer = setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [paused, remaining]);

  const minutes = Math.floor(remaining / 60).toString().padStart(2, "0");
  const seconds = (remaining % 60).toString().padStart(2, "0");

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Close focus session" accessibilityRole="button" onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons color={colors.text} name="close" size={24} />
        </Pressable>
        <Pressable accessibilityLabel="Focus settings" accessibilityRole="button" style={styles.iconButton}>
          <Ionicons color={colors.text} name="options-outline" size={22} />
        </Pressable>
      </View>

      <View style={styles.center}>
        <Text style={styles.title}>Deep work</Text>
        <Text style={styles.meta}>Focus session</Text>
        <View accessibilityLabel={`${minutes} minutes ${seconds} seconds remaining`} style={styles.timerRing}>
          <Text style={styles.timer}>{minutes}:{seconds}</Text>
          <Text style={styles.timerMeta}>of 30:00</Text>
        </View>
        <Mascot size={96} />
      </View>

      <View style={styles.controls}>
        <View style={styles.controlGroup}>
          <Pressable accessibilityRole="button" onPress={() => setPaused((value) => !value)} style={styles.control}>
            <Ionicons color={colors.text} name={paused ? "play" : "pause"} size={24} />
          </Pressable>
          <Text style={styles.controlLabel}>{paused ? "Resume" : "Pause"}</Text>
        </View>
        <View style={styles.controlGroup}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.control}>
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
