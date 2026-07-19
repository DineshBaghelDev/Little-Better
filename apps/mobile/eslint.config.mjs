import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["node_modules/**", ".expo/**", "convex/_generated/**"],
  },
]);
