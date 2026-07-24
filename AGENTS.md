# AGENTS.md — Breeze Cleaning Website

## Stack

- **Framework**: Next.js 16 (App Router) w/ Turbopack, React 19
- **Language**: TypeScript (strict mode), ES6 target
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`), `tw-animate-css`, CSS variables in `oklch()`
- **CMS**: TinaCMS v3 (schema in `tina/config.ts`, content in `content/`)
- **Database**: PostgreSQL via Drizzle ORM (`drizzle-orm/node-postgres`), `pg` driver
- **UI Library**: shadcn/ui (New York style), Radix UI primitives, Lucide icons
- **Package Manager**: pnpm (`vercel.json` uses `pnpm install --no-frozen-lockfile`)
- **Testing**: Vitest v4, `@testing-library/react`, `jsdom` environment
- **Deployment**: Vercel (configured in `vercel.json`)
- **Form handling**: react-hook-form + zod
- **Fonts**: Instrument Sans (sans), Instrument Serif (display), JetBrains Mono (mono)

## Essential Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Next.js dev server |
| `pnpm dev:tina` | TinaCMS local dev (wraps `next dev`) |
| `pnpm build` | `next build` (typescript errors ignored) |
| `pnpm build:tina` | TinaCMS build + next build |
| `pnpm test` | `vitest run` (excludes pricing.test.ts and *-verification.test.ts) |
| `pnpm test:watch` | `vitest` in watch mode |
| `pnpm lint` | ESLint (flat config) |

## Code Organization

```
app/                          # Next.js App Router pages & API routes
├── page.tsx                  # Home page (server component, fetches Tina + booking data)
├── page-client.tsx           # Client wrapper with useTina
├── layout.tsx                # Root layout (fonts, Toaster, Analytics)
├── globals.css               # Tailwind v4 + CSS variables
├── admin/pricing/            # Pricing management dashboard (client component)
├── preview/booking/          # Booking drawer preview page
├── api/bookings/route.ts     # Booking form submission (form-data, Vercel Blob photos)
├── api/admin/pricing/route.ts# CRUD for pricing JSON (GET/PUT)
components/
├── breeze-site.tsx           # Orchestrator: renders Navigation + blocks
├── booking/booking-drawer.tsx# Multi-step booking drawer (context provider + sheet)
├── sections/                 # Page section components
│   ├── hero.tsx, services.tsx, about.tsx, process.tsx
│   ├── testimonials.tsx, contact.tsx, footer.tsx, navigation.tsx
│   └── shared.tsx            # Brand, Proof, StyledText, SectionHeader
├── ui/                       # 60+ shadcn/ui components (generated)
├── theme-provider.tsx        # next-themes provider
lib/
├── pricing.ts                # calculateEstimate(), formatPrice(), service/addOn data
├── booking-content.ts        # BookingContent types, defaults, Tina data normalization
├── page-sections.tsx         # Block type union, renderBlock(), buildNavLinks()
├── navigation-config.ts      # NavigationConfig interface, navDefaults
├── queries.ts                # fetchPageData() — Tina query or fallback
├── utils.ts                  # cn() classname utility
├── db/
│   ├── schema.ts             # Drizzle schema: booking_requests table
│   └── index.ts              # Drizzle client (Pool with DATABASE_URL)
tina/
├── config.ts                 # TinaCMS schema (page sections, booking collections)
├── components/               # Custom Tina CMS field components
│   ├── PricingManagerModal.tsx
│   ├── FocalPointPicker.tsx
│   └── ErrorBoundary.tsx
└── __generated__/            # Auto-generated Tina client (do not edit)
content/
├── page/page.json            # Page sections content (editable via TinaCMS)
└── booking/booking.json      # Services & add-ons pricing data
hooks/
├── use-mobile.ts             # Mobile detection hook
└── use-toast.ts              # Toast notification hook (shadcn)
```

## Architecture & Data Flow

### Page Rendering (Dual Mode)

1. **Server component** (`app/page.tsx`) calls `fetchPageData()` and `fetchBookingContent()`
2. If TinaCMS is reachable: returns raw GraphQL data → `page-client.tsx` uses `useTina()` for live editing
3. If TinaCMS is unreachable: returns static defaults (`defaultBlocks` in `page-sections.tsx`, `bookingContent` in `booking-content.ts`)
4. The `__typename` from Tina's GraphQL is normalized to `_template` via a simple string replacement
5. `BreezeSite` component maps over blocks, calling `renderBlock()` which switches on `_template`

### Booking System

- Context-based (`BookingProvider` + `useBooking` hook)
- Multi-step form drawer (7 steps: Service → Home → Extras → Photos → Schedule → Contact → Review)
- Pricing calculated client-side via `calculateEstimate()` using cents-based formula
- On submit: POST multipart/form-data to `/api/bookings` (photos → Vercel Blob, data → Drizzle/PostgreSQL)
- Tina's `fetchBookingContent()` normalizes `__typename` → `_template` via `typenameToTemplate` mapping

### Pricing Engine

Formula: `basePriceCents + (bedrooms × pricePerBedroomCents) + (bathrooms × pricePerBathroomCents) + addOnsTotal`
Returns `null` if `basePriceCents` is missing/0 → UI shows "Custom quote required"

**All monetary values are in cents (not dollars).** The `formatPrice()` function divides by 100.

## Key Conventions & Patterns

### Naming
- Files: kebab-case for components (`booking-drawer.tsx`), dot-case for config (`postcss.config.mjs`)
- React components: PascalCase
- Props interfaces: `ComponentNameProps` (e.g. `HeroProps`, `AboutProps`)
- Block type discriminator: `_template` field (string union)
- Path alias: `@/` maps to project root (`tsconfig.json` paths)

### Component Patterns
- Client components use `"use client"` directive at top
- Props interfaces use `[key: string]: any` index signature for flexibility
- Default props merged via `{ ...defaults, ...props }` pattern (not React defaultProps)
- All sections pass extra CMS styling props (`*Visible`, `*Size`, `*Color`, `*X`, `*Y`)
- `StyledText` component handles visibility toggling, positioning, sizing, and coloring

### Testing Patterns
- Tests use `vitest` (not Jest)
- `@testing-library/react` for component rendering
- Tests are colocated next to source files (`about.test.tsx`, `navigation.test.tsx`)
- Some test files use custom assertion functions (`pricing.test.ts`, `error-boundary-verification.test.ts`)
- Forensic audit reports live in `.agents/auditor_*/audit.md`
- **Critical**: `vitest.config.ts` explicitly excludes `**/pricing.test.ts` and `**/*-verification.test.ts` from the regular test run — these are standalone scripts run manually

### CMS-Driven Styling
Every text element in sections receives per-element CMS controls:
- `{fieldName}Visible` — boolean to hide/show
- `{fieldName}X`, `{fieldName}Y` — pixel offset via `transform: translate()`
- `{fieldName}Size` — font size in px
- `{fieldName}Color` — color value

## Gotchas & Non-Obvious Details

- **TypeScript errors ignored in build**: `next.config.mjs` has `typescript.ignoreBuildErrors: true`. Run `npx tsc --noEmit` separately for type checking.
- **Vercel Blob required**: Photo upload submission depends on `@vercel/blob`. Will crash without configured blob store.
- **Database required**: Booking submission inserts into PostgreSQL via Drizzle. Requires `DATABASE_URL` env var.
- **No .env files in repo**: `.env*` is gitignored. Must be configured locally or in Vercel.
- **vs code**: `v0.dev` sandbox internal files are gitignored (`.v0-trash/`, `__v0_*`)
- **pnpm over npm**: Vercel deploy command uses pnpm. Don't use npm for installs.
- **`tsconfig.tsbuildinfo` present**: Incremental compilation metadata — safe to ignore.
- **Booking service IDs have trailing space**: `content/booking/booking.json` contains `"Commercial "` (with space) as a key. The `calculateEstimate()` returns null for services with 0 `basePriceCents`.
- **ESLint ignores**: Many dirs are ESLint-ignored (`.next/`, `.agents/`, `tina/__generated__/`, `public/`, markdown files)
- **Three.js present**: `@react-three/fiber` and `three` are in dependencies but no 3D components found yet.
- **`sonner` for toasts**: Toast notifications use `sonner` library (via `Toaster` in layout), not shadcn's own toast.
- **`vaul` for drawer**: The booking drawer uses `vaul` (via shadcn's Sheet component).
- **Margins/Paddings pattern**: Sections use consistent `mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32`.
- **Booking form validation**: Uses `zod` with `.catch()` fallbacks on the API route — graceful degradation over strict validation.
- **Custom 404**: App has a `_not-found` route (seen in build output) — don't overwrite it.
- **Tina media root**: Uploads go to `public/uploads/` via TinaCMS media config.
- **FocalPointPicker**: A custom TinaCMS field component for cropping photos (used in About section).
- **nameInitial CMS controls**: The About section's `nameInitial` field (fallback initial letter) has Visible/Size/Color controls in the CMS but no X/Y offset (position is flexbox-determined).
- **About section heading**: Unlike initial audit, the About section now has a `heading` field wired as SectionHeader `title`, consistent with other sections. The CMS field was also renamed from `tagline` to `copy` to match the layout slot it fills.
- **PricingManagerModal**: Custom TinaCMS field for inline pricing editing.
- **AGENTS.md conventions**: See `.partner.md` for philosophical project context. This document supersedes it for practical coding guidance.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string for Drizzle |
| `NEXT_PUBLIC_TINA_CLIENT_ID` | TinaCMS client ID (defaults to `"local-dev"`) |
| `TINA_TOKEN` | TinaCMS API token (defaults to `"local-dev-token"`) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for photo uploads |

## Related Files

- `PROJECT.md` — Detailed project architecture and milestones
- `.partner.md` — "Two Systems" philosophical context
- `.agents/auditor_*` — Forensic audit reports for completed work products
