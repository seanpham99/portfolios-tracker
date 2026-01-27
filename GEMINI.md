# GEMINI.md - Project Context & Instructions

> **Context:** This file guides the AI agent on how to understand, build, and contribute to the **Portfolios Tracker** project.

---

## 1. Project Overview

**Portfolios Tracker** is a professional, multi-asset portfolio intelligence platform designed to unify tracking for Vietnamese stocks, US equities, Global stocks, and Cryptocurrencies. It features institutional-grade analytics, transparent methodologies, and a calm, resilient user experience.

### 🏗️ Architecture

This is a **Monorepo** managed by **Turborepo** and **pnpm**.

- **Frontend (`apps/web`):** Next.js 16.1 (App Router), React 19, Tailwind CSS 4, Radix UI / Shadcn UI.
- **Backend (`services/api`):** NestJS 11, Supabase (Postgres + RLS), Upstash Redis, ClickHouse (Historical Data).
- **Shared Packages (`packages/*`):**
  - `@workspace/shared-types`: Shared DTOs, Zod schemas, and database types.
  - `@workspace/ui`: Shared UI components (Radix/Shadcn).
  - `@workspace/typescript-config`: Centralized TS configuration.
  - `@workspace/eslint-config`: Centralized Linting rules.

### 🛠️ Key Technologies

- **Language:** TypeScript (Strict Mode).
- **Package Manager:** pnpm (v10+).
- **Build System:** Turborepo.
- **Database:** Supabase (Postgres) & Upstash Redis.
- **External APIs:** vnstock, yfinance, Polygon.io, CoinGecko, CCXT.

---

## 2. Building & Running

### Prerequisites

- **Node.js:** v22+
- **pnpm:** v10.26.2+
- **Docker:** (Optional, for local services if applicable)

### 🚀 Key Commands

| Command             | Description                                                                 |
| :------------------ | :-------------------------------------------------------------------------- |
| `pnpm install`      | Install all dependencies across the monorepo.                               |
| `pnpm dev`          | Start the development server for all apps/services in parallel (via Turbo). |
| `pnpm build`        | Build all apps/packages for production.                                     |
| `pnpm lint`         | Run ESLint across all workspaces.                                           |
| `pnpm type-check`   | Run TypeScript type checking across all workspaces.                         |
| `pnpm test`         | Run tests (Vitest/Jest) across the project.                                 |
| `pnpm db:gen-types` | Generate TypeScript types from the local Supabase instance.                 |

### 💻 Development Workflow

1.  **Setup Environment:**
    - Copy `.env.example` to `.env` in `apps/web` and `services/api`.
    - Ensure Supabase and Redis credentials are set.

2.  **Start Dev Server:**
    - Use `pnpm dev` for the standard Turbo parallel execution.
    - Alternatively, use `./scripts/start-dev.sh` to ensure shared types are built _before_ services start.

---

## 3. Development Conventions

### 📂 Directory Structure

- `apps/` - User-facing applications (Web, Docs).
- `services/` - Backend services (API, Data Pipelines).
- `packages/` - Shared libraries. **All internal logic should live here when possible.**

### 📝 Code Style & Patterns

- **ESM-First:** Internal imports must include `.js` extension if running in ESM environments (check local `package.json` `type: "module"`).
- **Financial Accuracy:** Never use standard floating-point math for currency. Use Decimal.js for all monetary calculations.
- **Type Safety:**
  - Strictly use `@workspace/shared-types` for data shared between Frontend and Backend.
  - Do not duplicate DTOs; define them in `packages/shared-types` and import them.
- **API Responses:** Follow the envelope pattern: `{ success, data, error, meta }`.
- **Database Access:**
  - Backend: Use Supabase Client with Service Key (for admin tasks) or RLS-scoped client.
  - Frontend: Use Supabase SSR client.

### 🧪 Testing

- **Unit/Integration:** Vitest (Frontend/Packages), Jest (Backend).
- **E2E:** Playwright (located in `tests/e2e` - _check if exists/setup_).
- **Strategy:** Test core logic in `packages/finance` heavily.

---

## 4. Important Files & Configuration

- `turbo.json`: Defines the build pipeline and task dependencies. Modify this if adding new lifecycle scripts.
- `pnpm-workspace.yaml`: Defines the monorepo workspace structure.
- `apps/web/next.config.ts` (or `.js`): Next.js configuration.
- `services/api/tsup.config.ts`: Backend build configuration.
- `knip.json`: Configuration for detecting unused files/dependencies.

---

## 5. Usage for AI Agents

- **When adding a feature:** Check `packages/` first. Can this logic be shared? If so, implement it in a package, build it, then consume it in the app/service.
- **When fixing a bug:** Identify if the issue is in the consuming app (`apps/web`) or the underlying logic (`packages/*`). Fix at the lowest level possible.
- **When modifying DB Schema:** Run `pnpm db:gen-types` after changes to keep TypeScript definitions in sync.
