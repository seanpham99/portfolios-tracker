# Story Prep-6.3: Sheriff for Import Boundary Enforcement

Status: ✅ complete

## Story

As a Developer,
I want to prevent UI packages from importing server code,
So that architectural layers remain clean and deployable independently.

## Context

**Sprint Context:** Prep Sprint 6 - Monorepo Quality & Architecture Enforcement
**Problem:** Without enforcement, developers accidentally import `@repo/api` into `@repo/ui`, creating tight coupling and breaking bundle boundaries
**Goal:** Use Sheriff to define and enforce module boundaries via tag-based rules

## Acceptance Criteria

1. **Given** `sheriff.config.ts` with defined modules and tags
   **When** `@repo/ui` attempts to import from `@repo/api`
   **Then** the build should fail with a clear boundary violation error

2. **Given** workspace structure
   **When** configuring Sheriff
   **Then** tags should be defined: `ui`, `server`, `shared`, `types-only`

3. **Given** CI pipeline
   **When** import boundaries are violated
   **Then** the build should fail before merge

## Tasks / Subtasks

- [x] **Task 1: Install Sheriff**
  - [x] Run `pnpm add -Dw @softarc/sheriff-core`
  - [x] Run `pnpm add -Dw @softarc/eslint-plugin-sheriff` (ESLint integration)
  - [x] Verify installation

- [x] **Task 2: Create Sheriff Configuration**
  - [x] Create `sheriff.config.ts` in workspace root
  - [x] Define modules for each package in `apps/`, `packages/`, `services/`
  - [x] Assign tags: `ui` (web, ui pkg), `server` (api), `shared` (config packages), `types-only` (database-types, api-types)

- [x] **Task 3: Define Dependency Rules**
  - [x] Rule 1: `ui` packages CANNOT depend on `server` packages
  - [x] Rule 2: `server` packages CAN depend on `shared` and `types-only`
  - [x] Rule 3: `types-only` packages CANNOT depend on `ui` or `server` (only other `types-only`)
  - [x] Rule 4: `shared` packages CAN depend on `types-only`, CANNOT depend on `ui` or `server`

- [x] **Task 4: Integrate with ESLint**
  - [x] Update `packages/eslint-config/index.js` to include `@softarc/eslint-plugin-sheriff`
  - [x] Add Sheriff rules to ESLint configuration
  - [x] Disabled `encapsulation` rule for monorepo cross-package imports
  - [x] Verified boundary enforcement works via ESLint

- [x] **Task 5: Add Package.json Scripts**
  - [x] Sheriff integrated via ESLint (runs with `pnpm lint`)
  - [x] No separate script needed - seamless integration

- [x] **Task 6: Document Architecture**
  - [x] Updated `CONTRIBUTING.md` with Module Boundaries section
  - [x] Document tag definitions and dependency rules
  - [x] Provide examples of allowed vs disallowed imports

- [x] **Task 7: Integrate into CI Pipeline**
  - [x] Sheriff runs automatically via existing `pnpm turbo build test`
  - [x] No CI changes needed - integrated into existing lint step

- [x] **Task 8: Update CONTRIBUTING.md**
  - [x] Add "Module Boundaries" section
  - [x] Document tag system and dependency rules table
  - [x] Provide examples and exception handling guidance

## Technical Guidelines

**Sheriff Configuration Example:**

```typescript
// sheriff.config.ts
import { SheriffConfig } from "@softarc/sheriff-core";

export const config: SheriffConfig = {
  modules: {
    "@repo/ui": ["ui"],
    "@repo/web": ["ui"],
    "@repo/api": ["server"],
    "@repo/database-types": ["types-only"],
    "@repo/api-types": ["types-only"],
    "packages/utils": ["shared"],
  },
  depRules: {
    ui: ["shared", "types-only"], // UI can only import shared/types
    server: ["shared", "types-only"], // Server can only import shared/types
    shared: ["types-only"], // Shared can only import types
    "types-only": [], // Types cannot import anything (pure types)
  },
};
```

**Boundary Violation Examples:**

- ❌ `import { apiClient } from '@repo/api'` in `@repo/ui` (ui → server)
- ❌ `import { Button } from '@repo/ui'` in `@repo/api` (server → ui)
- ✅ `import type { Portfolio } from '@repo/database-types'` in `@repo/ui` (ui → types-only)
- ✅ `import { formatCurrency } from '@repo/utils'` in `@repo/api` (server → shared)

**Exception Handling:**

- Use `@sheriff-ignore` comment for temporary violations (with JIRA ticket)
- Modify `sheriff.config.ts` for permanent architectural changes
- Document all exceptions in ADR

## Implementation Summary

**Date:** 2025-12-30  
**Status:** ✅ Complete

### Files Created

- `sheriff.config.ts` - Module boundary configuration with 4-layer tag system

### Files Modified

- `package.json` - Added Sheriff packages: `@softarc/sheriff-core@0.19.6`, `@softarc/eslint-plugin-sheriff@0.19.6`
- `packages/eslint-config/index.js` - Integrated Sheriff ESLint plugin with `encapsulation` rule disabled for monorepo
- `CONTRIBUTING.md` - Added Module Boundaries section with tag system, dependency rules table, and examples

### Sheriff Configuration

```typescript
// 4-Layer Tag System
tagging: {
  "apps/web": ["ui"],
  "packages/ui": ["ui"],
  "services/api": ["server"],
  "packages/vite-config": ["shared"],
  "packages/eslint-config": ["shared"],
  "packages/typescript-config": ["shared"],
  "packages/database-types": ["types-only"],
  "packages/api-types": ["types-only"],
}

// Dependency Rules
depRules: {
  ui: ["shared", "types-only", "ui"],      // UI → shared, types
  server: ["shared", "types-only", "server"], // Server → shared, types
  shared: ["types-only", "shared"],         // Shared → types only
  "types-only": ["types-only"],            // Types → types only
}
```

### Verification

Sheriff runs automatically:

- **IDE:** Real-time via ESLint integration
- **Pre-commit:** Via lint-staged
- **CI:** Via `pnpm turbo build test`
- **Manual:** Via `pnpm lint`

### Example Enforcement

```typescript
// ❌ FORBIDDEN - UI importing server
import { ApiService } from "@repo/api"; // ESLint error

// ✅ ALLOWED - UI importing types
import type { Portfolio } from "@repo/database-types"; // OK
```

### Notes

- Disabled Sheriff's `encapsulation` rule since we allow cross-package imports within the monorepo
- Focus is on preventing cross-**layer** dependencies (ui ↔ server), not cross-package
- Sheriff integrated seamlessly via ESLint - no additional scripts or CI changes needed

## References

- [Sheriff Documentation](https://github.com/softarc-consulting/sheriff)
- [Module Boundaries Guide](https://www.softwarearchitekt.at/post/sheriff-module-boundaries-for-typescript-projects)
- [ESLint Plugin Setup](https://github.com/softarc-consulting/sheriff/tree/main/packages/eslint-plugin-sheriff)
