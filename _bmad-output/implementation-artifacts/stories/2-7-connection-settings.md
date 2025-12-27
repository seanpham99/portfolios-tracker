# Story 2.7: Connection Management (API Keys & OAuth)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to manage my API connections to exchanges (Binance, OKX),
So that I can keep my crypto portfolio synced automatically.

## Acceptance Criteria

1. **Given** the Settings > Connections page
2. **When** I click "Connect Binance"
3. **Then** I should be guided through either an OAuth flow OR an API Key entry form
4. **And** once connected, I should see a "Synced" status with the last sync timestamp.
5. **And** I should be able to "Disconnect" or "Resync" manually.
6. **And** API keys must be stored in specialized encrypted storage (Supabase Vault or `user_connections` with pgsodium).

## Tasks / Subtasks

- [ ] **Task 1: Backend Connection Service**
  - [ ] Implement `ConnectionsService` in NestJS with CCXT integration.
  - [ ] Implement validation endpoint `POST /connections/validate` to check API keys before saving.
  - [ ] Create `user_connections` table with encrypted columns for secrets.

- [ ] **Task 2: Connections UI**
  - [ ] Implement `IntegrationCard` list (Binance, OKX).
  - [ ] Implement `APIKeyForm` modal with validation states.

- [ ] **Task 3: Sync Status Lifecycle**
  - [ ] Implement background job (or trigger) to update "Last Synced" timestamp.
  - [ ] Handle error states (Invalid Key, Permission Denied).

## Dev Notes

- **Security:** Never display full API Secret in UI. Use pgsodium or Supabase Vault for encryption at rest.
- **Library:** Use CCXT for unified exchange interaction as per Epic 3.

### Project Structure Notes

- **Frontend:** `apps/web/src/routes/_protected.settings.connections.tsx`
- **Backend:** `services/api/src/connections/`

### References

- [Design: Connections Spec](../project-planning-artifacts/ux/ux-design-specification.md)
- [Epic 3: Professional Crypto Automation](_bmad-output/project-planning-artifacts/epics.md#Epic 3)
