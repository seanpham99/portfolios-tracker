import baseConfig from "@repo/eslint-config";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["dist/**", "build/**"],
  },
  ...baseConfig,
];
