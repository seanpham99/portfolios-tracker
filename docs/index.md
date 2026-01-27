# Portfolios Tracker Documentation

**Generated:** 2026-01-27
**Status:** Deep Scan Complete

## Project Documentation Index

### Project Overview

- **Type:** Monorepo with 3 parts
- **Primary Languages:** TypeScript, Python
- **Architecture:** Full-Stack (Next.js/NestJS) + Data Pipeline

### Quick Reference

#### Web Frontend (web)

- **Type:** web
- **Tech Stack:** Next.js 16, React 19, Tailwind 4
- **Root:** `apps/web`

#### API Service (api)

- **Type:** backend
- **Tech Stack:** NestJS 11, Supabase, Redis
- **Root:** `services/api`

#### Data Pipeline (data-pipeline)

- **Type:** data
- **Tech Stack:** Airflow, Python
- **Root:** `services/data-pipeline`

### Generated Documentation

**Core:**

- [Project Overview](./project-overview.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Project Context (Rules)](../_bmad-output/project-context.md) - _The Bible_
- [Architecture Decision Record](../_bmad-output/architecture.md)

**Architecture:**

- [Web Architecture](./architecture-web.md)
- [API Architecture](./architecture-api.md)
- [Data Pipeline Architecture](./architecture-data-pipeline.md)
- [Integration Architecture](./integration-architecture.md) _(To be generated)_

**Details:**

- [Component Inventory - Web](./component-inventory-web.md) _(To be generated)_
- [API Contracts - API](./api-contracts-api.md) _(To be generated)_
- [Data Models - API](./data-models-api.md) _(To be generated)_
- [Development Guide](./development-guide.md) _(To be generated)_

### Getting Started

1. **Install Dependencies:** `pnpm install`
2. **Start Dev Environment:** `pnpm dev`
3. **Run Tests:** `pnpm test`
4. **View Docs:** Open this `index.md`

Refer to `_bmad-output/project-context.md` for strict implementation rules before writing any code.
