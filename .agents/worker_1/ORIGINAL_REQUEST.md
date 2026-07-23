## 2026-07-22T21:58:54Z
<USER_REQUEST>
You are Worker 1 operating in working directory `c:/Users/SOL/Desktop/Projet for Breeze/wesite/.agents/worker_1`.

Mission: Implement inline editing for Proof Badges text fields and add/apply Proof Background Opacity schema control.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Instructions & Specifications:

1. Modify `components/sections/shared.tsx`:
   - Update `Proof` component props to accept `valueTinaField?: string`, `labelTinaField?: string`, and `style?: React.CSSProperties`.
   - Apply `data-tina-field={valueTinaField}` to the `<strong className="...">` element containing `{value}`.
   - Apply `data-tina-field={labelTinaField}` to the `<span className="...">` element containing `{label}`.
   - Apply `style={style}` to the container `<div>`.

2. Modify `tina/config.ts`:
   - In the `hero` section template schema:
     - Add `proofBackgroundOpacity: 70` to `ui.defaultItem`.
     - Add the schema field under `fields`:
       ```ts
       {
         type: "number",
         name: "proofBackgroundOpacity",
         label: "Proof Background Opacity (%)",
       }
       ```

3. Modify `components/sections/hero.tsx`:
   - Add `proofBackgroundOpacity?: number` to `HeroProps` interface.
   - Add `proofBackgroundOpacity: 70` to `defaults` object.
   - Update `HeroProof` interface if needed so TinaCMS metadata properties are typed properly.
   - In `Hero` component body, calculate normalized opacity:
     ```ts
     const rawOpacity = typeof proofBackgroundOpacity === "number" && !isNaN(proofBackgroundOpacity)
       ? proofBackgroundOpacity
       : 70
     const opacityPct = rawOpacity <= 1 && rawOpacity > 0
       ? Math.round(rawOpacity * 100)
       : Math.min(100, Math.max(0, rawOpacity))
     ```
   - In the proof items map loop:
     - Pass `valueTinaField={tinaField(p, "value")}` and `labelTinaField={tinaField(p, "label")}` to `<Proof>`.
     - Remove hardcoded `bg-background/70` from card `className` and pass `style={{ backgroundColor: `color-mix(in srgb, var(--background) ${opacityPct}%, transparent)` }}` (or equivalent CSS background opacity dynamic style).

4. Verification:
   - Run `npx tsc --noEmit` via run_command.
   - Run `npm run lint` via run_command.
   - Run `npm run build` via run_command.

5. Document all changes and verification outputs in `c:/Users/SOL/Desktop/Projet for Breeze/wesite/.agents/worker_1/handoff.md` and `c:/Users/SOL/Desktop/Projet for Breeze/wesite/.agents/worker_1/changes.md`.

6. Send a message back to the orchestrator with your results and verification output.
</USER_REQUEST>
