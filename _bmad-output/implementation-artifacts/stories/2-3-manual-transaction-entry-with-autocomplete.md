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
3. **Then** I should see a list of matching assets from the `assets` table using fuzzy search (pg_trgm)
4. **And** I should be able to specify quantity, price, and transaction fees
5. **And** after submission, the transaction is saved via NestJS API and the UI updates optimistically using React 19 Actions and `useOptimistic`.

## Tasks / Subtasks

- [ ] **Task 0: Database Migration**
  - [ ] Create `transactions` table in Supabase with fields: `id`, `portfolio_id` (FK), `asset_id` (FK), `type` (BUY/SELL), `quantity`, `price`, `fee`, `transaction_date`.
  - [ ] Enable RLS and create policies (user can only manage transactions for their own portfolios).

- [ ] **Task 1: Transaction DTOs & Search API**
  - [ ] Create `CreateTransactionDto` in `packages/api-types`.
  - [ ] Implement `GET /assets/search` in NestJS API using `pg_trgm` for fuzzy matching symbols and names.

- [ ] **Task 2: Transaction Form Component**
  - [ ] Implement `Autocomplete` component using Shadcn UI `Combobox` fetching from `/assets/search`.
  - [ ] Create form using React 19 Actions (`useActionState`) for submission.

- [ ] **Task 3: Backend Implementation & Caching**
  - [ ] Implement `POST /portfolios/:id/transactions` in `PortfoliosService`.
  - [ ] Explicitly invalidate Redis cache keys for the portfolio (`portfolio:{userId}:{portfolioId}:*`) upon successful transaction to ensure Decision 1.3 alignment.

## Dev Notes

- **Architecture:** Aligns with Decision 1.1 (Normalization) and Decision 1.3 (Write-Through Caching).
- **Performance:** Use `pg_trgm` indexes for autocomplete speed.
- **UX:** Use `useOptimistic` for immediate feedback while the API call is in flight.

### Project Structure Notes

- **Frontend:** `apps/web/src/components/transactions/`
- **Backend:** `services/api/src/portfolios/`

### References

- [Source: _bmad-output/project-planning-artifacts/epics.md#Story 2.3]
- [Architecture: Decision 1.1 & 1.3](_bmad-output/architecture.md)
