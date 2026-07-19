import { ActionCard } from "../../src/components/ActionCard";
import { Screen } from "../../src/components/Screen";
import { colors } from "../../src/theme";

export default function ProgressScreen() {
  return (
    <Screen title="Progress">
      <ActionCard
        accent={colors.primary}
        action="View"
        body="Little Better waits for reliable patterns before suggesting a change."
        label="Weekly insight"
        title="Not enough data yet"
      />
    </Screen>
  );
}
