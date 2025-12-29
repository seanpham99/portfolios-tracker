# Contributing to Portfolios Tracker

Thank you for your interest in contributing to Portfolios Tracker! This guide will help you understand our development workflow and contribution guidelines.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Version Management with Changesets](#version-management-with-changesets)
- [Commit Conventions](#commit-conventions)
- [Code Quality Standards](#code-quality-standards)

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm 10.26.2 (specified in package.json)
- Docker (for local Supabase development)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd fin-sight

# Install dependencies
pnpm install

# Start development environment
pnpm dev
```

## Development Workflow

### Monorepo Structure

Portfolios Tracker uses Turborepo for monorepo management with the following structure:

- `apps/web` - React 19 + Vite frontend application
- `services/api` - NestJS backend API
- `packages/*` - Shared packages (ui, api-types, database-types, etc.)

### Running the Project

```bash
# Run all apps in dev mode
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Type-check all packages
pnpm type-check

# Lint all packages
pnpm lint
```

## Version Management with Changesets

We use [Changesets](https://github.com/changesets/changesets) to manage versions and changelogs across our monorepo. This ensures consistent versioning and clear release notes.

### When to Create a Changeset

Create a changeset whenever you make changes that should be released:

- ✅ **Features** - New functionality added (minor bump)
- ✅ **Fixes** - Bug fixes (patch bump)
- ✅ **Breaking Changes** - API changes requiring updates (major bump)
- ❌ **Chores** - Refactoring, tooling updates (no changeset needed)
- ❌ **Docs** - Documentation-only changes (no changeset needed)
- ❌ **Tests** - Test-only changes (no changeset needed)

### Creating a Changeset

When you've made changes that affect package functionality:

```bash
# Step 1: Create a changeset
pnpm changeset

# You'll be prompted to:
# 1. Select which packages are affected
# 2. Choose bump type (major/minor/patch)
# 3. Write a user-facing summary of changes
```

The changeset CLI will create a markdown file in `.changeset/` directory.

### Changeset Description Guidelines

Write clear, user-facing descriptions in **present tense**:

✅ **Good Examples:**

```markdown
Add crypto exchange connection API for Binance and OKX
Fix authentication token refresh logic
Add dark mode support to settings page
```

❌ **Bad Examples:**

```markdown
added feature # Past tense
Fixed bug # Too vague
Refactored code # Internal detail, not user-facing
```

### Bump Type Guidelines

| Type      | When to Use                        | Examples                                                  |
| --------- | ---------------------------------- | --------------------------------------------------------- |
| **Patch** | Bug fixes, minor improvements      | Fix input validation error, Update error message          |
| **Minor** | New features (backward compatible) | Add portfolio analytics API, Add export to CSV            |
| **Major** | Breaking changes                   | Change API response structure, Remove deprecated endpoint |

### Mapping Conventional Commits to Changesets

| Commit Type                    | Changeset Type | Description       |
| ------------------------------ | -------------- | ----------------- |
| `feat:`                        | `minor`        | New feature added |
| `fix:`                         | `patch`        | Bug fix           |
| `feat!:` or `BREAKING CHANGE:` | `major`        | Breaking change   |
| `chore:`, `docs:`, `test:`     | No changeset   | Internal changes  |

### Example Workflow

```bash
# 1. Create a feature branch
git checkout -b feat/add-portfolio-export

# 2. Make your changes
# ... edit files ...

# 3. Create a changeset
pnpm changeset
# Select: @repo/api-types, @repo/web
# Type: minor
# Summary: "Add portfolio export to CSV functionality"

# 4. Commit your changes
git add .
git commit -m "feat: add portfolio export to CSV"

# 5. Push and create PR
git push origin feat/add-portfolio-export
```

### Versioning and Publishing (Maintainers Only)

When ready to release:

```bash
# 1. Bump versions and update CHANGELOGs
pnpm changeset:version

# This will:
# - Update package.json versions
# - Generate/update CHANGELOG.md files
# - Delete consumed changeset files

# 2. Commit version changes
git add .
git commit -m "chore: version packages"

# 3. Publish packages (when ready)
pnpm changeset:publish
```

### Multi-Package Changes

If your change affects multiple packages, the changeset CLI will let you select all affected packages:

```bash
pnpm changeset
# Select multiple packages with arrow keys + spacebar
# Example: both @repo/api-types and apps/web might be affected
```

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Common Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks (dependencies, tooling)
- `test:` - Test changes
- `refactor:` - Code refactoring without behavior changes
- `style:` - Code style/formatting changes
- `perf:` - Performance improvements

### Examples

```bash
feat(api): add crypto exchange connection endpoints
fix(web): resolve authentication redirect loop
docs: update README with setup instructions
chore(deps): update React to 19.2.3
test(api): add integration tests for portfolio service
```

## Code Quality Standards

### TypeScript

- Use strict mode (enabled in tsconfig)
- Use path aliases: `@/*` for src files, `@repo/*` for workspace packages
- Use `import type` for type-only imports
- Avoid `any` type (use `unknown` with type guards)

### React

- Use React 19 patterns (Actions, useOptimistic)
- Use React Query for server state
- Use Zustand for UI state only
- Follow file-based routing conventions

### Testing

- Co-locate tests with implementation
- Use Vitest for unit/integration tests
- Test critical hooks and complex logic
- Follow MVP testing strategy (quality over coverage)

### Before Submitting PR

Run these checks before creating a pull request:

```bash
# Type-check
pnpm type-check

# Lint
pnpm lint

# Test
pnpm test

# Ensure changeset exists (if needed)
pnpm changeset status
```

## Need Help?

- Check existing issues and PRs
- Review project documentation in `_bmad-output/`
- Ask in team communication channels

---

Thank you for contributing to Portfolios Tracker! 🚀
