import js from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import sheriff from "@softarc/eslint-plugin-sheriff";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export const config = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  sheriff.configs.all,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      // Disable encapsulation rule for monorepo cross-package imports
      "@softarc/sheriff/encapsulation": "off",
    },
  },
  {
    ignores: ["dist", "node_modules", "build", ".turbo", "coverage"],
  },
];

export default config;
