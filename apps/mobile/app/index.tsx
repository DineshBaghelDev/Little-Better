import { useQuery } from "convex/react";
import { Redirect } from "expo-router";

import { api } from "../convex/_generated/api";

export default function IndexScreen() {
  const status = useQuery(api.core.onboardingStatus);

  if (!status) return null;

  return <Redirect href={status.onboarded ? "/(tabs)/today" : "/onboarding"} />;
}
