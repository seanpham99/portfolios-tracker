# Story 1.1: Initialize NestJS API & Shared Packages

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Developer,
I want a standardized NestJS API and shared package structure,
so that I can build the backend services with type-safety and consistency across the monorepo.

## Acceptance Criteria

1. **Given** the current Turborepo structure
2. **When** I initialize the NestJS API using `nest new api --package-manager pnpm` in the `services/` directory
3. **Then** the project should be created with strict TypeScript mode enabled
4. **And** the `packages/database-types` (Supabase auto-gen) and `packages/api-types` (DTOs/Shared) packages should be present and linked in `pnpm-workspace.yaml`
5. **And** a basic health check endpoint `GET /` should return a 200 OK status.

## Tasks / Subtasks

- [ ] **Task 1: Initialize NestJS Project (AC: 1, 2, 3)**
  - [ ] Create `services/api` directory if needed.
  - [ ] Run `npx @nestjs/cli new api --package-manager pnpm --skip-git`.
  - [ ] Ensure `tsconfig.json` has `strict: true`.
  - [ ] Update `package.json` name to `@fin-sight/api`.
- [ ] **Task 2: Setup Shared Type Packages (AC: 4)**
  - [ ] Create `packages/database-types` directory.
  - [ ] Initialize `packages/database-types/package.json` as `@fin-sight/database-types`.
  - [ ] Create `packages/api-types` directory.
  - [ ] Initialize `packages/api-types/package.json` as `@fin-sight/api-types`.
  - [ ] Add `packages/database-types` as a dependency to `@fin-sight/api-types`.
- [ ] **Task 3: Implement Core Health Check (AC: 5)**
  - [ ] Verify `app.controller.ts` has a root `GET` endpoint.
  - [ ] Ensure it returns a simple 200 OK or `{ "status": "ok" }`.
- [ ] **Task 4: Monorepo Integration**
  - [ ] Link new packages in the root `pnpm-workspace.yaml`.
  - [ ] Add `@fin-sight/api-types` as a devDependency to `apps/web` and `services/api`.

## Dev Notes

- **Architecture Patterns:** Uses the service-based organization defined in `architecture.md`.
- **Naming Conventions:** Service uses `@fin-sight/api`, packages use `@fin-sight/*`.
- **Database Types:** `packages/database-types` is intended to hold the output of `supabase gen types typescript --local`.

### Project Structure Notes

- **Location:** `services/api/` and `packages/*`.
- **Consistency:** Follows the Turborepo pattern already established in the workspace.

### References

- [Source: _bmad-output/architecture.md#Shared Packages]
- [Source: _bmad-output/architecture.md#NestJS (services/api)]
- [Source: _bmad-output/project-planning-artifacts/epics.md#Story 1.1]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
