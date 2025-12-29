# Story Prep-6.1: Syncpack for Version Consistency

Status: backlog

## Story

As a Developer,
I want all packages to use identical versions of shared dependencies,
So that I avoid "works on my machine" issues caused by version drift.

## Context

**Sprint Context:** Prep Sprint 6 - Monorepo Quality & Architecture Enforcement
**Problem:** Monorepos with 9+ packages can easily drift into using `react@19.2.3` in one package and `react@19.0.0` in another, causing subtle runtime bugs and bundle duplication
**Goal:** Establish Syncpack as the source of truth for dependency versions across the workspace

## Acceptance Criteria

1. **Given** multiple packages importing `react`
   **When** I run `syncpack list-mismatches`
   **Then** any version discrepancies should be detected and reported

2. **Given** CI pipeline
   **When** a PR introduces version mismatches
   **Then** the build should fail with clear error messages

3. **Given** detected mismatches
   **When** I run `syncpack fix-mismatches`
   **Then** all package.json files should be updated to use the highest semver-compatible version

## Tasks / Subtasks

- [ ] **Task 1: Install Syncpack**
  - [ ] Run `pnpm add -Dw syncpack`
  - [ ] Verify installation with `pnpm syncpack --version`

- [ ] **Task 2: Create Syncpack Configuration**
  - [ ] Create `.syncpackrc.json` in workspace root
  - [ ] Configure `versionGroups` for critical dependencies (react, typescript, vite)
  - [ ] Set `semverGroups` to enforce exact versions for core libraries
  - [ ] Add `dependencyTypes` to check both `dependencies` and `devDependencies`

- [ ] **Task 3: Add Package.json Scripts**
  - [ ] Add `"syncpack:check": "syncpack list-mismatches"`
  - [ ] Add `"syncpack:fix": "syncpack fix-mismatches"`
  - [ ] Add `"syncpack:format": "syncpack format"` for consistent formatting

- [ ] **Task 4: Run Initial Audit**
  - [ ] Run `pnpm syncpack:check` to detect current mismatches
  - [ ] Document findings in a comment or dev notes
  - [ ] Run `pnpm syncpack:fix` to resolve mismatches
  - [ ] Verify no breaking changes with `pnpm build && pnpm test`

- [ ] **Task 5: Add to Pre-commit Hook**
  - [ ] Update `.husky/pre-commit` to include `pnpm syncpack:check`
  - [ ] Test hook with intentional version mismatch
  - [ ] Ensure hook fails fast with clear error message

- [ ] **Task 6: Integrate into CI Pipeline**
  - [ ] Add syncpack check to `.github/workflows/ci.yml` or existing test workflow
  - [ ] Configure to run on all PRs targeting master/develop
  - [ ] Set as required status check in GitHub branch protection

- [ ] **Task 7: Update CONTRIBUTING.md**
  - [ ] Document syncpack workflow in "Dependency Management" section
  - [ ] Add examples of how to resolve version conflicts
  - [ ] Explain when to use `syncpack:fix` vs manual resolution

## Technical Guidelines

**Critical Dependencies to Enforce:**

- `react`, `react-dom` - Must be exact same version
- `typescript` - Version drift causes compiler errors
- `vite` - Different versions have incompatible plugin APIs
- `@types/*` packages - Must match runtime library versions

**Syncpack Configuration Strategy:**

```json
{
  "versionGroups": [
    {
      "label": "Pin React ecosystem to exact versions",
      "dependencies": ["react", "react-dom"],
      "packages": ["**"],
      "policy": "sameRange"
    }
  ]
}
```

**Common Pitfalls:**

- Don't auto-fix during CI (read-only check)
- Exempt peer dependencies from strict checks
- Use `workspace:*` for internal packages (not semver)

## Dev Agent Record

**Date:** 2025-12-29

**Files to Create:**

- `.syncpackrc.json` - Syncpack configuration
- Update `CONTRIBUTING.md` - Dependency management section

**Files to Modify:**

- `package.json` (root) - Add syncpack scripts
- `.husky/pre-commit` - Add syncpack check
- `.github/workflows/ci.yml` (or create if missing) - Add syncpack CI step

## References

- [Syncpack Documentation](https://github.com/JamieMason/syncpack)
- [Turborepo + Syncpack Guide](https://turbo.build/repo/docs/handbook/tools/syncpack)
- [Version Group Strategies](https://jamiemason.github.io/syncpack/config/version-groups)
