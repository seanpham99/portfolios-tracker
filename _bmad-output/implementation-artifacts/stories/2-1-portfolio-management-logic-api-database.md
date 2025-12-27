# Story 2.1: Portfolio Management Logic (API & Database)

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to create and manage multiple portfolios across different asset classes,
So that I can organize my investments according to my strategy.

## Acceptance Criteria

1. **Given** the NestJS API and Supabase setup
2. **When** I create, read, update, or delete a portfolio via the API
3. **Then** the changes should be reflected in the Supabase PostgreSQL database
4. **And** Row Level Security (RLS) must ensure I can only access my own portfolios
5. **And** the API should support setting a base currency (VND/USD/USDT) for each portfolio.

## Tasks / Subtasks

- [ ] **Task 1: Database Schema & RLS**
  - [ ] Create `portfolios` table in Supabase with fields: `id`, `user_id`, `name`, `base_currency` (text check constraint: 'VND', 'USD', 'USDT'), `created_at`.
  - [ ] Enable RLS on `portfolios` table.
  - [ ] Create RLS policies for SELECT, INSERT, UPDATE, DELETE enforcing `auth.uid() = user_id`.

- [ ] **Task 2: NestJS Service & Controller**
  - [ ] Generate `PortfoliosModule` in NestJS API.
  - [ ] Implement `PortfoliosService` with methods: `create`, `findAll`, `findOne`, `update`, `remove`.
  - [ ] Implement `PortfoliosController` with endpoints.

- [ ] **Task 3: Validation & Types**
  - [ ] Create DTOs: `CreatePortfolioDto`, `UpdatePortfolioDto`.
  - [ ] Enforce currency validation (VND, USD, USDT).

## Dev Notes

- **Architecture Patterns:** Use the standard Controller-Service-Repository pattern.
- **Database:** Ensure proper foreign key relationships with `auth.users`.

### Project Structure Notes

- **Location:** `services/api/src/portfolios/`

### References

- [Source: _bmad-output/project-planning-artifacts/epics.md#Story 2.1]
