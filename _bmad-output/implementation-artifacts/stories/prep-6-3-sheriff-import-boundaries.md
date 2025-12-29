# Story Prep-6.3: Sheriff for Import Boundary Enforcement

Status: backlog

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

- [ ] **Task 1: Install Sheriff**
  - [ ] Run `pnpm add -Dw @softarc/sheriff-core`
  - [ ] Run `pnpm add -Dw @softarc/eslint-plugin-sheriff` (ESLint integration)
  - [ ] Verify installation

- [ ] **Task 2: Create Sheriff Configuration**
  - [ ] Create `sheriff.config.ts` in workspace root
  - [ ] Define modules for each package in `apps/`, `packages/`, `services/`
  - [ ] Assign tags: `ui` (web, ui pkg), `server` (api, data-pipeline), `shared` (utils), `types-only` (database-types, api-types)

- [ ] **Task 3: Define Dependency Rules**
  - [ ] Rule 1: `ui` packages CANNOT depend on `server` packages
  - [ ] Rule 2: `server` packages CAN depend on `shared` and `types-only`
  - [ ] Rule 3: `types-only` packages CANNOT depend on `ui` or `server` (only other `types-only`)
  - [ ] Rule 4: `shared` packages CAN depend on `types-only`, CANNOT depend on `ui` or `server`

- [ ] **Task 4: Integrate with ESLint**
  - [ ] Update `.eslintrc.js` (or ESLint config) to include `@softarc/eslint-plugin-sheriff`
  - [ ] Add Sheriff rules to ESLint configuration
  - [ ] Test with intentional violation (import `@repo/api` in `@repo/ui`)

- [ ] **Task 5: Add Package.json Scripts**
  - [ ] Add `"sheriff:check": "sheriff verify"`
  - [ ] Update `"lint"` script to include Sheriff checks
  - [ ] Test that `pnpm lint` catches boundary violations

- [ ] **Task 6: Document Architecture in ADR**
  - [ ] Create `docs/architecture/adr-001-module-boundaries.md`
  - [ ] Document tag definitions and rationale
  - [ ] Provide examples of allowed vs disallowed imports
  - [ ] Explain how to request exceptions (via sheriff.config.ts)

- [ ] **Task 7: Integrate into CI Pipeline**
  - [ ] Add Sheriff verification to existing lint step in `.github/workflows/ci.yml`
  - [ ] Ensure `pnpm lint` includes Sheriff checks
  - [ ] Test that CI fails on boundary violations

- [ ] **Task 8: Update CONTRIBUTING.md**
  - [ ] Add "Module Boundaries" section
  - [ ] Document tag system and dependency rules
  - [ ] Provide flowchart or table for allowed dependencies

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

## Dev Agent Record

**Date:** 2025-12-29

**Files to Create:**

- `sheriff.config.ts` - Sheriff configuration with module boundaries
- `docs/architecture/adr-001-module-boundaries.md` - Architecture Decision Record
- Update `CONTRIBUTING.md` - Module boundaries section

**Files to Modify:**

- `package.json` (root) - Add sheriff scripts
- `.eslintrc.js` - Add Sheriff ESLint plugin
- `.github/workflows/ci.yml` - Ensure lint includes Sheriff

## References

- [Sheriff Documentation](https://github.com/softarc-consulting/sheriff)
- [Module Boundaries Guide](https://www.softwarearchitekt.at/post/sheriff-module-boundaries-for-typescript-projects)
- [ESLint Plugin Setup](https://github.com/softarc-consulting/sheriff/tree/main/packages/eslint-plugin-sheriff)
