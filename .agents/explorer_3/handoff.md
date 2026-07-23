# Handoff Report: Proof Badges Inline Editing & Dynamic Opacity Styling

## 1. Observation
- **`components/sections/shared.tsx`**:
  - `Proof` component currently signature is: `export function Proof({ value, label, className = "" }: { value: string; label: string; className?: string })`.
  - Inner tags `<strong className="block font-display text-2xl font-normal">{value}</strong>` and `<span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>` lack `data-tina-field` attributes.
  - The component root `<div className={`bg-background p-4 ${className}`}>` does not accept an inline `style` prop.
- **`components/sections/hero.tsx`**:
  - Line 177: `<div data-tina-field={tinaField(props, "proofs")} className="grid grid-cols-2 gap-px border border-white/20 bg-white/20 sm:grid-cols-3">`.
  - Lines 179-184: `Proof` components are rendered inside `.map()` with `className={`${i === proofs.length - 1 ? "col-span-2 sm:col-span-1" : ""} bg-background/70 text-white backdrop-blur-sm`}`.
  - `HeroProps` and `defaults` do not declare `proofBackgroundOpacity`.
  - Individual proof array elements `p` are not bound with `tinaField(p, "value")` or `tinaField(p, "label")`.
- **`tina/config.ts`**:
  - Hero template fields (lines 76-114) contain `proofs` list object with `value` and `label` fields, but do not contain `proofBackgroundOpacity` field.
  - Hero template `defaultItem` (lines 59-75) does not include `proofBackgroundOpacity`.

## 2. Logic Chain
1. To enable TinaCMS inline click-to-edit capability on individual proof values and labels, `data-tina-field` attributes must be attached to the `<strong ...>` and `<span ...>` DOM elements inside the `Proof` component in `components/sections/shared.tsx`.
2. TinaCMS's `tinaField(p, "value")` helper evaluates the attribute string for element `p` in array `proofs`. Passing `valueTinaField={tinaField(p, "value")}` and `labelTinaField={tinaField(p, "label")}` from `hero.tsx` into `<Proof>` allows exact element editing.
3. Adding `proofBackgroundOpacity` (number) to `tina/config.ts` hero schema allows CMS users to edit background opacity via admin UI.
4. To replace hardcoded `bg-background/70` in `hero.tsx`, we compute `opacityPct` from `proofBackgroundOpacity` with fallbacks (`proofBackgroundOpacity ?? 70`), and apply inline style `backgroundColor: color-mix(in srgb, var(--background) ${opacityPct}%, transparent)` to `<Proof>`.

## 3. Caveats
- If `proofBackgroundOpacity` is supplied as a decimal (e.g. `0.7`) instead of an integer percentage (e.g. `70`), the sanitization logic in `hero.tsx` must convert `0.7` to `70%` (`0.7 * 100`) so CSS `color-mix` receives valid percentage values.
- `bg-background` class on `<Proof>` in `shared.tsx` sets `background-color: var(--background)`. Passing `style={{ backgroundColor: color-mix(...) }}` overrides `background-color` via CSS specificity on inline styles.

## 4. Conclusion
All required changes are fully scoped and documented:
1. `components/sections/shared.tsx`:
   - Extend `Proof` props to accept `style?: React.CSSProperties`, `valueTinaField?: string`, `labelTinaField?: string`.
   - Add `data-tina-field` attributes to value and label elements and `style` to container div.
2. `tina/config.ts`:
   - Add `proofBackgroundOpacity: 70` to `defaultItem`.
   - Add `proofBackgroundOpacity` field definition (type `number`) under `hero` section fields.
3. `components/sections/hero.tsx`:
   - Add `proofBackgroundOpacity?: number` to `HeroProps` and `defaults`.
   - Compute `opacityPct` with fallback handling (`proofBackgroundOpacity ?? 70`).
   - Remove hardcoded `bg-background/70` from card `className`.
   - Pass `valueTinaField={tinaField(p, "value")}`, `labelTinaField={tinaField(p, "label")}`, and `style={{ backgroundColor: `color-mix(in srgb, var(--background) ${opacityPct}%, transparent)` }}` to `<Proof>`.

## 5. Verification Method
- **Static Analysis / Type Check**: Run `npx tsc --noEmit` to verify type safety of `HeroProps` and `ProofProps`.
- **Lint Check**: Run `npm run lint` to ensure no linting errors.
- **Build Verification**: Run `npm run build` to confirm Next.js build passes.
- **Visual / DOM Verification**: Check HTML output in browser/editor to confirm `data-tina-field` attributes are populated on `<strong>` and `<span>` elements and `style="background-color: color-mix(...)"` is applied on proof badge containers.
