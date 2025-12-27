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

## Tasks / Subtasks

- [ ] **Task 1: Methodology Logic**
  - [ ] Define the explanation text/formulas for the current calculation method (likely Weighted Avg for MVP).

- [ ] **Task 2: UI Implementation**
  - [ ] Add a "Show Methodology"/Info icon or toggle in the Holdings list/detail.
  - [ ] Create a `MethodologyPanel` or `Tooltip` that reveals the explanation.
  - [ ] Display "Data Source: [Source Name]" (e.g., "Manual Entry", "CoinGecko").

## Dev Notes

- **Trust:** This feature is about building trust. The UI should look authoritative and clear.

### Project Structure Notes

- **Location:** `apps/web/src/components/common/`

### References

- [Source: _bmad-output/project-planning-artifacts/epics.md#Story 2.5]
