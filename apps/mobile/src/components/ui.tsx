import { Ionicons } from "@expo/vector-icons";
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

import { colors, radii, spacing } from "../theme";

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

export function Mascot({ size = 88 }: { size?: number }) {
  return (
    <Image
      accessibilityIgnoresInvertColors
      accessibilityLabel="Little Better sprout mascot"
      source={require("../../assets/mascot.png")}
      style={{ borderRadius: size / 4, height: size, width: size }}
    />
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
  buttonText: { color: colors.surface, fontSize: 16, fontWeight: "700" },
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
  rowDetail: { color: colors.muted, fontSize: 12, marginTop: 3 },
  sectionLabel: { color: colors.text, fontSize: 16, fontWeight: "700" },
});
