# Story 5.1: Binance API Sync (Read-Only)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to connect my Binance account via API keys (read-only),
, so that my spot balances are automatically tracked in my unified portfolio.

## Acceptance Criteria

1.  **Given** the Connections page (newly created or accessible via settings).
2.  **When** I select "Binance" and enter valid **API Key** and **Secret Key** (read-only permissions).
3.  **Then** the system validates the keys by connecting to verified Binance API.
4.  **Then** the system fetches current SPOT balances (ignoring small/dust balances if configured).
5.  **Then** the system creates or updates `Asset` records for the found tokens (if not existing) and `Holding` records in a dedicated "Binance" portfolio (or user-selected portfolio).
6.  **Then** the UI displays a success message and shows the synced balance summary.

## Tasks / Subtasks

- [ ] **Backend: Shared Types & DTOs**
  - [ ] Create `CreateConnectionDto` in `@workspace/shared-types` (provider, apiKey, secret, etc.).
  - [ ] Define `ExchangeConnection` entity structure (store encrypted keys or secure reference).
- [ ] **Backend: Exchange Module & Binance Service**
  - [ ] Initialize `services/api/src/exchanges/` module.
  - [ ] Implement `BinanceService` using `ccxt`.
  - [ ] Implement `validateKeys(apiKey, secret)` method.
  - [ ] Implement `fetchBalances(apiKey, secret)` method properly handling `float` -> `Decimal` conversion.
  - [ ] Implement `syncHoldings(userId, balances)` logic to upsert `Portfolio/Holdings`.
- [ ] **Backend: API Endpoints**
  - [ ] `POST /api/v1/connections/binance` - Connect & Initial Sync.
  - [ ] `GET /api/v1/connections` - List active connections.
- [ ] **Frontend: Connections Feature**
  - [ ] Create `apps/web/src/features/connections/` structure.
  - [ ] Implement `BinanceConnectionForm` with Zod validation.
  - [ ] Add "Connections" page/route (basic implementation if 5.3 not ready).
- [ ] **Security & Error Handling**
  - [ ] Ensure API Keys are NOT returned in plain text in GET responses.
  - [ ] Handle CCXT errors (RateLimit, AuthFailed) with "Calm" error responses.

## Dev Notes

- **Library**: Use `ccxt` (v4.5.29) as mandated by `project-context.md`.
- **Security**: API Secret Keys MUST be stored securely. Ideally encrypted at rest. If encryption infra (`pgcrypto` or app-level encryption) isn't set up, establishing a `SecretsService` or similar is a prerequisite task within this story. Minimum robust AES-256 encryption.
- **Precision**: Balances from Binance (floats) must be converted to `Decimal` strings immediately before storage.
- **Rate Limiting**: CCXT handles some, but ensure we respect Binance limits. Use `enableRateLimit: true` in CCXT constructor.

### Project Structure Notes

- **Backend**: `services/api/src/exchanges/` for exchange logic.
- **Frontend**: `apps/web/src/features/connections/` for UI.
- **Shared**: `@workspace/shared-types/src/connections.ts`.

### References

- **Architecture**: `services/api` uses NestJS + Supabase.
- **Project Context**: "Financial Precision: NEVER use float math for currency."
- **CCXT Docs**: [CCXT Manual](https://docs.ccxt.com/)

## Dev Agent Record

### Agent Model Used

Antigravity (Gemini 2.0 Flash)

### Debug Log References

### Completion Notes List

### File List
