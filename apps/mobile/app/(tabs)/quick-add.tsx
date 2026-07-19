import { ActionCard } from "../../src/components/ActionCard";
import { Screen } from "../../src/components/Screen";
import { colors } from "../../src/theme";

export default function QuickAddScreen() {
  return (
    <Screen title="Quick add">
      <ActionCard
        accent={colors.mustard}
        action="Capture"
        body="Compound captures will show an editable confirmation preview before saving."
        label="Capture"
        title="Task, expense, focus, note, or voice"
      />
    </Screen>
  );
}
