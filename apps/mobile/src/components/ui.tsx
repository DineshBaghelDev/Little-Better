import { Ionicons } from "@expo/vector-icons";
import { PropsWithChildren, ReactNode } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { colors, radii, spacing, typography } from "../theme";

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
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
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
  variant?: "calm" | "complete" | "focus" | "pointing" | "reflection";
}) {
  const eyesClosed = variant === "focus" || variant === "complete";
  const pointing = variant === "pointing";
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[styles.mascot, { height: size, width: size }]}
    >
      <View style={[styles.leaf, styles.leafLeft, { height: size * 0.2, width: size * 0.13 }]} />
      <View style={[styles.leaf, styles.leafRight, { height: size * 0.2, width: size * 0.13 }]} />
      <View style={[styles.stem, { height: size * 0.16, width: Math.max(2, size * 0.035) }]} />
      <View style={[styles.body, { borderRadius: size * 0.26, height: size * 0.64, width: size * 0.58 }]}>
        <View style={[styles.arm, styles.armLeft, { height: size * 0.22, width: size * 0.11 }]} />
        <View style={[styles.arm, pointing ? styles.armPointing : styles.armRight, { height: size * 0.22, width: size * 0.11 }]} />
        <View style={styles.face}>
          {eyesClosed ? (
            <>
              <View style={styles.closedEye} />
              <View style={styles.closedEye} />
            </>
          ) : (
            <>
              <View style={styles.eye} />
              <View style={styles.eye} />
            </>
          )}
        </View>
        <View style={[styles.mouth, variant === "reflection" && styles.softMouth]} />
      </View>
      <View style={[styles.foot, styles.footLeft, { height: size * 0.09, width: size * 0.16 }]} />
      <View style={[styles.foot, styles.footRight, { height: size * 0.09, width: size * 0.16 }]} />
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
  mascot: { alignItems: "center", justifyContent: "flex-end" },
  stem: { backgroundColor: colors.primaryDark, borderRadius: radii.pill, position: "absolute", top: "7%" },
  leaf: { backgroundColor: colors.primary, borderRadius: radii.pill, position: "absolute", top: "0%" },
  leafLeft: { transform: [{ rotate: "-36deg" }], left: "37%" },
  leafRight: { transform: [{ rotate: "36deg" }], right: "37%" },
  body: { alignItems: "center", backgroundColor: colors.primary, justifyContent: "center", marginBottom: "10%" },
  arm: { backgroundColor: colors.primary, borderRadius: radii.pill, position: "absolute", top: "45%" },
  armLeft: { left: "-12%", transform: [{ rotate: "18deg" }] },
  armRight: { right: "-12%", transform: [{ rotate: "-18deg" }] },
  armPointing: { right: "-18%", top: "32%", transform: [{ rotate: "-70deg" }] },
  face: { flexDirection: "row", gap: 10, marginTop: 4 },
  eye: { backgroundColor: colors.text, borderRadius: radii.pill, height: 5, width: 5 },
  closedEye: { backgroundColor: colors.text, borderRadius: radii.pill, height: 2, marginTop: 2, width: 9 },
  mouth: { borderBottomColor: colors.text, borderBottomWidth: 2, borderRadius: 12, height: 9, marginTop: 8, width: 18 },
  softMouth: { width: 14 },
  foot: { backgroundColor: colors.primaryDark, borderRadius: radii.pill, bottom: 0, position: "absolute" },
  footLeft: { left: "31%" },
  footRight: { right: "31%" },
});
