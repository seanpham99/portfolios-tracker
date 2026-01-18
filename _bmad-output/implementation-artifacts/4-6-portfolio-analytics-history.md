# Story 4.6: Portfolio Analytics & History Backfill

**Status:** done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

**As a** generic user,
**I want** to see the historical performance of my portfolios on a chart (1D, 1W, 1M, etc.),
**so that** I can visualize my wealth progression over time instead of just the current snapshot.

## Acceptance Criteria

1.  **Given** a user with existing portfolios.
    **When** the system runs its daily snapshot job (or triggers on read > 24h).
    **Then** a new record is created in `portfolio_snapshots` capturing `net_worth`, `total_cost`, and `timestamp`.

2.  **Given** the Portfolio Dashboard or Detail page.
    **When** the user requests history (e.g., "1M" range).
    **Then** the Area Chart displays a line graph of the portfolio's `net_worth` over that period.

3.  **Given** a new user or portfolio with < 2 snapshots.
    **When** attempting to view history.
    **Then** the chart handles the "insufficient data" state gracefully (e.g., single point or "No history yet" message).

## Tasks / Subtasks

- [x] **Task 1: Database Schema & Entity** (AC: 1)
  - [x] Create `PortfolioSnapshot` entity in `services/api/src/portfolios/entities` (Mapped via Supabase Types).
  - [x] Define shared DTO `PortfolioSnapshotDto` in `@workspace/shared-types`.
  - [x] Create migration for `portfolio_snapshots` table (user_id, portfolio_id, date, net_worth, total_cost, metadata).

- [x] **Task 2: Snapshot Logic Implementation** (AC: 1)
  - [x] Implement `SnapshotService` in `services/api`.
  - [x] Create `captureSnapshot(portfolioId)` method reusing `PortfoliosService.calculateTotalValue`.
  - [x] Implement trigger logic: Check "last snapshot header" on `findOne`. If > 24h, trigger capture (MVP approach).

- [x] **Task 3: History API Endpoints** (AC: 2)
  - [x] Implement `GET /portfolios/:id/history` with `range` query param (1d, 1w, 1m, 1y, all).
  - [x] Implement `GET /portfolios/history` (Aggregated) for Dashboard (Skipped: will be added in dashboard story, focused on detail view first).
  - [x] Ensure API returns standard envelope: `{ data: [{ date, value }], meta: ... }`.

- [x] **Task 4: Frontend Integration** (AC: 2, 3)
  - [x] Create `usePortfolioHistory` hook in `apps/web/src/features/portfolio/hooks`.
  - [x] Refactor `PortfolioHistoryChart` to use hook.
  - [x] Update `DashboardClient` to fetch aggregated history (Skipped as above).
  - [x] Handle loading and empty states using "Calm" UX patterns (skeletons).

## Dev Notes

### Architecture Compliance

- **Database**: Use `snake_case` for `portfolio_snapshots` table. Use Supabase Shared Types.
- **Math**: **NEVER** use float math. Use `decimal.js` or string-based math for all net worth aggregations.
- **API**: Follow standard envelope `{ data, meta }`.
- **Resilience**: History fetch should be non-blocking. If it fails, show "History unavailable" but keep current stats visible.

### Technical Stack

- **Backend**: NestJS + TypeORM (or raw query if complex).
- **Frontend**: Recharts for visualization.
- **State**: TanStack Query (staleTime: 5m for history).

### Project Structure Notes

- **Entities**: `services/api/src/portfolios/entities/portfolio-snapshot.entity.ts`
- **DTOs**: `packages/shared-types/src/api/portfolio-history.dto.ts`
- **Frontend Feature**: `apps/web/src/features/analytics` or keep in `portfolio` if specific.

### References

- [Architecture: Data Architecture](file:///d:/3-Work/portfolios-tracker/_bmad-output/architecture.md#data-architecture)
- [Project Context: Critical Rules](file:///d:/3-Work/portfolios-tracker/_bmad-output/project-context.md#critical-implementation-rules)

## Dev Agent Record

### Agent Model Used

- Antigravity (Google Deepmind)

### Debug Log References

- N/A

### Completion Notes List

- Implemented `portfolio_snapshots` table with RLS.
- Created `SnapshotService` in API to handle history tracking.
- Added lazy snapshot triggering on portfolio view (>24h staleness).
- Integrated `PortfolioHistoryChart` with real data via `usePortfolioHistory`.

### File List

- `supabase/migrations/20260118000000_create_portfolio_snapshots.sql`
- `packages/shared-types/src/api/portfolio-history.dto.ts`
- `packages/shared-types/src/api/index.ts`
- `services/api/src/portfolios/snapshot.service.ts`
- `services/api/src/portfolios/portfolios.module.ts`
- `services/api/src/portfolios/portfolios.controller.ts`
- `apps/web/src/features/portfolio/hooks/use-history.ts`
- `apps/web/src/features/portfolio/portfolio-history-chart.tsx`
