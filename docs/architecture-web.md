# Web Application Architecture

**Part:** apps/web  
**Type:** React 19 Single Page Application (SPA)  
**Generated:** December 26, 2025

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [Application Structure](#application-structure)
4. [Component Architecture](#component-architecture)
5. [State Management](#state-management)
6. [Routing Strategy](#routing-strategy)
7. [Authentication & Authorization](#authentication--authorization)
8. [Data Flow Patterns](#data-flow-patterns)
9. [UI/UX Design System](#uiux-design-system)
10. [Performance Optimization](#performance-optimization)
11. [Development Workflow](#development-workflow)

---

## 1. Executive Summary

The Web Application is a modern React 19 SPA built with Vite, featuring a unique **Spatial UI** design pattern for portfolio visualization. The application provides real-time portfolio tracking across multiple asset classes (equities, crypto, commodities) with technical indicators and AI-powered insights.

**Key Characteristics:**

- **Framework:** React 19.2.3 with latest features (useOptimistic, Actions)
- **Build Tool:** Vite 7.3.0 for fast development and optimized production builds
- **Routing:** React Router 7.11.0 with file-based routing
- **State:** Zustand for global state, local React state for component-specific data
- **Styling:** Tailwind CSS 4.1.18 with utility-first approach
- **Components:** Radix UI primitives for accessibility
- **Animation:** Framer Motion 12.23.26 for 60fps animations
- **Authentication:** Supabase Auth with JWT tokens

**Current Status:** Mock data implementation (portfolio-store.ts), awaiting API integration.

---

## 2. Technology Stack

### Core Framework

```json
{
  "react": "^19.2.3",
  "react-dom": "^19.2.3",
  "react-router": "^7.11.0",
  "typescript": "~5.9.3"
}
```

**React 19 Features Used:**

- `useOptimistic` - Instant UI feedback for transactions
- `useTransition` - Non-blocking state updates
- Server Actions pattern - Simplified data mutations
- Improved Suspense - Better loading states

### Build & Development

```json
{
  "vite": "^7.3.0",
  "@vitejs/plugin-react-swc": "^4.2.2",
  "vite-tsconfig-paths": "^6.0.3"
}
```

**Vite Benefits:**

- Sub-100ms HMR (Hot Module Replacement)
- Native ESM support (no bundling in dev)
- Optimized production builds with Rollup
- SWC for faster TypeScript compilation

### UI & Styling

```json
{
  "tailwindcss": "^4.1.18",
  "@tailwindcss/vite": "^4.1.18",
  "class-variance-authority": "^0.7.1",
  "framer-motion": "^12.23.26",
  "lucide-react": "^0.562.0"
}
```

**Radix UI Components:**

- Dialog, Popover, Select, Accordion, Progress, Slider
- Accessible by default (ARIA compliant)
- Unstyled (full control over appearance)

### Data & State

```json
{
  "@supabase/supabase-js": "^2.89.0",
  "@supabase/ssr": "^0.8.0",
  "date-fns": "^4.1.0",
  "recharts": "^2.15.4"
}
```

**State Management:**

- **Zustand** (via custom portfolio-store) - Global state
- React's built-in hooks - Local state
- Supabase client - Server state (future)

---

## 3. Application Structure

### Directory Layout

```
apps/web/
├── public/                     # Static assets
├── src/
│   ├── components/             # UI components
│   │   ├── add-asset-modal.tsx
│   │   ├── analytics-overlay.tsx
│   │   ├── asset-blade.tsx         # Individual asset card
│   │   ├── button.tsx              # Custom button component
│   │   ├── focus-modal.tsx         # Detailed asset view
│   │   ├── glass-card.tsx          # Glassmorphism card
│   │   ├── live-indicator.tsx      # Real-time status indicator
│   │   ├── notification-center.tsx # Notification dropdown
│   │   ├── sparkline.tsx           # Mini chart component
│   │   ├── stage-slider.tsx        # Main spatial UI component
│   │   ├── theme-provider.tsx      # Dark/light theme context
│   │   ├── transaction-history.tsx
│   │   └── transaction-modal.tsx
│   │
│   ├── routes/                     # File-based routing
│   │   ├── $.tsx                   # 404 catch-all
│   │   ├── _auth.tsx               # Auth layout wrapper
│   │   ├── _auth.login.tsx
│   │   ├── _auth.sign-up.tsx
│   │   ├── _auth.forgot-password.tsx
│   │   ├── _protected.tsx          # Protected route wrapper
│   │   ├── _protected._layout.tsx  # App layout with sidebar
│   │   ├── _protected._layout._index.tsx  # Dashboard (stage slider)
│   │   ├── _protected._layout.stages.$stageId.tsx  # Stage detail view
│   │   ├── _protected._layout.analytics.tsx
│   │   ├── _protected._layout.history.tsx
│   │   ├── _protected._layout.settings.tsx
│   │   ├── auth.confirm.tsx        # Email confirmation
│   │   └── logout.tsx
│   │
│   ├── stores/                     # Global state management
│   │   └── portfolio-store.ts      # Zustand store (525 lines)
│   │
│   ├── lib/                        # Utilities & helpers
│   │   ├── auth.ts                 # Auth helpers (requireAuth, getUser)
│   │   └── supabase/
│   │       ├── client.ts           # Browser Supabase client
│   │       └── server.ts           # Server Supabase client (SSR)
│   │
│   ├── providers/                  # React context providers
│   │   └── theme-provider.tsx
│   │
│   ├── hooks/                      # Custom React hooks
│   │   └── (future: usePortfolio, useMarketData)
│   │
│   ├── assets/                     # Images, fonts, icons
│   │
│   ├── App.tsx                     # Main app component (279 lines)
│   ├── App.css                     # Global styles
│   ├── root.tsx                    # React Router root
│   ├── routes.ts                   # Route configuration
│   └── vite-env.d.ts               # Vite type definitions
│
├── index.html                  # HTML entry point
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind configuration
├── components.json             # shadcn/ui configuration
├── eslint.config.js            # ESLint rules
├── react-router.config.ts      # React Router config
├── package.json
└── README.md
```

---

## 4. Component Architecture

### Component Hierarchy

```
App.tsx (Root)
├── Header
│   ├── Logo
│   ├── LiveIndicator
│   ├── NotificationCenter
│   ├── HistoryButton
│   ├── AnalyticsButton
│   └── SettingsButton
│
├── Portfolio Summary Section
│   ├── Total Value Display
│   ├── Change Indicator
│   └── Timeframe Selector
│
├── StageSlider (Main Content)
│   ├── Stage (Global Equities)
│   │   ├── AssetBlade[] (Asset Cards)
│   │   │   ├── Sparkline
│   │   │   ├── Value Display
│   │   │   └── Change Badge
│   │   └── Add Asset Button
│   │
│   ├── Stage (Crypto)
│   │   └── (same structure)
│   │
│   └── Stage (Commodities)
│       └── (same structure)
│
├── Modals (Conditional)
│   ├── FocusModal (Asset detail view)
│   ├── AddAssetModal (New asset form)
│   ├── TransactionModal (Buy/Sell form)
│   └── AnalyticsOverlay (AI insights)
│
└── Sidebars (Conditional)
    ├── TransactionHistory (Slide-out panel)
    └── Settings Panel
```

### Key Components

#### StageSlider

**File:** `src/components/stage-slider.tsx`

**Purpose:** Horizontal swipeable carousel for asset class navigation

**Features:**

- Drag gesture support (Framer Motion)
- Keyboard navigation (arrow keys)
- Active stage indicator
- Smooth transitions (300ms)
- Responsive layout

**State:**

- `currentIndex` - Active stage
- `stages[]` - Array of stage data

**Props:**

```typescript
interface StageSliderProps {
  stages: Stage[];
  onStageChange: (index: number) => void;
  onAddAsset: (stageId: string) => void;
}
```

#### AssetBlade

**File:** `src/components/asset-blade.tsx`

**Purpose:** Individual asset card with sparkline chart

**Features:**

- Glassmorphism design
- Hover effects (scale, glow)
- Click to open FocusModal
- Real-time value updates (future)

**Data Structure:**

```typescript
interface Asset {
  id: string;
  symbol: string;
  name: string;
  value: number;
  change: number;
  allocation: number;
  sparklineData: number[];
}
```

#### FocusModal

**File:** `src/components/focus-modal.tsx`

**Purpose:** Full-screen asset detail view with interactive charts

**Features:**

- Backdrop blur (glassmorphism)
- Interactive price chart (Recharts)
- Technical indicators panel
- Transaction history for asset
- Buy/Sell quick actions

**Layout:**

- Left panel: Chart (70%)
- Right panel: Stats & actions (30%)

---

## 5. State Management

### Global State (Zustand)

**File:** `src/stores/portfolio-store.ts` (525 lines)

**Store Structure:**

```typescript
interface PortfolioState {
  stages: Stage[]; // Asset class stages
  notifications: Notification[]; // User notifications
  transactions: Transaction[]; // Transaction history
  settings: Settings; // User preferences
  lastUpdated: Date; // Last data refresh
  assetRequests: AssetRequest[]; // Pending asset requests
}
```

**Actions:**

```typescript
// Stage management
addAsset(stageId: string, asset: Asset)
removeAsset(stageId: string, assetId: string)
updateAsset(stageId: string, assetId: string, updates: Partial<Asset>)

// Transactions
addTransaction(transaction: Transaction)
getTransactionsByAsset(assetId: string)

// Notifications
addNotification(notification: Notification)
markNotificationAsRead(id: string)
clearNotifications()

// Settings
updateSettings(updates: Partial<Settings>)
setCurrency(currency: "USD" | "EUR" | "GBP")

// Asset Requests
submitAssetRequest(request: AssetRequest)
updateAssetRequestStatus(id: string, status: string)
```

**Current Implementation:**

- **Mock data generation** - Sparklines, values, changes
- **Static tickers** - AAPL, MSFT, GOOGL, BTC, ETH, XAU, etc.
- **No persistence** - Data resets on page refresh

**Future Integration:**

- Replace mock data with API calls
- Add Supabase queries for user portfolios
- Implement optimistic updates with `useOptimistic`

### Local State Patterns

**Component-specific state:**

```typescript
// Modal visibility
const [showModal, setShowModal] = useState(false);

// Form data
const [formData, setFormData] = useState({ ticker: "", quantity: 0 });

// UI state
const [isExpanded, setIsExpanded] = useState(false);
```

**React 19 useOptimistic pattern (future):**

```typescript
function TransactionForm() {
  const [optimisticTransactions, addOptimisticTransaction] = useOptimistic(
    transactions,
    (state, newTransaction) => [...state, newTransaction]
  );

  async function handleSubmit(data) {
    // Immediately show in UI
    addOptimisticTransaction({ ...data, id: "pending" });

    // Send to server
    await supabase.from("transactions").insert(data);
  }
}
```

---

## 6. Routing Strategy

### File-Based Routing (React Router 7.11.0)

**Convention:** Files in `src/routes/` define routes

**Route Mapping:**

```
File: _auth.login.tsx          → URL: /login
File: _protected._layout._index.tsx → URL: / (protected)
File: _protected._layout.analytics.tsx → URL: /analytics (protected)
File: _protected._layout.stages.$stageId.tsx → URL: /stages/:stageId
```

### Protected Routes

**Implementation:** `_protected.tsx` layout wrapper

```typescript
// src/routes/_protected.tsx
import { requireAuth } from "@/lib/auth"

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request)
  return { user }
}

export default function ProtectedLayout() {
  const { user } = useLoaderData()
  return <Outlet context={{ user }} />
}
```

**Auth Middleware:** `src/lib/auth.ts`

```typescript
export async function requireAuth(request: Request) {
  const { supabase } = createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = new URL(request.url);
    const redirectTo = url.pathname + url.search;
    throw redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return user;
}
```

### Route Loaders (Data Fetching)

**Pattern:** Fetch data in loader, access in component

```typescript
// Future implementation
export async function loader({ params }: LoaderFunctionArgs) {
  const { supabase } = createClient(request)

  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('*, transactions(*)')
    .eq('id', params.portfolioId)
    .single()

  return { portfolio }
}

export default function PortfolioDetail() {
  const { portfolio } = useLoaderData()
  return <div>{portfolio.name}</div>
}
```

---

## 7. Authentication & Authorization

### Supabase Auth Integration

**Client Setup:** `src/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
}
```

**Server Setup (SSR):** `src/lib/supabase/server.ts`

```typescript
import { createServerClient } from "@supabase/ssr";

export function createClient(request: Request) {
  const cookies = parseCookies(request.headers.get("Cookie"));

  return createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (key) => cookies[key],
        set: (key, value, options) => {
          // Set cookie in response headers
        },
        remove: (key, options) => {
          // Remove cookie
        },
      },
    }
  );
}
```

### Auth Flows

**Sign Up:**

```typescript
// src/routes/_auth.sign-up.tsx
async function handleSignUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/confirm`,
    },
  });
}
```

**Login:**

```typescript
// src/routes/_auth.login.tsx
async function handleLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (data.session) {
    navigate("/"); // Redirect to dashboard
  }
}
```

**OAuth (Google, GitHub):**

```typescript
async function handleOAuth(provider: "google" | "github") {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/confirm`,
    },
  });
}
```

**Session Management:**

- JWT tokens stored in httpOnly cookies (Supabase handles)
- Automatic token refresh (Supabase SDK)
- Session expiry: 1 hour (configurable)

---

## 8. Data Flow Patterns

### Current: Mock Data Flow

```
User Interaction (Click add asset)
    ↓
Event Handler (addAsset function)
    ↓
Zustand Store Update (addAsset action)
    ↓
Component Re-render (React detects state change)
    ↓
UI Updates (New asset card appears)
```

### Future: API Integration Flow

```
User Interaction (Add transaction)
    ↓
Optimistic Update (useOptimistic hook)
    ├─ UI updates immediately (pending state)
    │
    ↓
API Request (Supabase INSERT)
    ↓
Server Response (201 Created)
    ├─ Success → Replace pending with real data
    └─ Error → Rollback optimistic update, show error
    ↓
Zustand Store Update (addTransaction)
    ↓
Cache Invalidation (React Query or manual)
```

### Data Refresh Patterns

**Polling (Current Mock):**

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // Update mock prices
    updateMockPrices();
  }, 60000); // Every 60 seconds

  return () => clearInterval(interval);
}, []);
```

**WebSocket (Future):**

```typescript
useEffect(() => {
  const ws = new WebSocket("wss://api.finsight.app/prices");

  ws.onmessage = (event) => {
    const priceUpdate = JSON.parse(event.data);
    updateAssetPrice(priceUpdate.ticker, priceUpdate.price);
  };

  return () => ws.close();
}, []);
```

---

## 9. UI/UX Design System

### Design Principles

1. **Spatial Navigation** - Horizontal stages reduce cognitive load
2. **Glassmorphism** - Frosted glass effects for depth
3. **Minimal Motion** - Purposeful animations (300ms max)
4. **Dark-First** - Optimized for night viewing
5. **Information Hierarchy** - Most important data largest/brightest

### Color Palette

**Background:**

- `#0a0a0b` - Base background
- `#18181b` - Card background
- `rgb(255 255 255 / 0.03)` - Subtle overlay

**Accent Colors:**

- Emerald: `#10b981` (positive/gains)
- Red: `#ef4444` (negative/losses)
- Indigo: `#6366f1` (interactive elements)
- Zinc: `#71717a` (muted text)

**Glassmorphism:**

```css
.glass-card {
  background: rgba(24, 24, 27, 0.4);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

### Typography

**Font Stack:**

```css
--font-sans:
  system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-serif: "Georgia", "Times New Roman", serif;
```

**Usage:**

- Headings: `font-serif` (elegant, financial aesthetic)
- Body: `font-sans` (readable, modern)
- Numbers: `tabular-nums` (consistent width)

### Animation System

**Framer Motion Variants:**

```typescript
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  hover: { scale: 1.02, transition: { duration: 0.2 } }
}

<motion.div
  variants={cardVariants}
  initial="hidden"
  animate="visible"
  whileHover="hover"
>
  <AssetCard />
</motion.div>
```

**Performance Guidelines:**

- Limit simultaneous animations to 3
- Use `transform` and `opacity` (GPU accelerated)
- Avoid animating `width`, `height`, `top`, `left`

---

## 10. Performance Optimization

### Current Optimizations

**Vite Build:**

- Code splitting by route
- Tree shaking (unused code removed)
- Minification (Terser)
- CSS purging (Tailwind JIT)

**React Optimizations:**

- `React.memo()` for expensive components
- `useMemo()` for derived state
- `useCallback()` for stable function references

**Asset Optimization:**

- SVG icons (Lucide) - Tree-shakeable
- Lazy loading images (future)
- WebP format for photos

### Performance Budgets

**Target Metrics:**

- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3s
- Cumulative Layout Shift (CLS): < 0.1

**Bundle Size Limits:**

- Initial JS: < 200 KB (gzipped)
- Route chunks: < 50 KB each
- CSS: < 30 KB (gzipped)

---

## 11. Development Workflow

### Commands

```bash
# Development
pnpm dev                  # Start dev server (http://localhost:5173)
pnpm build                # Production build
pnpm preview              # Preview production build
pnpm lint                 # Run ESLint
pnpm type-check           # TypeScript type checking

# Testing (future)
pnpm test                 # Run Vitest tests
pnpm test:ui              # Vitest UI
pnpm test:coverage        # Coverage report
```

### Hot Module Replacement (HMR)

**Fast Refresh:**

- React components: Preserves state on save
- CSS: Instant updates without reload
- JSON imports: Hot reload

**HMR Boundaries:**

- Route components: Full reload
- Context providers: Full reload
- Store changes: Preserve state

### Environment Variables

**Required:**

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Optional:**

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_WS_URL=wss://localhost:3000
VITE_ENABLE_MOCK_DATA=true
```

### Code Quality Tools

**ESLint Configuration:**

- React Hooks rules
- TypeScript strict mode
- Accessibility (a11y) rules

**TypeScript Strict Mode:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

## Architecture Decisions

### Why React 19?

- Latest features for better DX
- useOptimistic for instant UI feedback
- Better Suspense for loading states
- Forward compatibility

### Why Vite over Webpack/CRA?

- 10x faster dev server startup
- Instant HMR (< 100ms)
- No config needed out-of-the-box
- Native ESM support

### Why Zustand over Redux/Context?

- Simpler API (no boilerplate)
- Better TypeScript support
- Smaller bundle size (1.2 KB)
- No provider hell

### Why File-Based Routing?

- Co-location of route + data fetching
- Automatic code splitting
- Better type safety
- Convention over configuration

### Why Radix UI over Material-UI?

- Unstyled (full design control)
- Accessible by default (ARIA)
- Smaller bundle (tree-shakeable)
- Better composition

---

## Known Limitations & Future Improvements

### Current Limitations

1. **Mock Data** - All portfolio data is generated, not persisted
2. **No API Integration** - Web app doesn't connect to ClickHouse yet
3. **No Real-Time Updates** - Price changes are simulated
4. **No User Authentication** - Supabase client configured but not used
5. **No Tests** - Testing framework not set up

### Planned Improvements

1. **API Integration**
   - Build NestJS backend
   - Connect to PostgreSQL for user data
   - Query ClickHouse for market data

2. **Real-Time Features**
   - WebSocket connection for live prices
   - Optimistic UI updates
   - Background sync

3. **Testing**
   - Vitest unit tests
   - React Testing Library component tests
   - Playwright e2e tests

4. **Performance**
   - Virtual scrolling for large lists
   - Image lazy loading
   - Service Worker for offline mode

5. **Features**
   - CSV export
   - PDF reports
   - Collaborative portfolios
   - Mobile app (React Native)

---

_Last updated: December 26, 2025_
