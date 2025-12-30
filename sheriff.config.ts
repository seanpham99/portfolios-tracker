import { SheriffConfig } from "@softarc/sheriff-core";

export const config: SheriffConfig = {
    version: 1,

    // Allow cross-package imports in monorepo
    excludeTag: "noShared",

    // Define modules and their tags
    tagging: {
        // UI Layer - Frontend packages
        "apps/web": ["ui"],
        "packages/ui": ["ui"],

        // Server Layer - Backend services
        "services/api": ["server"],

        // Shared Layer - Utility packages
        "packages/vite-config": ["shared"],
        "packages/eslint-config": ["shared"],
        "packages/typescript-config": ["shared"],

        // Types Only Layer - Pure type definitions
        "packages/database-types": ["types-only"],
        "packages/api-types": ["types-only"],
    },

    // Define dependency rules between tags
    depRules: {
        // Root can access everything (default)
        root: ["ui", "server", "shared", "types-only"],

        // UI packages can only import shared utilities and type definitions
        ui: ["shared", "types-only", "ui"],

        // Server packages can only import shared utilities and type definitions
        server: ["shared", "types-only", "server"],

        // Shared packages can only import type definitions
        shared: ["types-only", "shared"],

        // Type-only packages cannot import anything except other type packages
        "types-only": ["types-only"],
    },
};
