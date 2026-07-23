# Original User Request

## 2026-07-22T21:57:46Z

Fix the "Proof Badges" in the Hero section so editors can click to edit the individual text fields inline and adjust their background opacity via TinaCMS.

Working directory: c:/Users/SOL/Desktop/Projet for Breeze/wesite
Integrity mode: development

## Requirements

### R1. Enable Inline Editing for Proof Text
Update the `Proof` component (`components/sections/shared.tsx`) and the `Hero` component (`components/sections/hero.tsx`) to pass and apply `data-tina-field` attributes to the individual `value` (e.g., "24 hr") and `label` (e.g., "RESPONSE TIME") text elements so they are directly clickable in the TinaCMS visual editor.

### R2. Add Opacity Control for Proof Backgrounds
Update the Hero section schema in `tina/config.ts` to include a new number field for "Proof Background Opacity". Update `components/sections/hero.tsx` to apply this opacity dynamically to the proof badges container or items, replacing the hardcoded `bg-background/70` / `bg-white/20` classes with the dynamic style.

## Acceptance Criteria

### Editing Capabilities
- [ ] In the TinaCMS visual editor, clicking on the text of any proof badge (e.g., "24 hr" or "RESPONSE TIME") focuses that specific field for inline editing.
- [ ] A new slider/number field exists in the TinaCMS sidebar to control the background opacity of the proof badges, and changing it updates the live preview immediately.

### Stack-Specific Verification Tests
- [ ] `npx tsc --noEmit` completes with 0 type errors.
- [ ] `npm run lint` passes without errors.
- [ ] `npm run build` completes successfully.
