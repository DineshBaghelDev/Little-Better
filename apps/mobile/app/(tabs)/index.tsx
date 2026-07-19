import { useQuery } from "convex/react";
import { Text, View } from "react-native";

import { api } from "../../convex/_generated/api";
import { ActionCard } from "../../src/components/ActionCard";
import { Screen } from "../../src/components/Screen";
import { colors, spacing } from "../../src/theme";

export default function TodayScreen() {
  const health = useQuery(api.health.status);

  return (
    <Screen title="Today">
      <View style={{ gap: spacing.md }}>
        <ActionCard
          accent={colors.primary}
          action="Start"
          body="Your ranked feed will show the top two or three actions here."
          label="Next action"
          title="Pick one useful thing"
        />
        <ActionCard
          accent={colors.coral}
          action="Review"
          body="Detected transactions stay out of totals until confirmed."
          label="Pending"
          title="Confirm expenses only when needed"
        />
        <View
          style={{
            backgroundColor: colors.sageSurface,
            borderColor: colors.border,
            borderRadius: 16,
            borderWidth: 1,
            padding: spacing.md,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: "700" }}>
            Convex health
          </Text>
          <Text style={{ color: colors.muted, marginTop: spacing.xs }}>
            {health?.ok ? health.message : "Waiting for Convex..."}
          </Text>
        </View>
      </View>
    </Screen>
  );
}
