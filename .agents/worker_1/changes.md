# Summary of Changes

## 1. `components/sections/shared.tsx`
- Updated `Proof` component signature to accept `valueTinaField?: string`, `labelTinaField?: string`, and `style?: React.CSSProperties`.
- Applied `data-tina-field={valueTinaField}` to `<strong className="...">` containing `{value}`.
- Applied `data-tina-field={labelTinaField}` to `<span className="...">` containing `{label}`.
- Applied `style={style}` to the container `<div>`.

## 2. `tina/config.ts`
- Added `proofBackgroundOpacity: 70` to `ui.defaultItem` under the `hero` section template schema.
- Added field `{ type: "number", name: "proofBackgroundOpacity", label: "Proof Background Opacity (%)" }` to `hero` schema `fields`.

## 3. `components/sections/hero.tsx`
- Added `[key: string]: any` to `HeroProof` interface so TinaCMS metadata attached to proof objects is typed properly.
- Added `proofBackgroundOpacity?: number` to `HeroProps` interface.
- Added `proofBackgroundOpacity: 70` to `defaults` object.
- Extracted and normalized `proofBackgroundOpacity` into `opacityPct` within `Hero` component:
  ```ts
  const rawOpacity = typeof proofBackgroundOpacity === "number" && !isNaN(proofBackgroundOpacity)
    ? proofBackgroundOpacity
    : 70
  const opacityPct = rawOpacity <= 1 && rawOpacity > 0
    ? Math.round(rawOpacity * 100)
    : Math.min(100, Math.max(0, rawOpacity))
  ```
- Updated Proof badges rendering loop:
  - Passed `valueTinaField={tinaField(p, "value")}` and `labelTinaField={tinaField(p, "label")}`.
  - Removed hardcoded `bg-background/70` from card `className`.
  - Applied dynamic background opacity via `style={{ backgroundColor: `color-mix(in srgb, var(--background) ${opacityPct}%, transparent)` }}`.

## 4. `components/sections/hero.test.tsx`
- Added unit tests for dynamic `proofBackgroundOpacity` styling and `valueTinaField`/`labelTinaField` data attributes when rendering Proof components with TinaCMS metadata.
