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

## Content Flow (Local → Production)

```
Local Tina edit → content/*.json → git commit+push → Vercel auto-deploy
  (pnpm dev:tina)                   triggers rebuild via GitHub integration
                                  vercel.json: "npm run build"
                                  (no tinacms build — no TinaCloud)
```

- **Local edits** save to `content/page/page.json` or `content/booking/booking.json`
- **`git push`** to the `main` branch triggers a Vercel rebuild automatically
- Vercel runs `next build` directly — content comes from committed JSON files, NOT from TinaCloud
- `breeze.lat` is a Vercel custom domain alias pointing to the production deployment
- **No TinaCloud dependency in production** — the build uses `local-dev` mode which reads committed files

## Essential Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Next.js dev server |
| `pnpm dev:tina` | TinaCMS local dev (wraps `next dev`) |
| `pnpm build` | `next build` (typescript errors ignored) |
| `pnpm build:tina` | TinaCMS build + next build |
| `pnpm db:generate` | Generate Drizzle migration from schema changes |
| `pnpm db:migrate` | Apply pending Drizzle migrations to the database |
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
├── admin/bookings/           # Booking submissions dashboard
├── admin/login/              # Custom admin login page
├── preview/booking/          # Booking drawer preview page
├── thank-you/                # Post-booking thank-you page
├── middleware.ts             # Protects /admin/bookings, /admin/pricing
├── api/bookings/route.ts     # Booking form submission (form-data, Vercel Blob photos)
├── api/admin/pricing/route.ts# CRUD for pricing JSON (GET/PUT)
├── api/admin/bookings/route.ts# Booking submissions admin API
├── api/admin/login/route.ts  # Cookie-based login API
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
└── __generated__/            # Generated Tina client & types (COMMITTED — do not edit manually)
content/
├── page/page.json            # Page sections content (editable via TinaCMS)
└── booking/booking.json      # Services & add-ons pricing data
hooks/
├── use-mobile.ts             # Mobile detection hook
└── use-toast.ts              # Toast notification hook (shadcn)
```

## Two Admin Systems

The site has two separate admin interfaces that share the `/admin/*` path:

| System | URL | Auth | Editable Fields |
|--------|-----|------|-----------------|
| **Tina CMS Editor** | `/admin/index.html` | None (local-dev mode) | Page content, booking flow, thank-you page |
| **Custom Admin** | `/admin/login` → `/admin/bookings`, `/admin/pricing` | Cookie-based (`ADMIN_PASSWORD` + `ADMIN_SECRET`) | Booking submissions, pricing management |

**Middleware behavior** (`middleware.ts`):
- Protects `/admin/bookings` and `/admin/pricing` with `admin_session` cookie
- Protects `/api/admin/*` with `admin_session` cookie (except `/api/admin/login`)
- All other `/admin/*` paths (including Tina's `/admin/index.html`) pass through freely
- Login page at `/admin/login` is always accessible

**Custom admin login**: `Lien58008!` (set in `.env.local` as `ADMIN_PASSWORD`)

## How to Edit Content

### Editing Homepage Sections
1. Start `pnpm dev:tina` → `http://localhost:3000`
2. Open `http://localhost:3000/admin/index.html` → Tina CMS editor
3. In the preview, click any text element → sidebar opens to that field
4. Edit and save → updates `content/page/page.json`

### Editing Booking / Thank-You Page
1. In Tina CMS editor, open **Booking & Pricing** collection
2. Preview iframe shows `/preview/booking` (booking drawer)
3. Navigate the preview iframe to `/thank-you?name=Test` to visually edit the thank-you page
4. Four fields are click-to-edit on the thank-you page:
   - Title: `success.title`
   - Message: `success.message` (use `{name}` for customer name)
   - Button text: `success.buttonText`
   - Phone number: `success.phoneNumber`
5. Save → updates `content/booking/booking.json`

### After Editing
1. `git add content/`
2. `git commit -m "Content update"`
3. `git push` → Vercel auto-deploy → `breeze.lat` updates

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

### Timeout Pattern (prevents server hangs)

Both `fetchPageData()` (in `lib/queries.ts`) and `fetchBookingContent()` (in `lib/booking-content.ts`) wrap the Tina GraphQL query in a 5-second `Promise.race` timeout. If the local Tina datalayer is unresponsive (e.g. from a crashed previous session), the call fails fast instead of hanging indefinitely. The `catch` block then falls back to reading the JSON file directly.

```ts
const result = await Promise.race([
  client.queries.page({ relativePath: "page.json" }),
  new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Tina query timed out")), 5000)
  ),
])
```

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

## Server Troubleshooting

### Dev server hangs (all pages time out)
**Cause**: Orphaned Tina datalayer or Next.js process from a previous session occupying ports.

**Fix**:
1. Find ports: `netstat -ano | Select-String ":3000 |:9000 |:4001 " | Select-String LISTENING`
2. Kill the PIDs: `taskkill /PID <number> /F` for each
3. Clear cache: `Remove-Item -Recurse -Force .next`
4. Delete stale generated files: `Remove-Item tina/__generated__/client.ts, tina/__generated__/types.ts, tina/__generated__/_graphql.json`
5. Restart: `pnpm dev:tina`
6. Verify: `Invoke-WebRequest http://localhost:3000/` → should return 200

### Build fails: "Module not found: @/tina/__generated__/client"
**Cause**: Generated Tina files were deleted by `predev:tina` but not regenerated.

**Fix**: Run `pnpm dev:tina` once — the `tinacms dev` step regenerates all files. Or run `tinacms build` to generate them without starting a server.

## Gotchas & Non-Obvious Details

- **TypeScript errors ignored in build**: `next.config.mjs` has `typescript.ignoreBuildErrors: true`. Run `npx tsc --noEmit` separately for type checking.
- **Vercel Blob required**: Photo upload submission depends on `@vercel/blob`. Will crash without configured blob store.
- **Database required**: Booking submission inserts into PostgreSQL via Drizzle. Requires `DATABASE_URL` env var.
- **Content builds from committed JSON, not TinaCloud**: `vercel.json` runs `next build` directly (not `build:tina`). The Vercel Production environment has no `NEXT_PUBLIC_TINA_CLIENT_ID` or `TINA_TOKEN` — Tina's config falls back to `local-dev` which reads from committed `content/*.json` files.
- **Two `.env` files required**: Tina uses `.env` (never `.env.local`) for `NEXT_PUBLIC_TINA_CLIENT_ID` and `TINA_TOKEN`. Both files are set to `local-dev` / `local-dev-token`. Keep them in sync.
- **Generated Tina files are committed**: `tina/__generated__/` is NOT in `.gitignore`. The `next build` step needs `client.ts`, `types.ts`, and the GraphQL schema files. They are regenerated by `tinacms dev` and must be committed after any schema change.
- **Middleware only blocks custom admin, not Tina**: Only `/admin/bookings` and `/admin/pricing` require the admin session cookie. All other `/admin/*` paths (including Tina's editor at `/admin/index.html`) pass through.
- **`rawBooking` required for visual editing**: The `tinaField()` function needs the raw (unnormalized) Tina document, not the normalized `BookingContent`. The booking context exposes `rawBooking` for this purpose.
- **Phone numbers unified**: The hero section and contact section use the same phone number: `(805) 760-8765`. The thank-you page also reads this from the booking content's `success.phoneNumber` field.
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
| `NEXT_PUBLIC_TINA_CLIENT_ID` | TinaCMS client ID — set to `"local-dev"` in both `.env` and `.env.local` (no TinaCloud) |
| `TINA_TOKEN` | TinaCMS API token — set to `"local-dev-token"` in both `.env` and `.env.local` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for photo uploads |
| `ADMIN_PASSWORD` | Custom admin login password (`Lien58008!`) |
| `ADMIN_SECRET` | HMAC signing secret for admin session cookies |
| `ADMIN_API_KEY` | Shared secret for `/api/admin/pricing` route authentication (server-side) |
| `NEXT_PUBLIC_ADMIN_API_KEY` | Same key, exposed to client for admin dashboard auth header |

## Related Files

- `PROJECT.md` — Detailed project architecture and milestones
- `.partner.md` — "Two Systems" philosophical context
- `.agents/auditor_*` — Forensic audit reports for completed work products
