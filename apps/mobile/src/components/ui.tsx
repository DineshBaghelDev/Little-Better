import { Ionicons } from "@expo/vector-icons";
import { useConvexAuth, useQuery } from "convex/react";
import { PropsWithChildren, ReactNode } from "react";
import {
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { api } from "../../convex/_generated/api";
import { colors, radii, resolveAppearance, spacing, typography } from "../theme";

export function useAppearance() {
  const { isAuthenticated } = useConvexAuth();
  const settings = useQuery(api.core.settingsView, isAuthenticated ? {} : "skip");
  return resolveAppearance(settings?.settings);
}

const mascotSheet = require("../../assets/sprout-spritesheet.png");
const spritePositions = {
  calm: [0, 0],
  calendar: [2, 2],
  celebrating: [1, 1],
  complete: [1, 1],
  excited: [1, 0],
  focus: [2, 0],
  money: [1, 2],
  planning: [2, 2],
  pointing: [0, 1],
  proud: [3, 0],
  reflection: [3, 2],
  relaxed: [3, 1],
  sleepy: [0, 2],
  watering: [0, 1],
  working: [2, 1],
} as const;
const spriteFrameSize = 512;
const spriteColumns = 4;
const spriteRows = 3;
type MascotVariant = keyof typeof spritePositions;

export function Surface({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.surface, style]}>{children}</View>;
}

export function PrimaryButton({
  label,
  onPress,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  const appearance = useAppearance();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: appearance.primary, borderColor: appearance.primary },
        secondary && styles.buttonSecondary,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Chip({
  label,
  onPress,
  selected,
}: {
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  const appearance = useAppearance();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && { backgroundColor: appearance.primary, borderColor: appearance.primary }]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function ListRow({
  detail,
  icon,
  onPress,
  title,
}: {
  detail?: string;
  icon: ReactNode;
  onPress?: () => void;
  title: string;
}) {
  const content = (
    <>
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        {detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}
      </View>
      {onPress ? (
        <Ionicons color={colors.muted} name="chevron-forward" size={18} />
      ) : null}
    </>
  );

  return onPress ? (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  ) : (
    <View style={styles.row}>{content}</View>
  );
}

export function SectionLabel({ children }: PropsWithChildren) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function Mascot({
  size = 88,
  variant = "calm",
}: {
  size?: number;
  variant?: MascotVariant | string;
}) {
  const [column, row] = spritePositions[variant as MascotVariant] ?? spritePositions.calm;
  const scale = size / spriteFrameSize;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[styles.mascot, { height: size, width: size }]}
    >
      <Image
        source={mascotSheet}
        style={{
          height: spriteFrameSize * spriteRows * scale,
          transform: [
            { translateX: -column * spriteFrameSize * scale },
            { translateY: -row * spriteFrameSize * scale },
          ],
          width: spriteFrameSize * spriteColumns * scale,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.card,
    borderWidth: 1,
    overflow: "hidden",
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderRadius: radii.control,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  buttonSecondary: { backgroundColor: colors.surface, borderColor: colors.border },
  buttonText: { color: colors.surface, ...typography.cardTitle },
  buttonTextSecondary: { color: colors.text },
  chip: { alignItems: "center", borderColor: colors.border, borderRadius: radii.pill, borderWidth: 1, justifyContent: "center", minHeight: 44, paddingHorizontal: spacing.md },
  chipText: { color: colors.text, fontSize: 13, fontWeight: "600" },
  chipTextSelected: { color: colors.surface },
  pressed: { opacity: 0.72 },
  row: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 64,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowIcon: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  rowCopy: { flex: 1, marginHorizontal: spacing.sm },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: "600" },
  rowDetail: { color: colors.muted, ...typography.secondary, marginTop: 3 },
  sectionLabel: { color: colors.text, ...typography.cardTitle },
  mascot: { overflow: "hidden" },
});
