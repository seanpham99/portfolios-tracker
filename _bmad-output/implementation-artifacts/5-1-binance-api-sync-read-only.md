# Story 5.1: Binance API Sync (Read-Only)

Status: done

## Story

As a user,
I want to connect my Binance account via API keys (read-only),
so that my spot balances are automatically tracked in my unified portfolio.

## Acceptance Criteria

1. **Given** the Connections page at `/connections` (or accessible via settings).
2. **When** I select "Binance" and enter valid **API Key** and **Secret Key** (read-only permissions).
3. **Then** the system validates keys via CCXT → Binance API (real validation, not mock).
4. **Then** the system fetches current SPOT balances (filter dust < $1 USD equivalent).
5. **Then** the system creates/updates `Asset` records (if not existing) with `asset_class: 'crypto'`, `source: 'binance'`.
6. **Then** the system creates "sync" transactions in user's selected portfolio (or auto-create "Binance Sync" portfolio).
7. **Then** the UI displays success toast with synced balance summary.

## Tasks / Subtasks

- [x] **Task 1: Fix Existing ConnectionsService Encryption (AC: 2,3)**
  - [x] Update `services/api/src/crypto/connections.service.ts` line 54 to use `encryptSecret()` from `crypto.utils.ts`
  - [x] Verify `decryptSecret()` works for retrieving keys when syncing
  - [x] Add unit test for encryption round-trip in `connections.service.spec.ts`

- [x] **Task 2: Implement BinanceService with CCXT (AC: 3,4)**
  - [x] Create `services/api/src/crypto/binance.service.ts`
  - [x] Configure CCXT: `new ccxt.binance({ enableRateLimit: true, timeout: 30000 })`
  - [x] Implement `validateKeys(apiKey, secret): Promise<ValidationResultDto>` - actually calls `exchange.fetchBalance()`
  - [x] Implement `fetchBalances(apiKey, secret): Promise<Balance[]>` with Decimal conversion
  - [x] Filter dust balances: skip assets where USD value < 1.00
  - [x] Map CCXT errors: `AuthenticationError` → "Invalid credentials", `RateLimitExceeded` → "Rate limited"

- [x] **Task 3: Update ConnectionsService.validateConnection() (AC: 3)**
  - [x] Replace mock validation (line 77) with call to `BinanceService.validateKeys()`
  - [x] Inject `BinanceService` into `ConnectionsService`

- [x] **Task 4: Implement Sync Logic (AC: 5,6)**
  - [x] Create `services/api/src/crypto/binance-sync.service.ts`
  - [x] Implement `syncHoldings(userId, connectionId)`:
    - Decrypt API secret using `decryptSecret()`
    - Fetch balances via `BinanceService.fetchBalances()`
    - For each balance: upsert `Asset` (symbol, name from CCXT markets, `asset_class: 'crypto'`)
    - Create "SYNC" type transaction in user's portfolio (quantity = current balance)
  - [x] Handle portfolio selection: use user's first portfolio or create "Binance Sync" portfolio

- [x] **Task 5: Create/Update API Endpoints (AC: 2,3,6,7)**
  - [x] Verify existing endpoints in `services/api/src/crypto/connections.controller.ts`
  - [x] Ensure `POST /api/v1/connections` calls real validation + initial sync
  - [x] Add sync results to response: `{ success, data: ConnectionDto, meta: { assetsSync: number } }`
  - [x] Ensure envelope pattern: `{ success: boolean, data, error, meta }`

- [x] **Task 6: Frontend BinanceConnectionForm (AC: 2,7)**
  - [x] Create `apps/web/src/features/connections/components/binance-connection-form.tsx`
  - [x] Use existing `CreateConnectionDto` from `@workspace/shared-types/api`
  - [x] Zod validation matching backend DTO
  - [x] States: idle → validating (spinner) → success (toast + redirect) / error (toast)
  - [x] Show synced balance preview before final confirm (optional enhancement)

- [x] **Task 7: Add Connections Page Route (AC: 1)**
  - [x] Create `apps/web/src/app/connections/page.tsx` (basic, Story 5.3 will enhance)
  - [x] Import existing `ConnectionDto` for type safety
  - [x] List existing connections with status badges
  - [x] "Add Binance" button → opens form modal/drawer

- [x] **Task 8: Error Handling & Resilience (AC: 3)**
  - [x] Implement exponential backoff wrapper for CCXT calls (check if exists in `common/`)
  - [x] Return "Calm" error responses: user-friendly messages, no stack traces
  - [x] Log errors to console with context (userId, exchange, error code)

## Dev Notes

### Existing Infrastructure (DO NOT RECREATE)

- **DTOs**: `@workspace/shared-types/api/connection.dto.ts` - `CreateConnectionDto`, `ConnectionDto`, `ValidationResultDto`
- **Enums**: `ExchangeId.binance`, `ConnectionStatus` from `@workspace/shared-types/database`
- **DB Table**: `user_connections` with `api_secret_encrypted` field
- **Service**: `services/api/src/crypto/connections.service.ts` - needs encryption fix
- **Crypto Utils**: `services/api/src/crypto/crypto.utils.ts` - `encryptSecret()`, `decryptSecret()`, `maskApiKey()`

### CCXT Configuration

```typescript
const exchange = new ccxt.binance({
  apiKey,
  secret,
  enableRateLimit: true,
  timeout: 30000,
  options: { adjustForTimeDifference: true }
});
```

### Error Mapping

| CCXT Error | User Message |
|------------|--------------|
| `AuthenticationError` | "Invalid API credentials. Check your key and secret." |
| `RateLimitExceeded` | "Too many requests. Please wait a moment." |
| `NetworkError` | "Unable to connect to Binance. Check your network." |
| `ExchangeNotAvailable` | "Binance is temporarily unavailable." |

### Security Requirements

- API secrets encrypted via AES-256-GCM before storage
- Secrets NEVER returned in API responses (use `maskApiKey()`)
- RLS enforces `user_id` filtering on `user_connections` table

### Project Structure

```
services/api/src/crypto/
├── binance.service.ts        # NEW: CCXT wrapper
├── binance-sync.service.ts   # NEW: Sync orchestration
├── connections.service.ts    # MODIFY: Fix encryption
├── connections.controller.ts # EXISTS: Verify endpoints
├── crypto.utils.ts           # EXISTS: Encryption helpers
└── crypto.module.ts          # MODIFY: Register new services

apps/web/src/features/connections/
├── components/
│   └── binance-connection-form.tsx  # NEW
├── hooks/
│   └── use-connections.ts           # NEW: TanStack Query
└── index.ts                         # NEW: Feature exports

apps/web/src/app/connections/
└── page.tsx                         # NEW: Route
```

### References

- [Architecture](file:///_bmad-output/architecture.md#Core-Architectural-Decisions): CCXT 4.5.29, Supabase RLS
- [Project Context](file:///_bmad-output/project-context.md#Critical-Implementation-Rules): Financial precision, envelope pattern
- [CCXT Binance Docs](https://docs.ccxt.com/#/exchanges/binance)
- [Existing Service](file:///services/api/src/crypto/connections.service.ts): Line 54 needs encryption fix

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

- [x] Binance API keys validated via real CCXT calls.
- [x] Spot balances fetched and synced to user assets.
- [x] Dust filtered (< $1).
- [x] Transactions automatically created to reflect balances.
- [x] Frontend form integrated and connected to backend.

### File List

- `services/api/src/crypto/binance.service.ts`
- `services/api/src/crypto/binance-sync.service.ts`
- `services/api/src/crypto/connections.service.ts` (Modified)
- `apps/web/src/features/connections/components/binance-connection-form.tsx`
- `apps/web/src/app/(protected)/connections/page.tsx`
