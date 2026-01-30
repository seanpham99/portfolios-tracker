# Story 5.2: OKX API Sync (Read-Only)

Status: done

## Story

As a user,
I want to connect my OKX account via API keys (including Passphrase),
so that my holdings are automatically synchronized and I can manage my crypto portfolio in one place.

## Acceptance Criteria

1. **Given** the Connections page.
2. **When** I select "OKX" from the provider list.
3. **Then** the form displays fields for **API Key**, **Secret Key**, and **Passphrase** (OKX requirement).
4. **When** I enter valid credentials.
5. **Then** the system validates them via CCXT (real call to `fetchBalance`).
6. **Then** the system stores the credentials securely (Secret and Passphrase encrypted).
7. **Then** the system synchronizes current Spot balances, filtering dust.
8. **Then** the system handles the specific OKX authentication flows (Passphrase is required).

## Tasks / Subtasks

- [x] **Task 1: Database Migration (AC: 6)**
  - [x] Create migration `20260130000000_add_passphrase_to_connections.sql`
  - [x] Add `passphrase_encrypted` (TEXT, nullable) to `user_connections` table
  - [x] Update `UserConnections` type in `@workspace/shared-types/database`

- [x] **Task 2: Refactor for Extensibility (Architectural Requirement)**
  - [x] Define `ExchangeProvider` interface/abstract class in `services/api/src/crypto/interfaces/`
    - Methods: `validateKeys()`, `fetchBalances()`, `getName()`
  - [x] Create `ExchangeRegistry` service to manage providers
  - [x] Refactor `BinanceService` to implement `ExchangeProvider`
  - [x] Refactor `ConnectionsService` to use `ExchangeRegistry` instead of hardcoded `BinanceService`

- [x] **Task 3: Implement OKX Service (AC: 5, 7, 8)**
  - [x] Create `services/api/src/crypto/okx.service.ts` implementing `ExchangeProvider`
  - [x] Configure CCXT `okx` with `password` (passphrase) param
  - [x] Implement `fetchBalances` with OKX-specific response mapping (if different from generic CCXT)
  - [x] Register `OkxService` in `ExchangeRegistry`

- [x] **Task 4: Unified Sync Logic (AC: 7)**
  - [x] Refactor `BinanceSyncService` into a generic `ExchangeSyncService` or Strategy
  - [x] Update `ConnectionsService.sync()` to dispatch to the correct sync handler
  - [x] Ensure `OkxService` balances specific 'trading' vs 'funding' accounts if needed (focus on 'spot'/'funding' aggregated for MVP)

- [x] **Task 5: Update DTOs & Connection Logic (AC: 3, 6)**
  - [x] Update `CreateConnectionDto` in `@workspace/shared-types/api` to add optional `passphrase`
  - [x] Update `ConnectionsService.create()` to encrypt and store passphrase
  - [x] Update `crypto.utils.ts` if any new encryption helpers are needed (likely reuse `encryptSecret`)

- [x] **Task 6: Frontend Dynamic Form (AC: 1, 2, 3)**
  - [x] Refactor `binance-connection-form.tsx` into a generic `ConnectionForm` or `AddConnectionModal`
  - [x] Configurable fields based on selected Exchange (OKX requires Passphrase)
  - [x] Update `useConnections` hook to pass the passphrase

- [x] **Task 7: Integration Tests**
  - [x] Test OKX validation flow (mocked CCXT)
  - [x] Test Passphrase encryption/decryption round-trip

## Dev Notes

### Architectural Goal: Extensibility

Refactoring to an `ExchangeProvider` pattern is CRITICAL here to satisfy the requirement of "easy to integrate other wallets/exchanges".

- **Interface**: `services/api/src/crypto/interfaces/exchange-provider.interface.ts`
- **Registry**: `services/api/src/crypto/exchange.registry.ts`

### OKX Specifics

- OKX API v5 uses "Passphrase" for authentication. CCXT expects this in the `password` property of the config object.
- **CCXT Config**:

  ```typescript
  new ccxt.okx({
    apiKey: '...',
    secret: '...',
    password: '...', // This is the passphrase
  })
  ```

### Database Schema Update

```sql
ALTER TABLE user_connections
ADD COLUMN passphrase_encrypted TEXT;

COMMENT ON COLUMN user_connections.passphrase_encrypted IS 'Encrypted Passphrase for exchanges like OKX';
```

### References

- [CCXT OKX Manual](https://docs.ccxt.com/#/exchanges/okx)
- [Project Architecture](file:///_bmad-output/architecture.md)

## Dev Agent Record

### Implementation Notes (2026-01-30)

- Implemented `ExchangeProvider` interface and `ExchangeRegistry` for extensibility.
- Refactored `BinanceService` to implement `ExchangeProvider`.
- Created `OkxService` using CCXT with passphrase support.
- Refactored `BinanceSyncService` into generic `ExchangeSyncService`.
- Updated database schema to support encrypted passphrase.
- Updated `ConnectionsService` to use registry and support passphrase encryption.
- Refactored Frontend `BinanceConnectionForm` to generic `ConnectionForm` with OKX support.
- Added comprehensive unit tests for `OkxService`.

### File List

- `supabase/migrations/20260130000000_add_passphrase_to_connections.sql`
- `packages/shared-types/src/database/supabase-types.ts`
- `packages/shared-types/src/api/connection.dto.ts`
- `services/api/src/crypto/interfaces/exchange-provider.interface.ts`
- `services/api/src/crypto/exchange.registry.ts`
- `services/api/src/crypto/binance.service.ts`
- `services/api/src/crypto/okx.service.ts`
- `services/api/src/crypto/exchange-sync.service.ts`
- `services/api/src/crypto/exchange-sync.service.spec.ts`
- `services/api/src/crypto/connections.service.ts`
- `services/api/src/crypto/connections.controller.ts`
- `services/api/src/crypto/connections.module.ts`
- `services/api/src/crypto/okx.service.spec.ts`
- `services/api/src/crypto/crypto.utils.spec.ts`
- `apps/web/src/features/connections/components/connection-form.tsx`
- `apps/web/src/features/connections/index.ts`
- `apps/web/src/app/(protected)/connections/page.tsx`

---

## Senior Developer Review (AI)

**Reviewer:** Antigravity Code Review  
**Date:** 2026-01-30

### Issues Found & Fixed

#### 🔴 HIGH (3 fixed)

1. **ConnectionCard hardcoded "B" icon** → Fixed: Added `EXCHANGE_CONFIG` map with dynamic letter/color per exchange
2. **"Add Binance" button text** → Fixed: Changed to "Add Connection"
3. **Empty state copy only mentions Binance** → Fixed: Updated to "Binance or OKX"

#### 🟡 MEDIUM (5 fixed)

1. **`any` cast in ExchangeSyncService** → Fixed: Removed cast, passphrase already properly typed
2. **`any` casts in toDto method** → Fixed: Used proper type assertion with nullish coalescing
3. **OKX icon missing** → Note: Uses letter fallback "O" with blue color
4. **Missing ExchangeSyncService tests** → Fixed: Created `exchange-sync.service.spec.ts`
5. **Git discrepancies** → Fixed: Updated File List in story

#### 🟢 LOW (3 fixed)

1. **Unused passphrase in BinanceService** → Fixed: Added JSDoc + eslint-disable comment
2. **OKX account types** → Fixed: Added comprehensive JSDoc explaining MVP decisions
3. **Assets without USDT pairs** → Fixed: Improved comment with future enhancement notes

### Verdict: ✅ APPROVED

All HIGH and MEDIUM issues have been addressed. Story is ready for production.
