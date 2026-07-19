import { ActionCard } from "../../src/components/ActionCard";
import { Screen } from "../../src/components/Screen";
import { colors } from "../../src/theme";

export default function CalendarScreen() {
  return (
    <Screen title="Calendar">
      <ActionCard
        accent={colors.lavender}
        action="Add task"
        body="Scheduled tasks and focus blocks will live here."
        label="Planned time"
        title="Week strip and agenda"
      />
    </Screen>
  );
}
