import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

function username(value: unknown) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,30}$/.test(normalized)) {
    throw new Error("Username must be 3-30 letters, numbers, dots, dashes, or underscores.");
  }
  return normalized;
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const name = username(params.username);
        return { email: `${name}@littlebetter.local`, name };
      },
    }),
  ],
});
