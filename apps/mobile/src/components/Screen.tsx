import { PropsWithChildren } from "react";
import { SafeAreaView, ScrollView, Text } from "react-native";

import { colors, spacing } from "../theme";

type ScreenProps = PropsWithChildren<{
  title: string;
}>;

export function Screen({ children, title }: ScreenProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          gap: spacing.lg,
          padding: spacing.lg,
          paddingBottom: 96,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 28,
            fontWeight: "700",
            lineHeight: 34,
          }}
        >
          {title}
        </Text>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
