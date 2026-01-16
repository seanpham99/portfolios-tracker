# Style Guide - Portfolios Tracker UI System

> **Design System**: Tailwind v4 + CSS Variables + shadcn/ui + Glassmorphism  
> **Last Updated**: 2026-01-15  
> **Typography**: Space Grotesk (headings) + DM Sans (body)

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Typography System](#typography-system)
3. [Color System](#color-system)
4. [Glassmorphism & Surfaces](#glassmorphism--surfaces)
5. [Layout System](#layout-system)
6. [Spacing & Sizing](#spacing--sizing)
7. [Component Patterns](#component-patterns)
8. [Motion & Animation](#motion--animation)
9. [Responsive Design](#responsive-design)
10. [Accessibility](#accessibility)
11. [Data Visualization](#data-visualization)
12. [Marketing Components](#marketing-components)
13. [Best Practices](#best-practices)

---

## Design Philosophy

### Fintech Premium Experience

Based on UI/UX Pro Max recommendations for Fintech/Portfolio SaaS products:

| Principle         | Application                                  |
| ----------------- | -------------------------------------------- |
| **Style**         | Glassmorphism + Dark Mode (OLED)             |
| **Feel**          | Premium, trustworthy, calm under volatility  |
| **Motion**        | Smooth micro-interactions, staggered reveals |
| **Accessibility** | WCAG 2.1 AA compliant                        |

### Core Values

- **Clarity-first**: Prioritize legibility, hierarchy, and minimalism
- **Predictability**: Favor familiar patterns with progressive disclosure
- **Calm motion**: Short, subtle transitions respecting `prefers-reduced-motion`
- **Trust through transparency**: Show methodology, data freshness, calculation lineage
- **Speed to value**: ≤3 clicks to drill; ≤15 minutes to first complete portfolio

---

## Typography System

### Font Pairing: Tech Startup

Selected from UI/UX Pro Max for tech companies, startups, and SaaS products.

| Role          | Font           | Weights            | CSS Variable   |
| ------------- | -------------- | ------------------ | -------------- |
| **Headings**  | Space Grotesk  | 400, 500, 600, 700 | `font-heading` |
| **Body**      | DM Sans        | 400, 500, 700      | `font-sans`    |
| **Monospace** | JetBrains Mono | 400                | `font-mono`    |

### Google Fonts Import

```css
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap");
```

### CSS Variables

```css
--font-sans: "DM Sans", sans-serif;
--font-heading: "Space Grotesk", sans-serif;
--font-mono: JetBrains Mono, monospace;
```

### Type Scale

| Element    | Class                  | Size          | Weight          | Usage               |
| ---------- | ---------------------- | ------------- | --------------- | ------------------- |
| Hero       | `text-6xl lg:text-7xl` | 3.75-4.5rem   | `font-bold`     | Marketing headlines |
| H1         | `text-4xl md:text-5xl` | 2.25-3rem     | `font-bold`     | Page titles         |
| H2         | `text-3xl md:text-4xl` | 1.875-2.25rem | `font-bold`     | Section headers     |
| H3         | `text-xl md:text-2xl`  | 1.25-1.5rem   | `font-semibold` | Card titles         |
| Body Large | `text-lg`              | 1.125rem      | `font-normal`   | Lead paragraphs     |
| Body       | `text-base`            | 1rem          | `font-normal`   | Default body text   |
| Small      | `text-sm`              | 0.875rem      | `font-normal`   | Labels, captions    |
| XS         | `text-xs`              | 0.75rem       | `font-normal`   | Metadata, badges    |

### Usage Examples

```tsx
// Marketing Hero (use font-heading via style prop)
<h1
  className="text-4xl md:text-6xl lg:text-7xl font-bold text-white"
  style={{ fontFamily: 'var(--font-heading)' }}
>
  Your wealth, one dashboard
</h1>

// Section Headers
<h2
  className="text-3xl md:text-5xl font-bold text-white"
  style={{ fontFamily: 'var(--font-heading)' }}
>
  Everything you need
</h2>

// Body Text
<p className="text-lg text-zinc-400">
  Connect all your accounts and track your net worth.
</p>

// Financial Values
<div className="text-3xl font-bold text-white">$847,392</div>
```

---

## Color System

### Semantic Tokens

All colors are defined as CSS variables for automatic light/dark mode support.

#### Base Tokens (shadcn/ui)

| Token              | Tailwind Class          | Usage                     |
| ------------------ | ----------------------- | ------------------------- |
| `background`       | `bg-background`         | Page background           |
| `foreground`       | `text-foreground`       | Primary text              |
| `card`             | `bg-card`               | Card backgrounds          |
| `muted`            | `bg-muted`              | Subtle backgrounds        |
| `muted-foreground` | `text-muted-foreground` | Secondary text            |
| `primary`          | `bg-primary`            | Primary actions (emerald) |
| `secondary`        | `bg-secondary`          | Secondary actions         |
| `destructive`      | `bg-destructive`        | Error/destructive         |
| `border`           | `border-border`         | Standard borders          |

#### Extended Surface Tokens

| Token              | Tailwind Class        | Dark Mode Value            |
| ------------------ | --------------------- | -------------------------- |
| `surface`          | `bg-surface`          | oklch(0.17 0.02 260)       |
| `surface-elevated` | `bg-surface-elevated` | oklch(0.20 0.02 260)       |
| `surface-glass`    | `bg-surface-glass`    | oklch(0.17 0.02 260 / 50%) |

#### Extended Border Tokens

| Token           | Tailwind Class         | Opacity   |
| --------------- | ---------------------- | --------- |
| `border-subtle` | `border-border-subtle` | 6% white  |
| `border-medium` | `border-border-medium` | 12% white |

### Fintech Color Palette

**Primary Colors:**

| Color       | Hex     | Class              | Usage                     |
| ----------- | ------- | ------------------ | ------------------------- |
| Emerald 500 | #10B981 | `text-emerald-500` | Primary actions, positive |
| Cyan 500    | #06B6D4 | `text-cyan-500`    | Accents, highlights       |
| Purple 500  | #8B5CF6 | `text-purple-500`  | Secondary accents         |

**Background & Surface:**

| Color     | Hex     | Usage            |
| --------- | ------- | ---------------- |
| Slate 900 | #0F172A | Page background  |
| Zinc 900  | #18181B | Card backgrounds |
| Zinc 950  | #09090B | Deep background  |

**Text:**

| Color    | Hex     | Class           | Usage                  |
| -------- | ------- | --------------- | ---------------------- |
| White    | #FFFFFF | `text-white`    | Primary text, headings |
| Zinc 300 | #D4D4D8 | `text-zinc-300` | Body text              |
| Zinc 400 | #A1A1AA | `text-zinc-400` | Secondary text         |
| Zinc 500 | #71717A | `text-zinc-500` | Muted text             |

### Gradient System

```tsx
// Primary CTA Gradient
className = "bg-gradient-to-r from-emerald-500 to-cyan-500";

// Hover State
className = "hover:from-emerald-400 hover:to-cyan-400";

// Text Gradient
className = "bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent";

// Glow Effect
className = "bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-purple-500/20 blur-3xl";

// Feature Accent Gradients
const gradients = {
  emerald: "from-emerald-500 to-cyan-500",
  purple: "from-purple-500 to-pink-500",
  orange: "from-orange-500 to-amber-500",
  cyan: "from-cyan-500 to-blue-500",
  indigo: "from-blue-500 to-indigo-500",
  rose: "from-pink-500 to-rose-500",
};
```

---

## Glassmorphism & Surfaces

### Glass Card Utilities

Pre-built utility classes in `globals.css`:

```tsx
// Basic glass card
<div className="glass-card">
  {/* Frosted glass with backdrop-blur */}
</div>

// Glass card with hover effect
<div className="glass-card-hover">
  {/* Includes border/background transitions */}
</div>
```

**CSS Definition:**

```css
.glass-card {
  border-radius: 1rem;
  border-width: 1px;
  border-color: var(--border-subtle);
  background-color: var(--surface-glass);
  backdrop-filter: blur(24px);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.glass-card-hover {
  /* Inherits glass-card styles */
  transition: all 300ms ease;
}

.glass-card-hover:hover {
  border-color: var(--border);
  background-color: var(--overlay-medium);
}
```

### Surface Elevation

```tsx
// Standard surface
<Card className="surface-primary">

// Elevated surface (for hover states)
<Card className="surface-elevated">

// Elevated with hover effect
<Card className="surface-elevated-hover">
```

### Marketing Card Pattern

```tsx
<div className="group relative p-6 md:p-8 rounded-2xl border border-white/5 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-white/10 transition-all duration-300 cursor-pointer">
  {/* Gradient glow on hover */}
  <div
    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl bg-gradient-to-r from-emerald-500 to-cyan-500"
    style={{ transform: "scale(0.9)" }}
  />

  {/* Content */}
  <div className="relative z-10">{/* ... */}</div>
</div>
```

---

## Layout System

### Container Widths

| Page Type | Max Width   | Usage          |
| --------- | ----------- | -------------- |
| Marketing | `max-w-6xl` | Landing pages  |
| Dashboard | `max-w-7xl` | App content    |
| Forms     | `max-w-2xl` | Settings, auth |

```tsx
// Marketing container
<div className="container mx-auto px-4 md:px-6 max-w-6xl">

// Dashboard container
<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
```

### Floating Navigation

For marketing pages, use floating pill navigation:

```tsx
<header className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-6xl">
  <nav className="flex items-center justify-between rounded-full border border-white/10 bg-black/60 backdrop-blur-xl px-4 py-2 md:px-6 md:py-3">
    {/* Navigation content */}
  </nav>
</header>
```

### 12-Column Grid

```tsx
// Responsive card grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <Card key={item.id} className="col-span-1" />
  ))}
</div>

// Bento grid (mixed sizes)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
  <div className="lg:col-span-2">{/* Large card */}</div>
  <div>{/* Normal card */}</div>
  <div>{/* Normal card */}</div>
</div>
```

---

## Spacing & Sizing

### Spacing Scale

| Class   | Size   | Usage                 |
| ------- | ------ | --------------------- |
| `gap-2` | 0.5rem | Compact (icon + text) |
| `gap-4` | 1rem   | Default spacing       |
| `gap-6` | 1.5rem | Cards, sections       |
| `gap-8` | 2rem   | Major sections        |

### Section Spacing

```tsx
// Marketing section
<section className="py-24 md:py-32 relative overflow-hidden">

// Dashboard section
<section className="py-6 space-y-6">
```

### Card Padding

```tsx
// Marketing cards
<div className="p-6 md:p-8 rounded-2xl">

// Dashboard cards
<Card className="p-4 md:p-6">
```

---

## Component Patterns

### Buttons

```tsx
// Primary CTA (gradient)
<Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white rounded-full px-8 font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 cursor-pointer">
  Get Started
</Button>

// Secondary (outline)
<Button variant="outline" className="rounded-full px-8 border-zinc-700 text-zinc-300 hover:text-white hover:bg-white/5 cursor-pointer">
  Learn More
</Button>

// Ghost
<Button variant="ghost" className="text-zinc-300 hover:text-white cursor-pointer">
  Log in
</Button>
```

### Badges

```tsx
// Announcement badge
<div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400">
  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
  <span>New Feature</span>
</div>

// Feature icons with gradient
<div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg">
  <Icon className="h-6 w-6 text-white" />
</div>
```

### Cards with Hover Effects

```tsx
// Feature card
<motion.div
  className="group p-8 rounded-2xl border border-white/5 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-white/10 transition-all duration-300 cursor-pointer"
  whileHover={{ y: -4 }}
>
  {/* Glow effect */}
  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl bg-gradient-to-r from-emerald-500 to-cyan-500" />

  {/* Content */}
</motion.div>
```

### Testimonial Cards

```tsx
<div className="p-6 md:p-8 rounded-2xl border border-white/5 bg-zinc-900/50 hover:border-white/20 transition-all duration-500 cursor-pointer">
  {/* Stars */}
  <div className="flex gap-1 mb-4">
    {[...Array(5)].map((_, i) => (
      <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
    ))}
  </div>

  {/* Quote */}
  <blockquote className="text-zinc-300 mb-6">"{testimonial.quote}"</blockquote>

  {/* Avatar with gradient */}
  <div className="flex items-center gap-4">
    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-white">
      {initials}
    </div>
    <div>
      <div className="font-semibold text-white">{name}</div>
      <div className="text-sm text-zinc-500">{role}</div>
    </div>
  </div>
</div>
```

### Pricing Cards

```tsx
<div
  className={cn(
    "p-6 md:p-8 rounded-2xl border transition-all duration-300",
    isPopular
      ? "border-emerald-500/50 bg-gradient-to-b from-emerald-500/10 to-transparent"
      : "border-white/5 bg-zinc-900/50 hover:border-white/10"
  )}
>
  {/* Popular badge */}
  {isPopular && (
    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
      <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold px-4 py-1.5 rounded-full">
        Most Popular
      </div>
    </div>
  )}

  {/* Content */}
</div>
```

---

## Motion & Animation

### Framer Motion Patterns

**Fade + Slide Up (default):**

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
```

**Viewport Animation:**

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.5 }}
>
```

**Staggered Children:**

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

<motion.div variants={containerVariants} initial="hidden" whileInView="visible">
  {items.map((item) => (
    <motion.div key={item.id} variants={itemVariants}>
      {/* Item content */}
    </motion.div>
  ))}
</motion.div>;
```

**Hover Lift:**

```tsx
<motion.div whileHover={{ y: -4 }}>
```

**Floating Animation:**

```tsx
<motion.div
  animate={{ y: [0, -10, 0] }}
  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
>
```

**Background Gradient Animation:**

```tsx
<motion.div
  className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20"
  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
/>
```

### Animated Counter

```tsx
import { useMotionValue, useTransform, animate } from "framer-motion";

function AnimatedCounter({ value, suffix = "" }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 2,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [count, value]);

  return <motion.span>{rounded}</motion.span>;
}
```

### Reduced Motion Support

```tsx
import { useReducedMotion } from "framer-motion";

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
    >
      {children}
    </motion.div>
  );
}
```

---

## Responsive Design

### Breakpoints

| Breakpoint | Width  | Navigation    |
| ---------- | ------ | ------------- |
| `sm`       | 640px  | Mobile menu   |
| `md`       | 768px  | Tablet        |
| `lg`       | 1024px | Desktop       |
| `xl`       | 1280px | Large desktop |
| `2xl`      | 1536px | Extra large   |

### Mobile-First Patterns

```tsx
// Typography
<h1 className="text-4xl md:text-6xl lg:text-7xl">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Spacing
<div className="p-4 md:p-6 lg:p-8">

// Visibility
<div className="hidden md:block">  // Desktop only
<div className="md:hidden">        // Mobile only
```

### Touch-Friendly

- Buttons: Minimum 44x44px touch targets
- Links: Adequate spacing between clickable elements
- All interactive: `cursor-pointer` class

---

## Accessibility

### WCAG 2.1 AA Compliance

| Requirement             | Implementation                       |
| ----------------------- | ------------------------------------ |
| **Color Contrast**      | 4.5:1 minimum for normal text        |
| **Focus Indicators**    | Ring with `ring-emerald-500/50`      |
| **Keyboard Navigation** | All interactive elements accessible  |
| **ARIA Labels**         | Meaningful labels for icons, buttons |
| **Error Announcements** | `role="alert"` for errors            |
| **Alt Text**            | Descriptive alt for images           |

### Interactive Elements

```tsx
// All buttons, links, cards
className="cursor-pointer"

// Icon buttons
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
  <span className="sr-only">Close</span>
</button>

// Focus visible
<Button className="focus-visible:ring-2 focus-visible:ring-emerald-500">
```

---

## Data Visualization

### Chart Colors

```tsx
const chartColors = {
  primary: "var(--primary)", // Emerald
  secondary: "var(--secondary)", // Purple
  accent: "var(--accent)", // Cyan
  positive: "#10B981", // Green
  negative: "#EF4444", // Red
  neutral: "#6B7280", // Gray
};
```

### Financial Display

```tsx
// Positive P&L
<span className="text-emerald-400 flex items-center gap-1">
  <TrendingUp className="h-4 w-4" />
  +12.4%
</span>

// Negative P&L
<span className="text-red-400 flex items-center gap-1">
  <TrendingDown className="h-4 w-4" />
  -3.2%
</span>
```

### Progress/Allocation Bars

```tsx
// Gradient progress bar
<div className="h-2 w-full rounded-full bg-zinc-700">
  <div
    className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
    style={{ width: "75%" }}
  />
</div>
```

---

## Marketing Components

### Hero Section Pattern

```tsx
<section className="relative pt-32 pb-24 md:pt-44 md:pb-32 overflow-hidden">
  {/* Animated gradient orbs */}
  <div className="absolute inset-0 -z-10">
    <motion.div className="absolute ... bg-emerald-500/30 blur-[120px]" />
    <motion.div className="absolute ... bg-purple-500/20 blur-[100px]" />
  </div>

  {/* Content */}
  <div className="container mx-auto px-4 md:px-6 text-center">
    {/* Badge, heading, subheading, CTAs, stats */}
  </div>

  {/* Dashboard mockup */}
  <motion.div className="mt-20 relative mx-auto max-w-5xl">
    {/* Glow effect */}
    <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 ... blur-3xl" />

    {/* Mockup card */}
    <div className="rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl">
      {/* Browser dots + content */}
    </div>
  </motion.div>
</section>
```

### CTA Section Pattern

```tsx
<section className="py-24 md:py-32">
  <div className="relative rounded-3xl overflow-hidden">
    {/* Animated gradient background */}
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-cyan-600 to-emerald-600 bg-[length:200%_200%] animate-gradient-slow" />

    {/* Content */}
    <div className="relative px-6 py-16 md:px-16 md:py-24 text-center">
      {/* Badge, heading, CTAs, trust indicators */}
    </div>
  </div>
</section>
```

---

## Best Practices

### ✅ Do

- Use semantic color tokens (`text-foreground`, not `text-white`)
- Apply `cursor-pointer` to all interactive elements
- Use Space Grotesk for headings via `style={{ fontFamily: 'var(--font-heading)' }}`
- Use gradients for primary CTAs
- Add hover states with smooth transitions (300ms)
- Respect `prefers-reduced-motion`
- Use Framer Motion for complex animations
- Apply glassmorphism utilities for cards

### ❌ Don't

- Hardcode colors (`bg-zinc-900` → `bg-surface`)
- Use emojis as icons (use Lucide React instead)
- Forget cursor states on clickable elements
- Use linear easing (prefer ease-out)
- Add animations without reduced-motion fallback
- Mix different icon sizes randomly
- Use scale transforms that cause layout shift

---

## Resources

- [Tailwind v4 Documentation](https://tailwindcss.com/docs/v4-beta)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)
- [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)
- [DM Sans](https://fonts.google.com/specimen/DM+Sans)
- **Project Files:**
  - CSS: `/packages/ui/src/styles/globals.css`
  - Marketing Components: `/apps/web/src/features/marketing/components/`
  - UX Spec: `/_bmad-output/project-planning-artifacts/ux/ux-design-specification.md`

---

**Remember**: Premium fintech design = glassmorphism + gradients + smooth motion + trust indicators 🎨
