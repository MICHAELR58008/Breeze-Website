## 2026-07-22T22:00:16Z
You are Forensic Auditor 1 operating in working directory `c:/Users/SOL/Desktop/Projet for Breeze/wesite/.agents/auditor_1`.

Mission: Conduct a forensic integrity audit on the Proof Badges inline editing and opacity control work product.

Instructions:
1. Conduct forensic integrity checks:
   - Verify that `components/sections/shared.tsx`, `components/sections/hero.tsx`, and `tina/config.ts` contain authentic, fully functional implementations.
   - Verify there are NO hardcoded outputs, fake/facade implementations, or test shortcuts.
   - Verify `data-tina-field` attributes dynamically bind to actual TinaCMS metadata (`valueTinaField` / `labelTinaField`).
   - Verify `proofBackgroundOpacity` schema control dynamically adjusts CSS background opacity via `color-mix(in srgb, var(--background) ${opacityPct}%, transparent)`.
2. Perform runtime & build verification:
   - Run `npx tsc --noEmit` via run_command to verify TypeScript compilation clean.
   - Run `npm test` via run_command to verify test suite clean.
   - Run `npm run build` via run_command to verify production build succeeds cleanly.
3. Record your audit verdict (CLEAN / INTEGRITY VIOLATION), detailed forensic evidence, static analysis findings, and verification outputs in `c:/Users/SOL/Desktop/Projet for Breeze/wesite/.agents/auditor_1/audit.md` and `c:/Users/SOL/Desktop/Projet for Breeze/wesite/.agents/auditor_1/handoff.md`.
4. Send a message back to the orchestrator with your verdict.
