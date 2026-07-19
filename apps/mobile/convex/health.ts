import { query } from "./_generated/server";

export const status = query({
  args: {},
  handler: () => ({
    ok: true,
    message: "Connected to Little Better backend.",
  }),
});
