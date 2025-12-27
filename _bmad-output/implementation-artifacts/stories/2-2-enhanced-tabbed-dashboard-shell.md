# Story 2.2: Enhanced Tabbed Dashboard Shell

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want a smooth, premium tabbed interface to switch between asset classes,
So that I can explore my portfolio without cognitive overload during market volatility.

## Acceptance Criteria

1. **Given** the dashboard page in the React 19 frontend
2. **When** I switch between "VN Stocks", "US Equities", and "Crypto" tabs
3. **Then** the transition should be smooth using Framer Motion (200ms fade + 30px slide)
4. **And** each tab should display a badge showing the asset count and total value
5. **And** I can use `Cmd/Ctrl + 1/2/3` shortcuts to switch tabs on desktop.

## Tasks / Subtasks

- [ ] **Task 1: Dashboard Structure**
  - [ ] Create `DashboardLayout` component in `apps/web`.
  - [ ] Define tab states (VN Stocks, US Equities, Crypto).

- [ ] **Task 2: Animated Tabs**
  - [ ] Implement tab switching logic.
  - [ ] Apply Framer Motion `AnimatePresence` for smooth transitions (fade + slide).

- [ ] **Task 3: Tab Content & Badges**
  - [ ] Create placeholders or connect basic data for "Asset Count" and "Total Value" badges on tabs.
  - [ ] Ensure badges update based on mock or real data.

- [ ] **Task 4: Keyboard Shortcuts**
  - [ ] Add event listeners for `Cmd+1`, `Cmd+2`, `Cmd+3` to switch active tab.

## Dev Notes

- **UX:** Prioritize smoothness and perceived performance.
- **Tech:** React Router 7 + Framer Motion.

### Project Structure Notes

- **Location:** `apps/web/src/routes/_protected.dashboard.tsx` (or similar route).

### References

- [Source: _bmad-output/project-planning-artifacts/epics.md#Story 2.2]
