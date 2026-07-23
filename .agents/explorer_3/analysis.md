# Proof Badges Inline Editing & Dynamic Opacity Styling Blueprint

## Executive Summary
This document provides the blueprint for enabling TinaCMS visual inline editing for individual Proof Badge items (values and labels) and applying dynamic background opacity styling across `components/sections/shared.tsx`, `components/sections/hero.tsx`, and `tina/config.ts`.

---

## 1. Overview of File Modifications & Components

### 1.1 `components/sections/shared.tsx` (Proof Component)
- **Current state**: `Proof` accepts `value`, `label`, and `className`. It applies fixed class `bg-background p-4 ${className}`. It does not accept inline `style` or `data-tina-field` attributes for inner elements.
- **Required changes**:
  - Define `ProofProps` interface accepting `value`, `label`, `className`, `style`, `valueTinaField`, and `labelTinaField`.
  - Apply `data-tina-field={valueTinaField}` on `<strong ...>` tag.
  - Apply `data-tina-field={labelTinaField}` on `<span ...>` tag.
  - Apply `style={style}` on the root card `<div>`.

```tsx
export interface ProofProps {
  value: string
  label: string
  className?: string
  style?: React.CSSProperties
  valueTinaField?: string
  labelTinaField?: string
}

export function Proof({
  value,
  label,
  className = "",
  style,
  valueTinaField,
  labelTinaField,
}: ProofProps) {
  return (
    <div className={`bg-background p-4 ${className}`} style={style}>
      <strong className="block font-display text-2xl font-normal" data-tina-field={valueTinaField}>
        {value}
      </strong>
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground" data-tina-field={labelTinaField}>
        {label}
      </span>
    </div>
  )
}
```

### 1.2 `tina/config.ts` (TinaCMS Schema)
- **Current state**: `hero` template has `proofs` list field with `value` and `label` subfields. It lacks a control for proof badge background opacity.
- **Required changes**:
  - Add `proofBackgroundOpacity: 70` to `defaultItem` in the `hero` template schema.
  - Add a new field definition under `hero` fields:
```ts
{
  type: "number",
  name: "proofBackgroundOpacity",
  label: "Proof Background Opacity (%)",
  description: "Background opacity percentage for proof badge cards (0 to 100)",
}
```

### 1.3 `components/sections/hero.tsx` (Hero Section Component)
- **Current state**:
  - `HeroProps` missing `proofBackgroundOpacity`.
  - `defaults` missing `proofBackgroundOpacity`.
  - Proof items mapped without `tinaField` bindings for individual `value` and `label`.
  - Hardcoded `bg-background/70` in card `className`.
- **Required changes**:
  - Add `proofBackgroundOpacity?: number` to `HeroProps`.
  - Add `proofBackgroundOpacity: 70` to `defaults`.
  - Destructure `proofBackgroundOpacity` in `Hero`.
  - Implement robust opacity sanitization logic.
  - Remove hardcoded `bg-background/70` from card `className` and pass dynamic `style={{ backgroundColor: color-mix(...) }}` or `style={{ backgroundColor: ... }}`.
  - Pass `valueTinaField={tinaField(p, "value")}` and `labelTinaField={tinaField(p, "label")}` to `<Proof>`.

```tsx
const rawOpacity = typeof proofBackgroundOpacity === "number" && !isNaN(proofBackgroundOpacity)
  ? proofBackgroundOpacity
  : 70

const opacityPct = rawOpacity <= 1 && rawOpacity > 0
  ? Math.round(rawOpacity * 100)
  : Math.min(100, Math.max(0, rawOpacity))
```

---

## 2. Dynamic Opacity Styling Strategy & Comparison

### Analysis of Opacity Application Methods
1. **CSS `color-mix` with Theme Variable (Recommended)**:
   - Expression: `backgroundColor: color-mix(in srgb, var(--background) ${opacityPct}%, transparent)`
   - **Pros**:
     - Dynamically mixes `--background` with transparency based on `opacityPct`.
     - Preserves design token dark/light mode compatibility (`var(--background)` defined in `@theme inline` / `globals.css`).
     - Only affects background opacity, keeping badge text crisp and fully opaque (unlike element-level `opacity: 0.7`).
     - Matches native Tailwind v4 `bg-background/70` rendering mechanics.

2. **Tailwind Arbitrary Classes (`bg-background/[${opacityDecimal}]`)**:
   - **Cons**: Tailwind cannot purge or dynamically compile arbitrary dynamic string interpolated classes at runtime unless fully static.

3. **Element-level `opacity: opacityDecimal`**:
   - **Cons**: Reduces opacity of inner text elements (`strong` and `span`), making copy faint and hard to read.

---

## 3. Fallback and Default Value Handling

To prevent layout/rendering failures when `proofBackgroundOpacity` is `undefined`, `null`, or invalid:
1. **Schema Layer**: `tina/config.ts` sets `proofBackgroundOpacity: 70` in `defaultItem`.
2. **Prop Defaults Layer**: `hero.tsx` sets `proofBackgroundOpacity: 70` in `defaults`.
3. **Runtime Sanitization Layer**:
   - If value is `undefined`, `null`, or `NaN` -> defaults to `70`.
   - Supports both percentage scale (`0`–`100`) and decimal scale (`0.0`–`1.0`): if `rawOpacity <= 1` (and `> 0`), converts to percentage (`rawOpacity * 100`).
   - Clamps value strictly to range `[0, 100]`.

---

## 4. End-to-End Data Flow

```
[TinaCMS Visual Editor / Page Content (page.json)]
                       │
                       ▼
            [tina/config.ts Schema]
 (Defines proofBackgroundOpacity & proofs list)
                       │
                       ▼
          [hero.tsx (Hero Component)]
 ├─ Merges props with defaults (default: 70)
 ├─ Sanitizes rawOpacity -> opacityPct
 ├─ Maps proofs list:
 │   ├─ tinaField(p, "value") -> valueTinaField
 │   ├─ tinaField(p, "label") -> labelTinaField
 │   └─ Formats style: { backgroundColor: `color-mix(...)` }
                       │
                       ▼
         [shared.tsx (Proof Component)]
 ├─ Receives valueTinaField & labelTinaField
 ├─ <strong data-tina-field={valueTinaField}>{value}</strong>
 └─ <span data-tina-field={labelTinaField}>{label}</span>
```
