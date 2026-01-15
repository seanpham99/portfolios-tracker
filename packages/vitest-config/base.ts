import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export const baseConfig = defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["@workspace/vitest-config/setup"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**"],
  },
});
