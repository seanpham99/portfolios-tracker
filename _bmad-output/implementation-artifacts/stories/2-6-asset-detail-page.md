# Story 2.6: Asset Detail Page Content

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to click on an asset in my dashboard to see its detailed performance and transaction history,
So that I can analyze why I'm making or losing money on this specific holding.

## Acceptance Criteria

1. **Given** I am on the Unified Dashboard
2. **When** I click a row in the Holdings Table (e.g., "AAPL")
3. **Then** I should navigate to `/asset/AAPL`
4. **And** I should see a **Price Chart** (TradingView widget)
5. **And** I should see a **Transaction History** list filtered for this asset (Buys/Sells)
6. **And** I should see my **Your Stats** card (Avg Cost, Total Return, Unrealized P/L) with data calculated by the NestJS backend as per Architecture Decision 1.2.
7. **And** initial data should be pre-loaded from the Holdings Query to avoid a loading state.

## Tasks / Subtasks

- [ ] **Task 1: Backend Asset Details API**
  - [ ] Implement `GET /assets/:symbol/details` in NestJS.
  - [ ] Calculate `avg_cost`, `total_return_pct`, and `unrealized_pl` for the current user and asset.
  - [ ] Fetch filtered transaction history for this asset.

- [ ] **Task 2: Asset Detail Route & Data**
  - [ ] Create route `/routes/_protected.asset.$symbol.tsx`.
  - [ ] Use `useQuery` with `initialData` from the holdings cache to provide an instant UI transition.

- [ ] **Task 3: Chart & History Integration**
  - [ ] Embed TradingView widget.
  - [ ] Implement `TransactionHistory` component filtered by symbol.

## Dev Notes

- **UX:** Deep dive experience. Should feel "Institutional".
- **Performance:** Use Decision 1.2 (Aggregation layer) to ensure stats are recalculated on-the-fly or fetched from hot cache.

### Project Structure Notes

- **Frontend:** `apps/web/src/routes/_protected.asset.$symbol.tsx`
- **Backend:** `services/api/src/assets/`

### References

- [Design: Asset Detail Spec](../project-planning-artifacts/ux/ux-design-specification.md)
- [Architecture: Decision 1.2 (Aggregation)](_bmad-output/architecture.md)
