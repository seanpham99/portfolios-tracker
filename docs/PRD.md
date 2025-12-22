# **Project Title: Finsight Portfolio \- Next Gen Asset Tracker**

Role: Senior Fullstack Engineer & UI/UX Designer  
Goal: Rebuild the "Finsight" prototype into a production-ready web application and implement core backend features.

## **1\. Product Philosophy & Design Language**

Concept: "Financial Zen." A departure from cluttered, spreadsheet-style dashboards. Finsight treats asset classes as distinct "stages" in a spatial interface.  
Visual Style: "Cinematic Minimalism."

- **Palette:** Deep Zinc (\#0a0a0b) background, high-contrast White text, specific semantic colors (Emerald for gains, Rose for losses, Indigo for UI accents).
- **Typography:** Editorial mix. Large, italicized Serif headers (e.g., Playfair Display or similar) for emotional impact, paired with clean Sans-Serif (Inter/Geist) for data.
- **Textures:** Heavy use of Glassmorphism (backdrop-blur), thin translucent borders (1px border-zinc-800), and ambient background gradients (glows) to create depth.
- **Motion:** Organic and fluid. Staggered entry animations for lists. Smooth cubic-bezier transitions for horizontal sliding.

## **2\. Core UX Patterns (The "Finsight" Experience)**

The application avoids vertical scrolling on the main dashboard. It relies on a **Horizontal Stage Slider**.

### **A. The Stage Slider (Main View)**

- **Layout:** The viewport is divided into distinct stages (e.g., Equities, Crypto, Real Estate).
- **Navigation:**
  - **Horizontal Flow:** Users navigate left/right between asset classes.
  - **Input Methods:** Clickable arrow buttons, bottom progress bar indicators, and **Keyboard Arrow Keys (Left/Right)**.
- **Components:**
  - **The Blade:** Asset items are represented as horizontal "blades" or cards.
  - **Sparklines:** Minimalist SVG trend lines _without_ axes or grids. Purely gestural data visualization.
  - **Staggered Entry:** When a stage enters the viewport, items cascade in one by one (100ms delay per item).

### **B. The Focus Mode (Detail View)**

- **Interaction:** Clicking a "Blade" triggers a modal overlay.
- **Visuals:** The background (Main View) blurs heavily. The Focus Card is high-contrast white (or light gray) to demand attention.
- **Features:**
  - Large interactive Area Chart with gradient fills.
  - Timeframe selector (1D, 1W, 1M, YTD) that updates chart data.
  - "Quick Actions" panel (Buy, Sell/Liquidate).

### **C. Portfolio Intelligence (Analytics Overlay)**

- **Interaction:** Accessible via a "Portfolio Intelligence" button or command menu.
- **Visuals:** A full-screen glassmorphic overlay.
- **Features:**
  - **Net Worth Trajectory:** A master chart combining all asset classes.
  - **Event Markers:** Visual dots on the timeline indicating Buy/Sell events.
  - **AI Insights:** A generative UI section displaying text-based risk analysis and rebalancing suggestions.
  - **Allocation Radar:** A breakdown of asset distribution.

## **3\. Technical Requirements & Stack Recommendations**

### **Frontend**

- **Framework:** React + Vite.
- **Styling:** Tailwind CSS. Use backdrop-blur, bg-opacity, and gradient utilities extensively.
- **Animation:** Framer Motion (critical for the complex layout transitions and staggered entrances).
- **Charts:** Recharts or Visx (must be customized to remove axes/grids for the minimalist look).
- **Icons:** Lucide React.

### **Backend (Missing Features to Implement)**

The prototype is frontend-only. The rebuild requires a robust backend:

1. **Authentication:**
   - Implement Social Auth (Google/GitHub) and Email Magic Links.
   - _Recommendation:_ Supabase Auth or Clerk.
2. **Database Schema (PostgreSQL):**
   - Users: ID, settings (currency preference).
   - Portfolios: ID, user_id, type (Personal/Team).
   - Assets: ID, portfolio_id, symbol (e.g., AAPL), type (Stock/Crypto), quantity, average_buy_price.
   - Transactions: ID, asset_id, type (BUY/SELL), amount, price, timestamp.
3. **Market Data Integration:**
   - Connect to live APIs (CoinGecko for Crypto, AlphaVantage/Yahoo Finance for Stocks).
   - _Requirement:_ Implement a caching layer (Redis) to prevent rate limiting.
4. **Team/Multiplayer (New Feature):**
   - Allow users to create a "Team Portfolio."
   - Implement role-based access (Viewer vs. Editor).

## **4\. Implementation Checklist**

1. **Scaffold:** Set up Vite project with Tailwind and Framer Motion.
2. **UI Library:** Build the atomic components (GlassCard, Sparkline, StageContainer).
3. **Navigation Logic:** Implement the carousel logic with keyboard event listeners.
4. **Backend:** Set up the database and connect the "Add Asset" form to real mutations.
5. **Data Fetching:** Replace mock ASSET_CLASSES with live data hooks (e.g., React Query).
6. **Responsiveness:** While desktop-first, adapt the horizontal slider to a vertical stack or swipeable carousel on Mobile.

**Success Criteria:** The app must feel like a high-end fintech product (e.g., Robinhood, linear.app). Transitions must be instant and silky (60fps).
