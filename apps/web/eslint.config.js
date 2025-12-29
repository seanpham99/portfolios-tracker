import { defineConfig } from "eslint/config";
import sharedReactConfig from "@repo/eslint-config/react";

export default defineConfig([
  {
    ignores: ["dist", ".react-router", "node_modules"],
  },

  // Extend shared react configuration
  ...sharedReactConfig,
]);
