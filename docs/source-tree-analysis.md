# Source Tree Analysis

**Generated:** 2026-01-27

## Directory Structure

```text
portfolios-tracker/
├── apps/
│   └── web/                     # [Part: web] Next.js Frontend
│       ├── src/
│       │   ├── app/             # App Router pages and layouts
│       │   ├── features/        # Feature-based logic (components, hooks)
│       │   ├── hooks/           # Global hooks (e.g., useStaleness)
│       │   └── lib/             # Utility libraries
│       ├── public/              # Static assets
│       └── next.config.ts       # Next.js configuration
├── services/
│   ├── api/                     # [Part: api] NestJS Backend
│   │   ├── src/
│   │   │   ├── portfolios/      # Portfolios Domain Module
│   │   │   ├── assets/          # Assets Domain Module
│   │   │   ├── market-data/     # Market Data Module (External APIs)
│   │   │   └── common/          # Shared guards, decorators, filters
│   │   └── nest-cli.json        # NestJS configuration
│   └── data-pipeline/           # [Part: data-pipeline] Airflow ETL
│       ├── dags/                # Airflow DAGs (Scheduled jobs)
│       ├── plugins/             # Custom Airflow plugins
│       └── requirements.txt     # Python dependencies (managed by uv)
├── packages/
│   ├── shared-types/            # Shared DTOs and Database Types
│   │   ├── src/
│   │   │   ├── api/             # API Response & Request DTOs
│   │   │   └── database/        # Supabase/Drizzle definitions
│   ├── ui/                      # Shared UI Components (Shadcn/Radix)
│   ├── eslint-config/           # Shared ESLint configurations
│   └── typescript-config/       # Shared TSConfig bases
├── _bmad-output/                # Project Management Artifacts
│   ├── architecture.md          # Core Architecture Decision Record
│   ├── project-context.md       # Critical Implementation Rules ("The Bible")
│   └── implementation-artifacts/# Sprint & Epic records
└── docker-compose.yml           # Local development infrastructure
```

## Critical Folders

### apps/web/src/features/

The core of the frontend application. Follows a feature-based architecture where UI components, local state (Zustand), and data fetching hooks (TanStack Query) are co-located by domain (e.g., `dashboard`, `portfolio-details`, `asset-search`).

### services/api/src/

Contains the modular NestJS application. Key modules include `portfolios` (core business logic), `assets` (master data), and `market-data` (integration with providers like Binance/Yahoo).

### services/data-pipeline/dags/

Hosts the Python-based Airflow Directed Acyclic Graphs. This is where scheduled tasks like `portfolio_daily_snapshot` live, triggering batch operations in the API service.

### packages/shared-types/

The **Single Source of Truth** for data contracts. Both the Frontend and Backend import DTOs and API Response envelopes from here to ensure type safety across the network boundary.

## Entry Points

- **Web**: `apps/web/src/app/layout.tsx` (Root Layout)
- **API**: `services/api/src/main.ts` (Bootstrap NestJS)
- **Data Pipeline**: `services/data-pipeline/dags/*` (Individual DAG execution)
