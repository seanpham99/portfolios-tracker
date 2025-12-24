import baseConfig from "@repo/eslint-config/base.js";
import reactConfig from "@repo/eslint-config/react.js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["dist/**"],
  },
  ...baseConfig,
  ...reactConfig,
];
