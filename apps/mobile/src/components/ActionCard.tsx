import { Pressable, Text, View } from "react-native";

import { colors, spacing } from "../theme";

type ActionCardProps = {
  accent: string;
  action: string;
  body: string;
  label: string;
  title: string;
};

export function ActionCard({
  accent,
  action,
  body,
  label,
  title,
}: ActionCardProps) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: 18,
        borderWidth: 1,
        padding: spacing.md,
      }}
    >
      <Text style={{ color: accent, fontSize: 13, fontWeight: "700" }}>
        {label}
      </Text>
      <Text
        style={{
          color: colors.text,
          fontSize: 18,
          fontWeight: "700",
          lineHeight: 24,
          marginTop: spacing.xs,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: colors.muted,
          fontSize: 14,
          lineHeight: 20,
          marginTop: spacing.sm,
        }}
      >
        {body}
      </Text>
      <Pressable
        accessibilityRole="button"
        style={{
          alignItems: "center",
          alignSelf: "flex-start",
          backgroundColor: accent,
          borderRadius: 999,
          justifyContent: "center",
          marginTop: spacing.md,
          minHeight: 44,
          paddingHorizontal: spacing.md,
        }}
      >
        <Text style={{ color: colors.surface, fontSize: 15, fontWeight: "700" }}>
          {action}
        </Text>
      </Pressable>
    </View>
  );
}
