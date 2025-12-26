# Fin-Sight Development Guide

> Portfolio intelligence platform with Vietnamese stock analytics - Now powered by Turborepo + NestJS

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Generate Supabase types (after linking project)
pnpm db:types

# Start development servers (all apps)
pnpm dev

# Build all apps and packages
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint
```

---

## 📁 Monorepo Structure

```
fin-sight/
├── apps/
│   ├── web/              # React 19 + Vite frontend
│   └── api/              # NestJS backend (to be created)
│
├── packages/
│   ├── database/         # @repo/database - Supabase + ClickHouse services
│   ├── types/            # @repo/types - Shared types + Supabase generated types
│   ├── ui/               # @repo/ui - Shared React components
│   ├── utils/            # @repo/utils - Shared utilities
│   ├── typescript-config/ # @repo/typescript-config - Base tsconfigs
│   ├── eslint-config/     # @repo/eslint-config - Linting rules
│   └── vitest-config/     # @repo/vitest-config - Test config
│
├── services/
│   └── data-pipeline/    # Airflow DAGs (existing)
│
├── docs/                 # Documentation
│   ├── PRD.md            # Product requirements
│   ├── TECHNICAL.md      # Technical architecture
│   └── MIGRATION_SUMMARY.md # Migration notes
│
├── turbo.json            # Turborepo configuration
├── pnpm-workspace.yaml   # pnpm workspace config
└── package.json          # Root package.json
```

---

## 🔧 Technology Stack

### Frontend (apps/web)
- **Framework:** React 19
- **Build Tool:** Vite 6
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + Shadcn/ui
- **State:** TanStack Query 5
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Animation:** Framer Motion

### Backend (apps/api)
- **Framework:** NestJS 10
- **Language:** TypeScript 5
- **Runtime:** Node.js 20 LTS
- **Database Client:** Supabase JS 2.x + @clickhouse/client
- **Auth:** Passport.js + JWT
- **Validation:** class-validator + Zod
- **Cache:** ioredis
- **API Docs:** Swagger/OpenAPI

### Data Layer
- **PostgreSQL:** User data (Supabase client with RLS)
- **ClickHouse:** Market data & analytics
- **Redis:** Caching layer
- **Airflow:** Data pipeline (existing)

### Monorepo Tools
- **Turborepo:** Build system & caching
- **pnpm:** Fast, disk-efficient package manager
- **Prettier:** Code formatting
- **ESLint:** Linting
- **Vitest/Jest:** Testing

---

## 📦 Shared Packages

### @repo/database
Centralized database access layer.

```typescript
import { SupabaseService, ClickHouseService } from '@repo/database';

// In NestJS module
imports: [DatabaseModule]

// Use in service
constructor(private supabase: SupabaseService) {}
```

### @repo/types
Shared TypeScript types and Zod schemas.

```typescript
import { CreateTransactionDto, TransactionSchema } from '@repo/types';

// Validate with Zod
const result = TransactionSchema.parse(data);

// Use in NestJS DTO
export class CreateTransactionDto implements CreateTransactionDto {}
```

### @repo/ui
Shared React components.

```typescript
import { Button, Card, Input } from '@repo/ui';

<Button variant="primary">Add Transaction</Button>
```

### @repo/utils
Shared utility functions.

```typescript
import { formatCurrency, calculateReturns } from '@repo/utils';

const display = formatCurrency(1234.56, 'VND');
const returns = calculateReturns(currentValue, costBasis);
```

---

## 🏗️ Development Workflow

### Creating a New Feature

1. **Create shared types** (if needed)
   ```bash
   cd packages/types
   # Add types to src/dtos/ or src/entities/
   ```

2. **Update database schema** (if needed)
   ```bash
   # Update schema via Supabase Dashboard SQL Editor
   # Or create migration file locally
   
   # After schema changes, regenerate types
   pnpm db:types
   ```

3. **Implement backend API** (NestJS)
   ```bash
   cd apps/api
   nest g module features/my-feature
   nest g service features/my-feature
   nest g controller features/my-feature
   ```

4. **Implement frontend** (React)
   ```bash
   cd apps/web
   # Create components in src/components/
   # Add API hooks in src/hooks/
   ```

5. **Run and test**
   ```bash
   # From root
   pnpm dev
   pnpm test
   ```

### Working with Databases

#### Supabase Workflow
```bash
# Link to Supabase project (first time setup)
supabase link --project-ref your-project-ref

# Pull database schema
supabase db pull

# Generate TypeScript types from database schema
pnpm db:types
# or directly:
supabase gen types typescript --linked > packages/types/src/supabase.ts

# Apply migrations (managed via Supabase Dashboard or CLI)
supabase db push

# Open Supabase Studio (web UI for database)
# Visit: https://app.supabase.com/project/your-project/editor

# Local development with Supabase
supabase start  # Start local Supabase stack
supabase stop   # Stop local Supabase
```

#### ClickHouse
```bash
# Access ClickHouse CLI
docker compose exec clickhouse-server clickhouse-client

# Query example
SELECT * FROM market_dwh.fact_stock_daily LIMIT 10;
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific package tests
pnpm --filter @repo/utils test
```

### Linting & Formatting

```bash
# Lint all packages
pnpm lint

# Format code
pnpm format

# Fix lint issues
pnpm lint:fix
```

---

## 🔒 Environment Variables

Create `.env` files in each app:

### apps/api/.env
```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/finsight"

# ClickHouse
CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=8123
CLICKHOUSE_DATABASE=market_dwh

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Authentication
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_ANON_KEY=your-anon-key

# Application
NODE_ENV=development
PORT=3001
```

### apps/web/.env
```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🚢 Deployment

### Build for Production

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter web build
pnpm --filter api build
```

### Docker

```bash
# Build all containers
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f api
```

---

## 📚 Documentation

- **PRD:** [docs/PRD.md](docs/PRD.md) - Product requirements and features
- **Technical:** [docs/TECHNICAL.md](docs/TECHNICAL.md) - Architecture and implementation
- **Migration:** [docs/MIGRATION_SUMMARY.md](docs/MIGRATION_SUMMARY.md) - FastAPI → NestJS notes

---

## 🤝 Contributing

1. Create feature branch from `main`
2. Make changes
3. Run tests: `pnpm test`
4. Lint code: `pnpm lint`
5. Commit with conventional commits
6. Create pull request

### Commit Convention

```
feat: add transaction filtering
fix: resolve portfolio calculation bug
docs: update API documentation
chore: update dependencies
test: add unit tests for portfolio service
```

---

## 🔍 Troubleshooting

### Port Already in Use

```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>
```

### Supabase Types Out of Sync

```bash
# Regenerate types from current database schema
pnpm db:types
# or
supabase gen types typescript --linked > packages/types/src/supabase.ts
```

### Turborepo Cache Issues

```bash
# Clear Turborepo cache
pnpm clean
rm -rf node_modules
pnpm install
```

### TypeScript Errors After Update

```bash
# Rebuild all packages
pnpm build

# Clean and reinstall
pnpm clean
pnpm install
```

---

## 📞 Support

- **Technical Issues:** Create GitHub issue
- **Documentation:** Check [docs/](docs/)
- **Architecture Questions:** See [TECHNICAL.md](docs/TECHNICAL.md)
