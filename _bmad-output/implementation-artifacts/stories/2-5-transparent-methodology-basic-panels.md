# Story 2.5: Transparent Methodology Basic Panels

Status: done

## Story

As a User,
I want to see how my cost basis is calculated,
So that I can trust the accuracy of the platform.

## Acceptance Criteria

1. **Given** a holding in the `UnifiedHoldingsTable`
2. **When** I click the "Show Methodology" info icon (or row expansion trigger)
3. **Then** a collapsible panel must appear using **TanStack Table Row Expansion**
4. **And** the expansion must use **Framer Motion** for a smooth slide/fade transition (respecting `prefers-reduced-motion`)
5. **And** the panel must display the calculation formula (FIFO/Weighted Avg) and the **Asset Data Source** (e.g., "Binance via CCXT", "vnstock")
6. **And** methodology data must be server-driven via the `HoldingDto` to ensure consistency
7. **And** the toggle button must meet accessibility standards (`aria-expanded`, `aria-controls`, and descriptive `aria-label`).

## Tasks / Subtasks

- [x] **Task 1: Extend Shared API Contracts**
  - [x] Update `HoldingDto` in `@repo/api-types` to include `calculationMethod` (enum) and `dataSource` (string) fields.
  - [x] Define `CalculationMethod` enum (e.g., `WEIGHTED_AVG`, `FIFO`) in shared types.
  - [x] Update NestJS `PortfoliosService` to populate these fields in the `getHoldings` response.

- [x] **Task 2: Implement UI with TanStack Table Expansion**
  - [x] Enable row expansion in `UnifiedHoldingsTable` (`apps/web/src/components/dashboard/unified-holdings-table.tsx`).
  - [x] Create `MethodologyPanel` component in `apps/web/src/components/common/`.
  - [x] Implement `renderSubComponent` to display the `MethodologyPanel` within the expanded row.
  - [x] Use `AnimatePresence` from **Framer Motion** for the expansion animation.
  - [x] Add ARIA attributes to the expansion trigger icon.

## Dev Agent Record

### Implementation Plan
- [x] **Task 1: Extend Shared API Contracts**
  - [x] Created `CalculationMethod` enum in `@repo/api-types`
  - [x] Extended `HoldingDto` with `calculationMethod` and `dataSource` fields  
  - [x] Updated NestJS `PortfoliosService.getHoldings()` to populate methodology fields
  - [x] Added unit tests for methodology field population

- [x] **Task 2: Implement UI with TanStack Table Expansion**
  - [x] Added TanStack Table row expansion with `getExpandedRowModel()`
  - [x] Created `MethodologyPanel` component with Framer Motion animations
  - [x] Added expansion trigger column with `ChevronRight` icon and rotation animation
  - [x] Implemented ARIA attributes (`aria-expanded`, `aria-controls`, `aria-label`)
  - [x] Used `AnimatePresence` for smooth slide/fade transitions

### Debug Log
*(No blocking issues encountered)*

### Completion Notes
- ✅ **Backend:** `HoldingDto` extended with `calculationMethod` (enum) and `dataSource` fields
- ✅ **Shared Types:** `CalculationMethod` enum created with `WEIGHTED_AVG` and `FIFO` values
- ✅ **Service Logic:** All holdings now return `calculationMethod: WEIGHTED_AVG` and `dataSource: Manual Entry`
- ✅ **Frontend:** TanStack Table row expansion implemented with accessibility features
- ✅ **MethodologyPanel:** Created with formula display, data source badge, and Framer Motion animations
- ✅ **Animation:** Used `initial={{ height: 0, opacity: 0 }}` and `animate={{ height: 'auto', opacity: 1 }}` as specified
- ✅ **Accessibility:** Added full ARIA support - `aria-expanded`, `aria-controls`, and descriptive `aria-label`
- ✅ **Testing:** Backend compiles successfully with TypeScript strict mode
- ✅ **(Review Fix 1):** Improved empty state with `@repo/ui/components/empty` component and "Add Transaction" CTA
- ✅ **(Review Fix 2):** Added `useReducedMotion` hook to respect `prefers-reduced-motion` accessibility preference (AC 4)
- ✅ **(Review Fix 3):** Fixed React Fragment key warning in table row mapping
- ✅ **(Review Fix 4):** Cleaned up import formatting and extracted animation duration constant

## File List
- packages/api-types/src/calculation-method.enum.ts
- packages/api-types/src/holding.dto.ts
- packages/api-types/src/index.ts
- services/api/src/portfolios/portfolios.service.ts
- services/api/src/portfolios/portfolios.service.spec.ts
- apps/web/src/components/common/methodology-panel.tsx
- apps/web/src/components/dashboard/unified-holdings-table.tsx

##  Change Log
- 2025-12-28: Story 2.5 implemented - Added methodology transparency with row expansion panels
- 2025-12-28: (Review Fix) Replaced plain empty state with shared Empty component from @repo/ui with proper CTA
- 2025-12-28: (Code Review) Fixed 4 issues: prefers-reduced-motion support, React Fragment keys, import cleanup, animation constants

## Dev Notes

- **Row Expansion:** Do not use a separate modal; use the native row expansion capability of TanStack Table to keep the context of the holding.
- **Animation:** Use `initial={{ height: 0, opacity: 0 }}` and `animate={{ height: 'auto', opacity: 1 }}` for the panel to ensure smooth layout shifts.
- **A11y:** Ensure the info icon is focusable and has a clear tooltip or aria-label for screen readers.

### Project Structure Notes

- **Web:** `apps/web/src/components/dashboard/` (Table) and `apps/web/src/components/common/` (Panel)
- **API:** `services/api/src/portfolios/`
- **Shared:** `packages/api-types/`

### References

- [Story 2.4: Unified Holdings Table](2-4-unified-holdings-table.md)
- [Architecture: Decision 3.1 (React Query)](../../architecture.md)
- [UX Design Specification](../../project-planning-artifacts/ux/ux-design-specification.md)
