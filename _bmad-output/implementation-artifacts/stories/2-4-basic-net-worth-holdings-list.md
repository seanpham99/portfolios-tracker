# Story 2.4: Basic Net Worth & Holdings List

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to see my total net worth and a list of my current holdings,
So that I can understand my current financial state at a glance.

## Acceptance Criteria

1. **Given** the dashboard view
2. **When** I view an asset class tab
3. **Then** I should see my total net worth for that category in the top summary card
4. **And** I should see a virtualized list of individual holdings showing quantity and average cost
5. **And** the UI must stack gracefully on mobile devices (bottom bar navigation).

## Tasks / Subtasks

- [ ] **Task 1: Net Worth Card**
  - [ ] Create composite component to display Total Value and basic P&L for the current scope.

- [ ] **Task 2: Holdings List**
  - [ ] Implement `HoldingsList` component.
  - [ ] Use `tanstack-virtual` or similar if list is expected to be long (100+), otherwise standard map is fine for MVP.
  - [ ] Columns: Asset, Quantity, Avg Price, Current Value.
  - [ ] Integrate with `GET /portfolios` API (from Story 2.1) to fetch real holdings data.

- [ ] **Task 3: Mobile Responsiveness**
  - [ ] Ensure the layout adjusts to mobile screens (cards stack, table becomes list or scrollable).

## Dev Notes

- **Data Source:** Should leverage data from Story 2.1 (Portfolios/Transactions) and basic pricing.

### Project Structure Notes

- **Location:** `apps/web/src/components/dashboard/`

### References

- [Source: _bmad-output/project-planning-artifacts/epics.md#Story 2.4]
