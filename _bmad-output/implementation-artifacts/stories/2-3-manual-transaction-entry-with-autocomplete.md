# Story 2.3: Manual Transaction Entry with Autocomplete

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to quickly add buy/sell transactions with asset autocomplete,
So that I spend less than 30 seconds per entry.

## Acceptance Criteria

1. **Given** the transaction entry form
2. **When** I start typing an asset symbol or name
3. **Then** I should see a list of matching assets from a seeded `Dim_Asset` table (top 100 VN/US/Crypto symbols) to ensure functionality before the full ETL pipeline is live
4. **And** I should be able to specify quantity, price, and transaction fees
5. **And** after submission, the transaction is saved and the UI updates optimistically using React 19 Actions.

## Tasks / Subtasks

- [ ] **Task 1: Seed Data**
  - [ ] Ensure `Dim_Asset` table has seed data for demo (Top 100 VN/US/Crypto).

- [ ] **Task 2: Transaction Form Component**
  - [ ] Create a form with fields: Asset, Type (Buy/Sell), Quantity, Price, Date, Fee.
  - [ ] Implement `Autocomplete` component using Shadcn UI `Combobox` (or Radix UI primitive) fetching from `Dim_Asset`.

- [ ] **Task 3: Server Action & Optimistic Update**
  - [ ] Create a Server Action to save transaction to `transactions` table.
  - [ ] Use React `useOptimistic` hook to update the UI immediately upon submission.

## Dev Notes

- **Performance:** Autocomplete should be fast. Consider caching asset list.
- **UX:** Focus management is key for speed.

### Project Structure Notes

- **Location:** `apps/web/src/components/transactions/`

### References

- [Source: _bmad-output/project-planning-artifacts/epics.md#Story 2.3]
