# Explorer 2 Handoff Report: Hero Proof Background Opacity Schema Control

## 1. Observation
- **File Examined**: `tina/config.ts` (lines 53–114)
  - Hero template defined at line 55 with `defaultItem` (lines 59–74) and `fields` array (lines 76–114).
  - Standard numeric fields are defined as `{ type: "number", name: "<fieldName>", label: "<Label>" }` (e.g. `locationSize`, `headingLine1X`, `headingLine1Y`, `headingLine1Size`, `subheadingSize`).
- **File Examined**: `components/sections/hero.tsx` (lines 10–191)
  - `HeroProps` interface (lines 15–45) defines section props.
  - `defaults` object (lines 47–62) provides default values.
  - Line 183 hardcodes badge styling as `className={`${i === proofs.length - 1 ? "col-span-2 sm:col-span-1" : ""} bg-background/70 text-white backdrop-blur-sm`}`.
- **File Examined**: `components/sections/shared.tsx` (lines 17–24)
  - `Proof` component defined as `export function Proof({ value, label, className = "" }: { value: string; label: string; className?: string })`.
- **File Examined**: `content/page/page.json` (lines 2–35)
  - Existing Hero JSON block lacks `proofBgOpacity`.

---

## 2. Logic Chain
1. **Schema Consistency**: Across `tina/config.ts`, numerical controls (font sizes, X/Y offsets) use `{ type: "number", name: "...", label: "..." }`. Therefore, "Proof Background Opacity" should be added as `{ type: "number", name: "proofBgOpacity", label: "Proof Background Opacity (%)" }`.
2. **Default Value Selection**: The current JSX styling in `components/sections/hero.tsx` uses `bg-background/70` (70% opacity). Setting `proofBgOpacity: 70` in `ui.defaultItem` and `Hero` defaults preserves visual design parity out of the box.
3. **Prop Propagation & Fallback**:
   - Adding `proofBgOpacity?: number` to `HeroProps` interface in `hero.tsx`.
   - Adding `proofBgOpacity: 70` to `defaults` in `hero.tsx`.
   - In `hero.tsx`, computing `const opacityVal = typeof proofBgOpacity === "number" ? proofBgOpacity / 100 : 0.7`.
   - Applying `style={{ backgroundColor: `hsl(var(--background) / ${opacityVal})` }}` to `Proof` badge instances (removing hardcoded `bg-background/70`).

---

## 3. Caveats
- **Read-Only Scope**: Source code files (`tina/config.ts`, `components/sections/hero.tsx`, `components/sections/shared.tsx`, `content/page/page.json`) were NOT modified during this investigation.
- **Opacity Unit Assumption**: Using a 0–100 integer range (percentage) is recommended for editor UX in Tina CMS UI rather than a 0–1 float, as percentage values match intuitive user input.
- **Shared Component Interface**: If `Proof` in `components/sections/shared.tsx` is passed a `style` prop, its prop type definition should support `style?: React.CSSProperties`.

---

## 4. Conclusion
The "Proof Background Opacity" schema control can be seamlessly added to the Hero section schema in `tina/config.ts` and integrated into `components/sections/hero.tsx`.
- **Schema Field**:
  ```ts
  {
    type: "number",
    name: "proofBgOpacity",
    label: "Proof Background Opacity (%)",
  }
  ```
- **Default Item Value**: `proofBgOpacity: 70`
- **React Prop**: `proofBgOpacity?: number` (defaults to `70`)
- **Rendering**: Inline `style={{ backgroundColor: \`hsl(var(--background) / \${(proofBgOpacity ?? 70) / 100})\` }}` on `Proof` components in `hero.tsx`.

Detailed analysis and complete diff patch proposals are available in `c:/Users/SOL/Desktop/Projet for Breeze/wesite/.agents/explorer_2/analysis.md`.

---

## 5. Verification Method
1. **Code Inspection**:
   - Inspect `tina/config.ts` under `hero` template `fields` to confirm `proofBgOpacity` field object is present.
   - Inspect `components/sections/hero.tsx` to confirm `proofBgOpacity` is included in `HeroProps`, `defaults`, destructuring, and `Proof` inline styling.
2. **Tina CMS Admin Verification**:
   - Start local dev server (`npm run dev` / `npx tinacms dev`).
   - Navigate to `/admin` -> `Page` collection -> `Hero` section.
   - Verify that `Proof Background Opacity (%)` input appears in the left panel sidebar under Hero section fields.
3. **Visual Verification**:
   - Change `Proof Background Opacity (%)` from `70` to `20` or `100` in Tina CMS sidebar.
   - Observe live visual change in proof badge background translucency/opacity on the hero section preview.
