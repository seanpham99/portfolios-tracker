# Fin-Sight Project Documentation

**Generated:** December 26, 2025  
**Project:** fin-sight  
**Type:** Monorepo (Turborepo + pnpm)  
**Status:** Active Development - Brownfield Enhancement

---

## Executive Summary

**Fin-Sight** is a full-stack portfolio intelligence platform combining institutional-grade market data analytics with a modern web interface. The system consists of two primary components:

1. **Data Pipeline** (Apache Airflow + ClickHouse) - Production-ready ETL system processing Vietnamese stock market data
2. **Web Application** (React 19 + Vite) - Modern portfolio tracking UI with real-time analytics

The platform enables individual investors and investment teams to track multi-asset portfolios (stocks, crypto, commodities) with technical indicators (RSI, MACD, MA) in a minimalist "spatial UI" design.

---

## Project Structure

### Monorepo Organization

```
fin-sight/
├── apps/
│   └── web/                    # React 19 + Vite + React Router v7
│       ├── src/
│       │   ├── components/     # UI components (stage-slider, asset-blade, modals)
│       │   ├── routes/         # React Router file-based routing
│       │   ├── stores/         # Zustand state management
│       │   ├── lib/            # Utilities (auth, Supabase client)
│       │   └── providers/      # Context providers (theme, auth)
│       ├── package.json
│       └── vite.config.ts
│
├── services/
│   └── data-pipeline/          # Apache Airflow 3.1.3 + ClickHouse
│       ├── dags/               # ETL workflows
│       │   ├── market_data_evening_batch.py
│       │   ├── market_news_morning.py
│       │   └── etl_modules/    # Shared fetcher & notification modules
│       ├── sql/                # ClickHouse schema definitions
│       ├── tests/              # Pytest suite (87% coverage)
│       ├── docker-compose.yaml # Multi-service orchestration
│       └── requirements.txt
│
├── packages/                   # Shared workspace packages
│   ├── ui/                     # Shared React components (@repo/ui)
│   ├── typescript-config/      # Shared TSConfig (@repo/typescript-config)
│   └── eslint-config/          # Shared ESLint rules (@repo/eslint-config)
│
├── supabase/                   # Supabase configuration (auth, database)
├── turbo.json                  # Turborepo pipeline configuration
├── pnpm-workspace.yaml         # pnpm workspace definition
└── package.json                # Root package.json
```

### Repository Type: **MONOREPO**

**Workspace Manager:** Turborepo 2.7.2 + pnpm 10.26.2  
**Node.js Version:** ≥20.0.0 (LTS)  
**Package Manager:** pnpm (enforced via packageManager field)

---

## Parts Classification

### Part 1: Web Application (apps/web)

**Project Type:** `web`  
**Framework:** React 19.2.3 + Vite 7.3.0  
**Language:** TypeScript 5.9.3  
**Routing:** React Router 7.11.0 (file-based)  
**State Management:** Zustand (via custom portfolio-store)  
**UI Library:** Radix UI + Tailwind CSS 4.1.18  
**Animation:** Framer Motion 12.23.26  
**Charts:** Recharts 2.15.4  
**Authentication:** Supabase Auth (@supabase/supabase-js 2.89.0)

**Purpose:** User-facing portfolio tracking interface with spatial UI design (stage slider navigation), real-time market data visualization, and transaction management.

**Key Features:**

- Horizontal stage-based navigation (Global Equities / Crypto / Commodities)
- Real-time asset cards with sparkline charts
- Focus modal for detailed asset analysis
- Transaction history and manual entry
- Analytics overlay with AI insights
- Dark theme with glassmorphism design

---

### Part 2: Data Pipeline (services/data-pipeline)

**Project Type:** `data`  
**Orchestration:** Apache Airflow 3.1.3 (CeleryExecutor)  
**Data Warehouse:** ClickHouse (latest)  
**Metadata DB:** PostgreSQL 16  
**Language:** Python 3.12  
**Key Libraries:**

- vnstock (Vietnamese stock data)
- yfinance (global equities)
- pandas 2.x + pandas_ta 0.4.71 (technical analysis)
- clickhouse-connect (database driver)

**Purpose:** Automated ETL pipelines for fetching, processing, and storing market data with technical indicator calculation.

**DAGs:**

1. **market_data_evening_batch** - Daily EOD price ingestion (6 PM UTC+7, Mon-Fri)
   - Fetches stock prices for VN market (HPG, VCB, VNM, FPT, MWG, VIC)
   - Calculates technical indicators (MA50, MA200, RSI-14, MACD)
   - Loads financial ratios, dividends, income statements
2. **market_news_morning** - Morning news aggregation and AI summarization
   - Fetches latest market news
   - Uses Gemini API for intelligent summarization
   - Sends Telegram notifications

**Infrastructure:**

- 7 Docker containers (Airflow webserver, scheduler, worker, flower, Redis, PostgreSQL, ClickHouse)
- CeleryExecutor for distributed task execution
- Redis as message broker
- ClickHouse ReplacingMergeTree for deduplication

---

## Technology Stack Summary

### Frontend (apps/web)

| Category   | Technology    | Version  | Purpose                                         |
| ---------- | ------------- | -------- | ----------------------------------------------- |
| Framework  | React         | 19.2.3   | UI library with latest features (useOptimistic) |
| Build Tool | Vite          | 7.3.0    | Fast dev server, HMR, ESM-native                |
| Router     | React Router  | 7.11.0   | File-based routing, loaders, actions            |
| Language   | TypeScript    | 5.9.3    | Type safety, better DX                          |
| Styling    | Tailwind CSS  | 4.1.18   | Utility-first, JIT compilation                  |
| Components | Radix UI      | Various  | Accessible primitives (dialog, select, etc.)    |
| Animation  | Framer Motion | 12.23.26 | 60fps animations, gesture support               |
| Charts     | Recharts      | 2.15.4   | React-native charting library                   |
| Auth       | Supabase      | 2.89.0   | OAuth, JWT, session management                  |
| Icons      | Lucide React  | 0.562.0  | Consistent icon set                             |

### Backend (services/data-pipeline)

| Category           | Technology         | Version  | Purpose                         |
| ------------------ | ------------------ | -------- | ------------------------------- |
| Orchestration      | Apache Airflow     | 3.1.3    | Workflow scheduling, monitoring |
| Executor           | CeleryExecutor     | Built-in | Distributed task execution      |
| Data Warehouse     | ClickHouse         | Latest   | OLAP database for analytics     |
| Metadata DB        | PostgreSQL         | 16       | Airflow metadata storage        |
| Cache/Broker       | Redis              | 7.2      | Celery message broker           |
| Language           | Python             | 3.12     | Data processing                 |
| Data Fetching      | vnstock, yfinance  | Latest   | Market data APIs                |
| Data Processing    | pandas             | 2.x      | DataFrame operations            |
| Technical Analysis | pandas_ta          | 0.4.71   | Indicator calculation           |
| Database Driver    | clickhouse-connect | Latest   | ClickHouse Python client        |
| Testing            | pytest             | 7.4.0    | Unit & integration tests        |
| Notifications      | Telegram Bot API   | -        | Alert delivery                  |
| AI                 | Google Gemini API  | -        | News summarization              |

### Infrastructure

| Component           | Technology     | Purpose                       |
| ------------------- | -------------- | ----------------------------- |
| Containerization    | Docker         | Consistent environments       |
| Orchestration (Dev) | Docker Compose | Multi-service management      |
| Monorepo Tool       | Turborepo      | Task caching, parallelization |
| Package Manager     | pnpm           | Fast, disk-efficient          |
| Version Control     | Git            | Source control                |
| Authentication      | Supabase       | OAuth providers, JWT          |

---

## Architecture Patterns

### Web Application Architecture

**Pattern:** Component-Based Architecture with File-Based Routing

```
User Request → React Router (file-based routes)
    ↓
Route Loader (data fetching, auth check)
    ↓
Page Component (renders UI)
    ↓
Zustand Store (global state management)
    ↓
Supabase Client (API calls, auth)
```

**Key Patterns:**

- **Route-based code splitting** - Each route is a separate bundle
- **Protected routes** - Auth middleware in route loaders
- **Optimistic UI** - Immediate feedback before server response
- **Client-side state** - Zustand for portfolio state, Supabase for server state

**State Management Strategy:**

- **Local state** - React useState for component-specific state
- **Global state** - Zustand portfolio-store for stages, assets, transactions
- **Server state** - Supabase client for database queries (future integration)
- **Form state** - React Hook Form (not yet implemented)

---

### Data Pipeline Architecture

**Pattern:** Event-Driven ETL with Time-Based Scheduling

```
Airflow Scheduler (cron expressions)
    ↓
Task Execution (CeleryExecutor distributes to workers)
    ↓
Extract Phase (vnstock API → pandas DataFrame)
    ↓
Transform Phase (calculate indicators with pandas_ta)
    ↓
Load Phase (ClickHouse batch insert)
    ↓
Notification (Telegram on success/failure)
```

**Key Patterns:**

- **Idempotent pipelines** - ReplacingMergeTree ensures deduplication
- **Incremental loads** - Fetch 250 days for indicators, insert last 7 days
- **Task groups** - Logical separation (prices, ratios, dividends, news)
- **Retry logic** - 2 retries with 2-minute delay on failure
- **Observability** - Airflow UI for monitoring, Telegram for alerts

**Data Flow:**

1. **Evening Batch (6 PM)** - EOD prices + financials → ClickHouse
2. **Morning Brief (7 AM)** - News aggregation + AI summary → Telegram
3. **On-Demand** - Web app queries ClickHouse for real-time data (future)

---

## Integration Points

### Current Integration

**Status:** Parts are currently **ISOLATED**

- Web app uses **mock data** (portfolio-store.ts generates static sparklines)
- Data pipeline writes to **ClickHouse** but web app doesn't query it yet

### Planned Integration (Based on Archived PRD/TECHNICAL docs)

**API Gateway Layer (NestJS)** - To be built

```
Web App (React) → REST API (NestJS) → PostgreSQL (user data)
                                    → ClickHouse (market data)
                                    → Redis (caching)
```

**Integration Requirements:**

1. **Authentication** - Supabase Auth already in web app, needs backend validation
2. **User Transactions** - Web app → PostgreSQL (user portfolios, transactions)
3. **Market Data** - Web app → ClickHouse (prices, indicators via API)
4. **Real-time Updates** - WebSocket or polling for price updates
5. **Holdings Calculation** - Aggregate transactions + latest prices

---

## Development Setup

### Prerequisites

```bash
# Required
node >= 20.0.0
pnpm >= 10.0.0
docker >= 24.0
docker-compose >= 2.0
python >= 3.12 (for data pipeline)

# Optional
supabase CLI (for auth/database management)
```

### Quick Start

```bash
# Clone repository
git clone <repo-url>
cd fin-sight

# Install dependencies (all workspaces)
pnpm install

# Start web app (dev mode)
pnpm dev --filter @repo/web

# Start data pipeline
cd services/data-pipeline
docker-compose up -d

# Run tests
pnpm test  # All workspaces
cd services/data-pipeline && pytest  # Data pipeline only
```

### Environment Variables

**Web App (.env in apps/web/):**

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Data Pipeline (.env in services/data-pipeline/):**

```bash
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-chat-id
GEMINI_API_KEY=your-gemini-api-key
CLICKHOUSE_HOST=clickhouse-server
CLICKHOUSE_PORT=8123
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=
```

---

## Testing Strategy

### Web App Testing

**Status:** Not yet implemented  
**Planned Tools:** Vitest, React Testing Library

### Data Pipeline Testing

**Status:** Implemented with 87% coverage  
**Framework:** pytest 7.4.0

**Test Structure:**

```
tests/
├── unit/
│   ├── test_fetcher.py       # ETL data fetching tests
│   └── test_notifications.py # Telegram/Gemini notification tests
├── integration/
│   └── (planned)
├── fixtures/
│   └── sample_data.json      # Mock stock data
└── mocks/
    ├── vnstock_mock.py       # Mock vnstock API
    └── api_responses.py      # Mock API responses
```

**Running Tests:**

```bash
cd services/data-pipeline
pytest                        # All tests
pytest --cov                  # With coverage report
pytest -k test_fetcher        # Specific test file
```

---

## Deployment

### Web App Deployment

**Status:** Not configured  
**Target:** Vercel / Netlify (static hosting)

**Build:**

```bash
pnpm build --filter @repo/web
# Output: apps/web/dist/
```

### Data Pipeline Deployment

**Status:** Docker Compose (development)  
**Target:** Kubernetes (production-ready)

**Current Setup:**

```bash
cd services/data-pipeline
docker-compose up -d
# Services: airflow-webserver, airflow-scheduler, airflow-worker,
#           postgres, clickhouse, redis, flower
```

**Access Points:**

- Airflow UI: http://localhost:8080 (admin/admin)
- ClickHouse: http://localhost:8123 (SQL queries)
- Flower (Celery monitoring): http://localhost:5555

---

## Future Roadmap (Based on Archived Docs)

### Phase 1: API Layer (Next Priority)

- [ ] Build NestJS API gateway
- [ ] Implement PostgreSQL schema for user data (portfolios, transactions)
- [ ] Connect web app to real market data from ClickHouse
- [ ] Add Redis caching layer

### Phase 2: Enhanced Features

- [ ] Real-time price updates (WebSocket)
- [ ] Collaborative portfolios (team features)
- [ ] AI insights integration (Gemini API)
- [ ] Multi-currency support (USD, VND, EUR)

### Phase 3: Global Markets

- [ ] US stocks support (yfinance integration)
- [ ] Cryptocurrency tracking (CoinGecko API)
- [ ] Commodities (gold, silver, oil)
- [ ] Exchange rate conversion

### Phase 4: Enterprise Features

- [ ] Role-based access control (RBAC)
- [ ] Audit logging
- [ ] Data export (CSV, PDF reports)
- [ ] Mobile app (React Native)

---

## Key Files Reference

### Web App

- **Entry Point:** `apps/web/src/main.tsx`
- **Routes:** `apps/web/src/routes/` (file-based routing)
- **State:** `apps/web/src/stores/portfolio-store.ts`
- **Auth:** `apps/web/src/lib/auth.ts`
- **Config:** `apps/web/vite.config.ts`, `apps/web/tailwind.config.ts`

### Data Pipeline

- **DAGs:** `services/data-pipeline/dags/market_data_evening_batch.py`
- **Modules:** `services/data-pipeline/dags/etl_modules/fetcher.py`
- **Schema:** `services/data-pipeline/sql/init_schema.sql`
- **Config:** `services/data-pipeline/docker-compose.yaml`
- **Tests:** `services/data-pipeline/tests/unit/`

### Monorepo

- **Turborepo Config:** `turbo.json`
- **Workspace Config:** `pnpm-workspace.yaml`
- **Root Package:** `package.json`

---

## Contact & Resources

**Documentation:**

- Project README: [README.MD](../README.MD)
- Web App README: [apps/web/README.md](../apps/web/README.md)
- Data Pipeline Tests: [services/data-pipeline/tests/README.md](../services/data-pipeline/tests/README.md)

**Archived Specifications:**

- Product Requirements: `_bmad-output/archive/2025-12-26/PRD.md`
- Technical Documentation: `_bmad-output/archive/2025-12-26/TECHNICAL.md`

**External Resources:**

- Apache Airflow: https://airflow.apache.org/
- ClickHouse: https://clickhouse.com/docs
- React 19: https://react.dev/
- Supabase: https://supabase.com/docs
- Turborepo: https://turbo.build/repo/docs

---

_This documentation was automatically generated by the BMAD document-project workflow on December 26, 2025._
