# API Service Architecture

**Part:** `services/api`
**Type:** Backend Service
**Generated:** 2026-01-27

## Technology Stack

| Category         | Technology            | Justification                           |
| :--------------- | :-------------------- | :-------------------------------------- |
| **Framework**    | NestJS 11             | Modular, Dependency Injection, Scalable |
| **Language**     | TypeScript            | Strict type safety shared with frontend |
| **Database ORM** | Supabase JS / Drizzle | Type-safe SQL access                    |
| **Cache**        | Upstash Redis         | Low-latency market data storage         |
| **Market Data**  | CCXT, Yahoo Finance   | Crypto and Stock data aggregation       |

## Architecture Pattern

**Modular Monolith**
Organized by Domain Modules (`PortfoliosModule`, `AssetsModule`) enforcing boundaries.

- **Controllers**: Handle HTTP requests/responses.
- **Services**: Contain business logic.
- **Repositories**: (Optional) Abstract data access, primarily using Supabase JS directly for simplicity in this phase.

**Security Architecture**

- **Authentication**: Supabase Auth (JWT).
- **Authorization**: Guards (`AuthGuard`, `ApiKeyGuard`) + RLS (Row Level Security) at the database layer.
- **Internal Security**: `ApiKeyGuard` protects batch endpoints triggered by Airflow.

## Data Architecture

- **Transactional**: PostgreSQL (Users, Portfolios, Transactions).
- **Analytical**: ClickHouse (Historical Snapshots, OHLCV).
- **Hot Data**: Redis (Current Prices, Session Cache).

## API Design

- **Protocol**: REST (JSON).
- **Standard Envelope**: `ApiResponse<T>` with mandatory `meta` field for staleness/source info.
- **Documentation**: Swagger/OpenAPI (auto-generated from DTOs).
- **Versioning**: URI-based (`/api/v1/`).

## Key Workflows

- **Market Data Sync**: "Lazy Load" strategy. Fetches data only when requested, then caches in Redis.
- **Portfolio Calculation**: Aggregates holdings on-the-fly using cached prices.
- **Batch Snapshots**: Endpoint `POST /portfolios/snapshots/batch` triggered by Airflow.
