# Detailed Technical Analysis: TinaCMS Inline Editing for Proof Badges

## Executive Summary
This report presents a complete technical analysis for enabling TinaCMS visual editor inline editing on Proof Badges text fields (`value` and `label`) within `components/sections/shared.tsx` and `components/sections/hero.tsx`.

Currently, TinaCMS visual editing for proof badges is incomplete: while the outer container grid in `hero.tsx` has `data-tina-field={tinaField(props, "proofs")}`, individual proof badge cards and their internal `value` (`<strong>`) and `label` (`<span>`) DOM elements lack `data-tina-field` attributes. As a result, clicking directly on "24 hr" or "Response time" in the visual preview iframe fails to focus the corresponding form field in the TinaCMS editing sidebar or inline overlay.

---

## 1. Schema & Data Flow Context

### TinaCMS Schema (`tina/config.ts`)
Lines 84–93 in `tina/config.ts`:
```ts
{
  type: "object",
  name: "proofs",
  label: "Proof Badges",
  list: true,
  fields: [
    { type: "string", name: "value" },
    { type: "string", name: "label" },
  ],
}
```
When queried via TinaCMS (e.g. `useTina`), TinaCMS injects `_content_source` metadata into the query result tree:
- Section object (`props`): `_content_source = { queryId: "<QID>", path: ["page", "sections", 0] }`
- Array field (`props.proofs`): array of `HeroProof` items.
- Item `p` (at index `i`): `p._content_source = { queryId: "<QID>", path: ["page", "sections", 0, "proofs", i] }`

### TinaCMS Helper (`tinaField`) Behavior
As defined in `@tinacms/bridge/tina-field.js`:
- `tinaField(p)` -> `${queryId}---page.sections.0.proofs.${i}`
- `tinaField(p, "value")` -> `${queryId}---page.sections.0.proofs.${i}.value`
- `tinaField(p, "label")` -> `${queryId}---page.sections.0.proofs.${i}.label`

If `p` is undefined or lacks `_content_source` (e.g. static fallback data), `tinaField` safely returns `""`.

---

## 2. Current Implementation Breakdown & Deficiencies

### A. `components/sections/shared.tsx` (Lines 17–24)
```tsx
export function Proof({ value, label, className = "" }: { value: string; label: string; className?: string }) {
  return (
    <div className={`bg-background p-4 ${className}`}>
      <strong className="block font-display text-2xl font-normal">{value}</strong>
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  )
}
```
**Deficiencies**:
1. Prop signature only accepts `{ value: string; label: string; className?: string }`.
2. No `data-tina-field` attribute on `<div className="...">` (container item).
3. No `data-tina-field` attribute on `<strong className="...">` (`value` text element).
4. No `data-tina-field` attribute on `<span className="...">` (`label` text element).

### B. `components/sections/hero.tsx` (Lines 10–13, 177–186)
```tsx
export interface HeroProof {
  value: string
  label: string
}
```
```tsx
<div data-tina-field={tinaField(props, "proofs")} className="grid grid-cols-2 gap-px border border-white/20 bg-white/20 sm:grid-cols-3">
  {proofs?.map((p, i) => (
    <Proof
      key={p.label}
      value={p.value}
      label={p.label}
      className={`${i === proofs.length - 1 ? "col-span-2 sm:col-span-1" : ""} bg-background/70 text-white backdrop-blur-sm`}
    />
  ))}
</div>
```
**Deficiencies**:
1. `HeroProof` interface lacks an index signature (`[key: string]: any`), preventing TypeScript from permitting extra properties such as `_content_source` or passing `p` to helpers.
2. `Proof` call does not pass `proof={p}` or `tinaFields` bindings down to `Proof`.

---

## 3. Recommended Solution & Proposed Code Changes

### Design Strategy
We enhance `<Proof>` in `shared.tsx` to accept an optional `proof` item object (or explicit `tinaFields` mapping) while remaining 100% backward compatible with non-CMS usage.

#### 1. Changes to `components/sections/shared.tsx`
Add `tinaField` import from `tinacms/dist/tina-field` and update `Proof` prop signature & JSX:

```tsx
import { tinaField } from "tinacms/dist/tina-field"

export interface ProofTinaFields {
  container?: string
  value?: string
  label?: string
}

export function Proof({
  value,
  label,
  className = "",
  proof,
  tinaFields,
}: {
  value: string
  label: string
  className?: string
  proof?: Record<string, any>
  tinaFields?: ProofTinaFields
}) {
  const containerField = tinaFields?.container ?? (proof ? tinaField(proof) : undefined)
  const valueField = tinaFields?.value ?? (proof ? tinaField(proof, "value") : undefined)
  const labelField = tinaFields?.label ?? (proof ? tinaField(proof, "label") : undefined)

  return (
    <div className={`bg-background p-4 ${className}`} data-tina-field={containerField}>
      <strong className="block font-display text-2xl font-normal" data-tina-field={valueField}>
        {value}
      </strong>
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground" data-tina-field={labelField}>
        {label}
      </span>
    </div>
  )
}
```

#### 2. Changes to `components/sections/hero.tsx`
Update `HeroProof` interface and `<Proof>` render loop:

```tsx
export interface HeroProof {
  value: string
  label: string
  [key: string]: any
}
```
```tsx
<div data-tina-field={tinaField(props, "proofs")} className="grid grid-cols-2 gap-px border border-white/20 bg-white/20 sm:grid-cols-3">
  {proofs?.map((p, i) => (
    <Proof
      key={p.label || i}
      value={p.value}
      label={p.label}
      proof={p}
      className={`${i === proofs.length - 1 ? "col-span-2 sm:col-span-1" : ""} bg-background/70 text-white backdrop-blur-sm`}
    />
  ))}
</div>
```

---

## 4. Verification Plan
1. **Unit Test Verification**: Run `npx vitest run components/sections/hero.test.tsx` to verify existing tests pass without regressions.
2. **DOM Attribute Inspection**:
   - When rendered with TinaCMS metadata:
     - Root proof card container has `data-tina-field="<queryId>---page.sections.0.proofs.0"`.
     - `<strong>` has `data-tina-field="<queryId>---page.sections.0.proofs.0.value"`.
     - `<span>` has `data-tina-field="<queryId>---page.sections.0.proofs.0.label"`.
   - When rendered without TinaCMS metadata (static or default props):
     - `data-tina-field` evaluates to `""` or `undefined`, preventing DOM errors or broken rendering.
