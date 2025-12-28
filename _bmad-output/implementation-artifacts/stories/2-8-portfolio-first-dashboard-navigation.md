# Story 2.8: Portfolio-First Dashboard Navigation

Status: ready-for-dev

## Story

As a User with multiple portfolios,
I want the dashboard to show my portfolio list first,
So that I can select which portfolio to view in detail and understand my wealth across different investment strategies.

## Context

**Origin:** Party Mode discussion on 2025-12-28 identified a critical gap between PRD requirements and current implementation. The PRD requires ≤3 clicks from dashboard → portfolio → asset → transaction, but the current dashboard shows holdings directly without portfolio selection.

**Impact:** This story restructures the frontend navigation to align with the documented architecture:
- `/dashboard` → Portfolio list (cards)
- `/portfolio/:id` → Portfolio detail (holdings table, charts)
- `/portfolio/:id/asset/:symbol` → Asset detail (future story)

## Acceptance Criteria

1. **Given** an authenticated user on the dashboard
   **When** the page loads
   **Then** I should see a grid of portfolio cards, not holdings directly

2. **Given** the portfolio list view
   **When** I view a portfolio card
   **Then** I should see: portfolio name, net worth, P/L (absolute + %), and allocation mini-indicator

3. **Given** the portfolio list view
   **When** I click on a portfolio card
   **Then** I should navigate to `/portfolio/:id` (portfolio detail page)

4. **Given** the portfolio detail page (`/portfolio/:id`)
   **When** the page loads
   **Then** I should see the `UnifiedHoldingsTable` showing holdings for THAT portfolio only

5. **Given** no portfolios exist
   **When** the dashboard loads
   **Then** I should see an Empty state with "Create Your First Portfolio" CTA using the `@repo/ui/components/empty` component

6. **Given** the backend API
   **When** fetching holdings for a specific portfolio
   **Then** the API should use `GET /portfolios/:id/holdings` (new endpoint)

7. **Given** the frontend hooks
   **When** fetching holdings
   **Then** `useHoldings(portfolioId)` should accept a portfolio ID parameter

## Tasks / Subtasks

- [ ] **Task 1: Create PortfolioCard Component**
  - [ ] Create `apps/web/src/components/dashboard/portfolio-card.tsx`
  - [ ] Display portfolio name, net worth, P/L, allocation indicator
  - [ ] Add click handler to navigate to `/portfolio/:id`
  - [ ] Add hover effects and loading skeleton

- [ ] **Task 2: Update Dashboard Route (`/dashboard`)**
  - [ ] Refactor `_protected.dashboard.tsx` to show portfolio list
  - [ ] Use `usePortfolios()` hook to fetch user's portfolios
  - [ ] Implement grid layout for PortfolioCards
  - [ ] Add Empty state with Create Portfolio CTA

- [ ] **Task 3: Create Portfolio Detail Route (`/portfolio/:id`)**
  - [ ] Create `_protected.portfolio.$id.tsx` route file
  - [ ] Move UnifiedHoldingsTable, charts, and stats here
  - [ ] Pass `portfolioId` to components

- [ ] **Task 4: Update Holdings Hook & API**
  - [ ] Update `useHoldings()` to accept `portfolioId` parameter
  - [ ] Add `GET /portfolios/:id/holdings` endpoint to backend
  - [ ] Update `PortfoliosService.getHoldings(userId, portfolioId)`

- [ ] **Task 5: Update Navigation & Breadcrumbs**
  - [ ] Add back navigation from portfolio detail to dashboard
  - [ ] Update sidebar active state for portfolio routes
  - [ ] Ensure URL reflects current portfolio context

## Dev Notes

- **Breaking Change:** This restructures the frontend navigation significantly
- **Migration:** Current `/dashboard` content moves to `/portfolio/:id`
- **Dependencies:** Stories 2.4 (UnifiedHoldingsTable) and 2.5 (MethodologyPanel) continue to work after this change
- **Empty States:** Use `@repo/ui/components/empty` for both dashboard (no portfolios) and holdings table (no holdings in portfolio)

### API Changes

**New Endpoint:**
```
GET /portfolios/:id/holdings
Authorization: Bearer <token>
Response: HoldingDto[]
```

**Hook Signature Change:**
```typescript
// Before
useHoldings() => HoldingDto[]

// After  
useHoldings(portfolioId: string) => HoldingDto[]
```

### Route Structure

```
/dashboard                    → PortfolioListPage (NEW)
/portfolio/:id                → PortfolioDetailPage (moves current dashboard here)
/portfolio/:id/asset/:symbol  → AssetDetailPage (future story)
```

## References

- PRD: Lines 144-147 (Portfolio-First Navigation)
- Architecture: Decision 3.2 (Frontend Route Architecture)
- UX Spec: Screen Specifications, Gap Analysis
- Party Mode Discussion: 2025-12-28
