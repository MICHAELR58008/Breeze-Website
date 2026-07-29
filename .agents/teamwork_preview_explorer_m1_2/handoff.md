# Handoff Report: Reference Section Components & Shared Header Analysis

## 1. Observation

Direct observations from examining the codebase at `c:/Users/SOL/Desktop/Projet for Breeze/wesite/components/`:

### Files Inspected:
- `components/sections/shared.tsx` (Lines 1-197) — Defines `Brand`, `Proof`, `StyledText`, and `SectionHeader`.
- `components/sections/services.tsx` (Lines 1-164) — Implements `Services` section component.
- `components/sections/process.tsx` (Lines 1-128) — Implements `Process` section component.
- `components/sections/testimonials.tsx` (Lines 1-78) — Implements `Testimonials` section component.
- `components/sections/contact.tsx` (Lines 1-122) — Implements `Contact` section component.
- `components/sections/about.tsx` (Lines 1-160) — Implements `About` section component.

### Verbatim Code Patterns:

#### A. Standard Section Wrapper Classes
1. **Container Alignment & Max-Width**: `mx-auto max-w-[1400px]`
2. **Responsive Section Padding**: `px-5 py-24 sm:px-8 lg:px-12 lg:py-32`
3. **Section Outer Border & Background Variants**:
   - **Default Transparent Section** (e.g. `services.tsx:58`, `contact.tsx:53`):
     ```tsx
     <section id="services" className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
     ```
   - **Full-Bleed Highlight Card Section** (e.g. `process.tsx:43-44`, `testimonials.tsx:34-35`):
     ```tsx
     <section id="process" className="border-y border-border bg-card">
       <div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
     ```

#### B. `SectionHeader` Component & Usage
Defined in `components/sections/shared.tsx` (Lines 117-196):
```tsx
export function SectionHeader(props: {
  eyebrow: string
  title: string
  copy: string
  tinaFields?: { eyebrow?: string; title?: string; copy?: string }
  /* CMS font, color, visibility overrides */
}) {
  const { eyebrow, title, copy, tinaFields, ... } = props
  const hasCopy = Boolean(copy && copy.trim())
  const hasEyebrow = Boolean(eyebrow && eyebrow.trim())

  return (
    <div className="grid gap-6 border-b border-border pb-10 lg:grid-cols-12 lg:items-end">
      <div className={hasCopy ? "lg:col-span-8" : "lg:col-span-12"}>
        {hasEyebrow && (
          <StyledText
            as="p"
            className="mb-5 font-mono text-xs uppercase tracking-[0.22em] text-primary"
            data-tina-field={tinaFields?.eyebrow}
          >
            {eyebrow}
          </StyledText>
        )}
        {title && (
          <StyledText
            as="h2"
            className="text-balance font-display text-5xl leading-none sm:text-7xl lg:text-8xl"
            data-tina-field={tinaFields?.title}
          >
            {title}
          </StyledText>
        )}
      </div>
      {hasCopy && (
        <StyledText
          as="p"
          className="text-pretty text-lg leading-relaxed text-muted-foreground lg:col-span-4"
          data-tina-field={tinaFields?.copy}
        >
          {copy}
        </StyledText>
      )}
    </div>
  )
}
```

Rendering usage in `services.tsx:59-81`, `process.tsx:45-67`, `testimonials.tsx:36-58`:
- `eyebrow`: `01 / Our services`, `02 / How it works`, `04 / Testimonials`
- `title`: `font-display text-5xl leading-none sm:text-7xl lg:text-8xl` with `text-balance`
- `copy`: `text-pretty text-lg leading-relaxed text-muted-foreground lg:col-span-4`
- Bottom border: `border-b border-border pb-10` connects seamlessly to card grids below.

#### C. Card Structure & Grid Patterns

1. **The 1px Border-Gap Grid Pattern (`bg-border` + `gap-px`)**:
   Used across `Services`, `Process`, and `Testimonials` grids to render sharp 1px grid borders matching `border-border`.
   - Grid Container: `grid gap-px border-x border-b border-border bg-border`
   - Individual Cards: `bg-card` (fills cell interior while 1px background gap forms grid lines).

2. **Exact Card Implementation Details**:

   - **Services Cards (`services.tsx:84-121`)**:
     - Grid: `grid gap-px border-x border-b border-border bg-border grid-cols-1 ${services.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`
     - Card Container: `<article className="flex flex-col bg-card p-6 sm:p-8">`
     - Eyebrow Subtitle: `font-mono text-xs uppercase tracking-wider text-primary`
     - Heading: `mt-4 font-display text-5xl`
     - List: `my-8 flex flex-col gap-3`, items: `flex gap-3 text-muted-foreground` with `Check` icon (`text-accent`)
     - CTA Button: `<Button className="mt-auto" variant="outline">Quote this service <ArrowRight data-icon="inline-end" /></Button>`
     - Add-ons Card: `border-x border-b border-border bg-card p-6 sm:p-8` with internal 3-column grid `sm:grid-cols-3` separated by `sm:border-r border-border/60`.

   - **Process Cards (`process.tsx:68-120`)**:
     - Grid: `grid gap-px border-x border-b border-border bg-border md:grid-cols-2 lg:grid-cols-4`
     - Card Container: `<article className="flex min-h-80 flex-col bg-card p-6">`
     - Number Badge: `font-mono text-xs uppercase tracking-wider text-primary`
     - Image Box / Media Slot: `relative my-4 flex h-36 w-full items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-muted/20`
       - Hover State on Image: `transition-transform duration-300 hover:scale-105`
     - Footer Content: `mt-auto`, title: `mb-2 text-xl font-medium text-foreground`, description: `text-sm leading-relaxed text-muted-foreground`.

   - **Testimonial Cards (`testimonials.tsx:59-74`)**:
     - Grid: `grid gap-px border border-border bg-border lg:grid-cols-3`
     - Card Container: `<figure className="flex min-h-64 flex-col justify-between bg-card p-6 sm:p-8">`
     - Rating Stars: `flex gap-1 text-accent` (`★★★★★`)
     - Quote: `text-pretty font-display text-2xl leading-snug`
     - Byline: `font-mono text-[10px] uppercase tracking-wider text-muted-foreground`

   - **Contact Rows (`contact.tsx:82-117`)**:
     - Structure: 12-column split (`lg:col-span-7` heading/CTA + `lg:col-span-5` detail rows).
     - Row items: `<StyledText as="a" className="flex items-center gap-4 border-b border-border py-5 text-muted-foreground transition-colors hover:text-foreground">`
     - Icon style: `<Icon className="size-5 text-primary" aria-hidden="true" />`

---

## 2. Logic Chain

1. **Section Outer Layouts**:
   - The design system establishes a strict container width convention (`max-w-[1400px] centered via `mx-auto`) and standardized responsive padding (`px-5 py-24 sm:px-8 lg:px-12 lg:py-32`).
   - Visual hierarchy between sections is created by toggling section backgrounds: standard sections use transparent backgrounds on the section element, while key feature or process sections use `className="border-y border-border bg-card"` on the full-bleed `<section>` element.

2. **Section Header Architecture**:
   - Shared component `SectionHeader` in `components/sections/shared.tsx` maintains visual consistency across `Services`, `Process`, and `Testimonials`.
   - Layout is built with `grid gap-6 border-b border-border pb-10 lg:grid-cols-12 lg:items-end`, creating an asymmetric 8:4 column split between Title (8 cols) and Description Copy (4 cols).
   - Typography uses distinct font families: `font-mono` (eyebrow with uppercase tracking `tracking-[0.22em]`), `font-display` (large section title `text-5xl sm:text-7xl lg:text-8xl`), and sans body font (`text-lg leading-relaxed text-muted-foreground`).

3. **Card Grid Architecture**:
   - The design avoids individual card gaps and floating borders, opting instead for a unified grid frame.
   - By applying `grid gap-px border-x border-b border-border bg-border` to the parent container and `bg-card` to each card child (`<article>` or `<figure>`), 1px borders seamlessly partition grid items.
   - Cards utilize flex layouts (`flex flex-col justify-between` or `mt-auto`) to ensure equal heights and aligned call-to-action buttons regardless of content length.
   - Micro-typography establishes hierarchy within cards: `font-mono text-xs uppercase tracking-wider text-primary` for eyebrows/numbers, `font-display` for prices/quotes/titles, and `text-muted-foreground` for body copy.

---

## 3. Caveats

- `contact.tsx` and `about.tsx` intentionally diverge from `SectionHeader` in order to support custom asymmetric side-by-side hero/contact layouts (e.g. 7-span text / 5-span info column layout).
- `StyledText` wraps text items to provide live TinaCMS position (`transform: translate`), font size, and color overrides. Standard section styling is defined by the default Tailwind classes passed as `className`.
- Responsive grid column counts vary by card density:
  - `Process`: `md:grid-cols-2 lg:grid-cols-4` (4 items)
  - `Services`: `lg:grid-cols-2` or `lg:grid-cols-3` depending on `services.length`
  - `Testimonials`: `lg:grid-cols-3` (3 items)

---

## 4. Conclusion

The reference section components follow a highly structured design system:
1. **Section Wrappers**: Standard `mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32`. Alternate sections apply full-bleed `border-y border-border bg-card`.
2. **Section Headers**: Unified through `SectionHeader` (`components/sections/shared.tsx`), rendering an 8/4 column layout on `lg:` viewports with `font-mono` eyebrow, `font-display` large heading, and `border-b border-border pb-10` bottom rule.
3. **Cards & Grids**: Border-gap pattern (`grid gap-px border-x border-b border-border bg-border`) with `bg-card` children, flex alignment (`flex flex-col justify-between`), `font-mono text-xs uppercase tracking-wider text-primary` eyebrow badges, and responsive column scaling (`lg:grid-cols-3` / `lg:grid-cols-4`).

---

## 5. Verification Method

To verify these patterns independently in the project root `c:/Users/SOL/Desktop/Projet for Breeze/wesite`:

1. **Inspect Shared Components**:
   - Run `view_file` on `components/sections/shared.tsx` lines 113-196 to verify `SectionHeader` structure.
2. **Inspect Section Wrappers & Grids**:
   - `components/sections/services.tsx`: Verify lines 58, 59-81, 84-86 (`gap-px bg-border`).
   - `components/sections/process.tsx`: Verify lines 43-44 (`border-y border-border bg-card`), 45-67 (`SectionHeader`), 68 (`gap-px bg-border`).
   - `components/sections/testimonials.tsx`: Verify lines 34-35 (`border-y border-border bg-card`), 36-58 (`SectionHeader`), 59 (`gap-px bg-border`).
   - `components/sections/contact.tsx`: Verify lines 53 (`mx-auto max-w-[1400px]`), 54 (`grid gap-12 lg:grid-cols-12`).
