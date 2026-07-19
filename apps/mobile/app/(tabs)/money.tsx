import { ActionCard } from "../../src/components/ActionCard";
import { Screen } from "../../src/components/Screen";
import { colors } from "../../src/theme";

export default function MoneyScreen() {
  return (
    <Screen title="Money">
      <ActionCard
        accent={colors.coral}
        action="Add expense"
        body="Manual entries are confirmed; detected payments wait for review."
        label="Budget"
        title="Trusted totals only"
      />
    </Screen>
  );
}
