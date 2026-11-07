import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Run tests in an unusual, non-UTC zone (UTC+5:45) so date helpers are proven
// not to depend on the server's timezone. Set before workers start.
process.env.TZ = "Asia/Kathmandu";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
