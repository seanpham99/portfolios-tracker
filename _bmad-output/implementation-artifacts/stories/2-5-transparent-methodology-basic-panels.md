# Story 2.5: Transparent Methodology Basic Panels

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to see how my cost basis is calculated,
So that I can trust the accuracy of the platform.

## Acceptance Criteria

1. **Given** a holding in the list
2. **When** I click the "Show Methodology" toggle
3. **Then** a collapsible panel should appear explaining the FIFO or Weighted Average Cost formulas
4. **And** the source of the asset's price data must be prominently displayed.
5. **And** the methodology explanations must be consistent across the app, driven by typed definitions in `packages/api-types`.

## Tasks / Subtasks

- [ ] **Task 1: Shared Methodology Types**
  - [ ] Define `CalculationMethodology` enum and `MethodologyContent` constants in `packages/api-types`.
  - [ ] Define the explanation text/formulas (Weighted Avg for MVP).

- [ ] **Task 2: UI Implementation**
  - [ ] Add a "Show Methodology"/Info icon or toggle in the Holdings list/detail.
  - [ ] Create a `MethodologyPanel` component in `apps/web/src/components/common/`.
  - [ ] Display "Data Source: [Source Name]" (e.g., "Manual Entry", "CoinGecko").

## Dev Notes

- **Trust:** This feature is about building trust. The UI should look authoritative and clear.
- **CMS-lite:** Although hardcoded for now, keeping these in `api-types` allows for future internationalization or dynamic updates.

### Project Structure Notes

- **Location:** `apps/web/src/components/common/`
- **Shared:** `packages/api-types/`

### References

- [Source: _bmad-output/project-planning-artifacts/epics.md#Story 2.5]
