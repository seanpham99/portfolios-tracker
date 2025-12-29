# Story Prep-6.2: Knip for Dead Code Detection

Status: backlog

## Story

As a Developer,
I want to detect unused files, exports, and dependencies across the entire workspace,
So that the codebase stays lean and maintainable.

## Context

**Sprint Context:** Prep Sprint 6 - Monorepo Quality & Architecture Enforcement
**Problem:** Traditional linters (ESLint) can't detect "project-wide" dead code - an unused export in `@repo/ui` that no other package imports
**Goal:** Use Knip to analyze the entire workspace dependency graph and identify truly unused code

## Acceptance Criteria

1. **Given** the monorepo workspace
   **When** I run `knip`
   **Then** it should report unused files, exports, types, and dependencies

2. **Given** CI pipeline
   **When** dead code is detected
   **Then** the build should warn (not fail) with actionable cleanup suggestions

3. **Given** `knip.json` configuration
   **When** configured with entry points for each workspace package
   **Then** it should correctly analyze TypeScript project references and Turborepo dependencies

## Tasks / Subtasks

- [ ] **Task 1: Install Knip**
  - [ ] Run `pnpm add -Dw knip`
  - [ ] Verify installation with `pnpm knip --version`

- [ ] **Task 2: Create Knip Configuration**
  - [ ] Create `knip.json` in workspace root
  - [ ] Define `workspaces` for apps/_, packages/_, services/\*
  - [ ] Set `entry` and `project` patterns for each workspace type
  - [ ] Configure `ignoreDependencies` for known false positives (e.g., `@types/*`)

- [ ] **Task 3: Configure Entry Points**
  - [ ] For `apps/web`: Set entry to `src/main.tsx`, `src/routes/**/*.tsx`
  - [ ] For `services/api`: Set entry to `src/main.ts`, `src/**/*.controller.ts`
  - [ ] For `packages/*`: Set entry to `src/index.ts` or `dist/index.js`
  - [ ] Add `ignore` patterns for test files, storybook, and build artifacts

- [ ] **Task 4: Run Initial Analysis**
  - [ ] Run `pnpm knip` to get baseline report
  - [ ] Document findings (unused files, exports, dependencies)
  - [ ] Categorize: "safe to delete" vs "needs investigation"
  - [ ] Create cleanup issue/ticket if significant debt found

- [ ] **Task 5: Add Package.json Scripts**
  - [ ] Add `"knip": "knip"`
  - [ ] Add `"knip:ci": "knip --reporter json"` for machine-readable output
  - [ ] Add `"knip:fix": "knip --fix"` for automated cleanup (use cautiously)

- [ ] **Task 6: Integrate into CI Pipeline**
  - [ ] Add knip check to `.github/workflows/ci.yml`
  - [ ] Configure as warning-only (don't fail build)
  - [ ] Add PR comment with knip findings using GitHub Actions
  - [ ] Set threshold: fail only if >10 unused dependencies detected

- [ ] **Task 7: Update CONTRIBUTING.md**
  - [ ] Document knip workflow in "Code Quality" section
  - [ ] Add guidance on interpreting knip reports
  - [ ] Explain `ignore` vs `ignoreDependencies` configuration

## Technical Guidelines

**Knip Configuration Strategy:**

```json
{
  "workspaces": {
    "apps/web": {
      "entry": ["src/main.tsx", "src/routes/**/*.tsx"],
      "project": ["src/**/*.{ts,tsx}"],
      "ignore": ["src/**/*.test.{ts,tsx}", "src/**/*.stories.tsx"]
    }
  },
  "ignoreDependencies": ["@types/node", "typescript"]
}
```

**Common False Positives:**

- Type-only imports (may show as unused if only used in types)
- Ambient declarations (`.d.ts` files)
- Development-only dependencies (storybook, vitest)
- Dynamic imports (`import('./dynamic')`)

**Best Practices:**

- Run knip weekly, not on every commit (expensive operation)
- Use `--include` flag to focus on specific issue types
- Add `@knipignore` comment for intentional "unused" exports (public API surface)

## Dev Agent Record

**Date:** 2025-12-29

**Files to Create:**

- `knip.json` - Knip configuration with workspace entry points
- Update `CONTRIBUTING.md` - Code quality and cleanup section

**Files to Modify:**

- `package.json` (root) - Add knip scripts
- `.github/workflows/ci.yml` - Add knip warning step

## References

- [Knip Documentation](https://knip.dev/)
- [Knip Configuration Guide](https://knip.dev/reference/configuration)
- [Monorepo Setup](https://knip.dev/guides/monorepos)
- [Handling False Positives](https://knip.dev/guides/handling-issues)
