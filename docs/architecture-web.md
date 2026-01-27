# Web Frontend Architecture

**Part:** `apps/web`
**Type:** Web Application
**Generated:** 2026-01-27

## Technology Stack

| Category           | Technology              | Justification                                  |
| :----------------- | :---------------------- | :--------------------------------------------- |
| **Framework**      | Next.js 16 (App Router) | Server Components, SEO, Performance            |
| **Library**        | React 19                | Latest concurrent features                     |
| **Styling**        | Tailwind CSS 4          | Utility-first, Design System token integration |
| **Components**     | Radix UI / Shadcn UI    | Accessible, headless primitives                |
| **State (Server)** | TanStack Query 5        | Caching, Deduping, Optimistic Updates          |
| **State (Client)** | Zustand                 | Lightweight global session state               |
| **Charts**         | Recharts                | Composable visualization                       |

## Architecture Pattern

**Feature-Based Architecture**
The application is structured by business domain (Features) rather than technical layer.

- `src/features/<feature-name>/`: Contains all components, hooks, and utils specific to that feature.
- `src/app/`: Thin routing layer that composes feature components.
- `src/lib/`: Shared, stateless utilities.

**"Calm" UX Principles**

- **Staleness Banners**: UI never blocks on stale data (if < 5 mins old). Instead, amber badges indicate data age.
- **Graceful Degradation**: Partial API failures do not crash the page. Skeletons are preferred over full-screen spinners.

## Component Overview

- **Dashboard**: Aggregates portfolio performance. Handles multi-currency display.
- **Portfolio Details**: Deep dive into specific holdings, supporting unified view of Stocks, Crypto, and Cash.
- **Asset Search**: Cross-provider search interface (vnstock, yfinance, coingecko).
- **Transaction Form**: Complex form for manual entry with "Fast Entry" patterns.

## Data Integration

- **API Communication**: All requests go to `services/api` via a typed `api-client`.
- **Response Envelope**: Expects `ApiResponse<T>`: `{ success, data, error, meta }`.
- **Metadata Handling**: specifically consumes `meta.staleness` to drive UI badges.

## Development Workflow

- **Testing**: Vitest + React Testing Library (Unit/Component). Playwright (E2E).
- **Validation**: Zod schemas mirroring backend DTOs.
- **Rules**: ESM imports required. No float math for display logic.
