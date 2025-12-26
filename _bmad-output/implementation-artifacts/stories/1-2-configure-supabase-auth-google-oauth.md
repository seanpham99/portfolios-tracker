# Story 1.2: Configure Supabase Auth & Google OAuth

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to authenticate via Google OAuth or Email/Password,
so that I can securely access my portfolio data.

## Acceptance Criteria

1. **Given** a Supabase project
2. **When** I configure Google OAuth and Email/Password providers in the Supabase dashboard
3. **Then** a user should be able to sign up or log in using either method
4. **And** the user's profile should be automatically created in the `users` table upon first login (via Database Trigger)
5. **And** a secure JWT should be returned to the client.

## Tasks / Subtasks

- [ ] **Task 1: Configure Supabase Auth Providers (AC: 1, 2)**
  - [ ] Log into Supabase Dashboard.
  - [ ] Enable Email/Password provider.
  - [ ] Configure Google OAuth provider (requires Google Cloud Console credentials).
  - [ ] Document the Callback URL for the frontend.
- [ ] **Task 2: User Profile Management (AC: 4)**
  - [ ] Create a migration to define the `public.users` table (id, email, full_name, avatar_url, created_at).
  - [ ] Create a migration for the `handle_new_user` trigger on `auth.users` insert.
  - [ ] Ensure `public.users` id references `auth.users` id.
- [ ] **Task 3: Row Level Security (RLS) (AC: 5)**
  - [ ] Enable RLS on `public.users`.
  - [ ] Add policy: "Users can view their own profile" (`auth.uid() = id`).
  - [ ] Add policy: "Users can update their own profile".
- [ ] **Task 4: Verification (AC: 3)**
  - [ ] Use Supabase client in a utility script or temporary UI to verify login flow.
  - [ ] Check `public.users` is populated after signup.

## Dev Notes

- **Migration Location:** `supabase/migrations/`. Naming convention: `<timestamp>_create_users_table.sql`.
- **Triggers:** Standard Supabase pattern for `auth.users` replication.
- **Types:** Ensure `packages/database-types` is regenerated after applying migrations (`supabase gen types typescript --local`).

### Project Structure Notes

- **Supabase:** Configuration is largely managed in the Supabase Cloud/Local Dashboard, but schema must be versioned in `migrations/`.
- **Shared Types:** This story triggers the first update to `@repo/database-types`.

### References

- [Source: _bmad-output/project-planning-artifacts/epics.md#Story 1.2]
- [Source: _bmad-output/architecture.md#Authentication & User Management]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
