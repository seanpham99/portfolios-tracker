# Story 2.4: Unified Holdings Table

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want a single, sortable list of ALL my assets alongside their asset type (VN/US/Crypto),
So that I can compare performance across markets in one view.

## Acceptance Criteria

1. **Given** the unified dashboard
2. **When** I look at the Holdings section
3. **Then** I should see a table containing assets from ALL classes (VN Stocks, US Equities, Crypto)
4. **And** there should be a "Type" column using badges derived from `asset_class` (e.g., 🇻🇳 VN, 🇺🇸 US, ₿ Crypto)
5. **And** I can filter this table by Asset Class if I want to see only one type.
6. **And** data is fetched via React Query with a 60s polling interval to ensure freshness.

## Tasks / Subtasks

- [ ] **Task 1: Backend Aggregation Endpoint**
  - [ ] Implement `GET /portfolios/holdings` in NestJS which joins `transactions` and `assets` to return a flat list of current holdings.
  - [ ] Include calculated `avg_cost` and `total_quantity` in the response.

- [ ] **Task 2: Frontend Data Hook**
  - [ ] Create `useHoldings` custom hook in `apps/web/src/api/hooks/` using `@tanstack/react-query`.
  - [ ] Configure `refetchInterval: 60000` (60 seconds).

- [ ] **Task 3: Unified Table Component**
  - [ ] Create `UnifiedHoldingsTable` using TanStack Table.
  - [ ] Columns: Symbol, Name, Type (Badge), Price, 24h %, Value, P/L.

## Dev Notes

- **Design:** Clean rows, hover effects. Red/Green text for P/L.
- **Performance:** Use `useMemo` for table instance and filtering logic.

### Project Structure Notes

- **Frontend:** `apps/web/src/components/dashboard/unified-holdings-table.tsx`
- **Backend:** `services/api/src/portfolios/`

### References

- [Design: Unified Dashboard Concept](../project-planning-artifacts/ux/ux-design-specification.md)
- [Architecture: Decision 3.1 (React Query)](_bmad-output/architecture.md)
