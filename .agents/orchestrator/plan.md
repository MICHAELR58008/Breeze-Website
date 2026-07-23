# Task Execution Plan: Proof Badges Inline Editing & Opacity Control

## Overview
Enable inline editing for Proof Text fields and add background opacity control in TinaCMS for the Hero section.

## Milestones & Phases

### Milestone 1: Proof Badges Inline Editing & Opacity Control

#### Phase 1: Exploration & Blueprinting
- Dispatch 3 Explorers in parallel (`teamwork_preview_explorer`):
  - **Explorer 1** (`.agents/explorer_1`): Analyze `components/sections/shared.tsx` and `components/sections/hero.tsx` for proof component rendering, props, and existing `tinaField` / `data-tina-field` pattern usage.
  - **Explorer 2** (`.agents/explorer_2`): Analyze `tina/config.ts` hero section schema and how opacity / style fields are defined in TinaCMS schemas in this codebase.
  - **Explorer 3** (`.agents/explorer_3`): Synthesize exact file changes required across `components/sections/shared.tsx`, `components/sections/hero.tsx`, and `tina/config.ts`, including typescript interfaces and default opacity values.

#### Phase 2: Implementation & Verification
- Dispatch Worker (`teamwork_preview_worker` in `.agents/worker_1`):
  - Modify `components/sections/shared.tsx` to pass/apply `data-tina-field` attributes to value and label.
  - Modify `tina/config.ts` to add Proof Background Opacity field to hero section schema.
  - Modify `components/sections/hero.tsx` to pass tinaField metadata for value/label and apply dynamic opacity styling.
  - Run verification tests: `npx tsc --noEmit`, `npm run lint`, `npm run build`.

#### Phase 3: Independent Code Review
- Dispatch 2 Reviewers (`teamwork_preview_reviewer` in `.agents/reviewer_1` and `.agents/reviewer_2`):
  - Review code changes against requirements R1 and R2.
  - Run `npx tsc --noEmit`, `npm run lint`, and `npm run build`.

#### Phase 4: Adversarial Stress Testing
- Dispatch 2 Challengers (`teamwork_preview_challenger` in `.agents/challenger_1` and `.agents/challenger_2`):
  - Empirically verify correctness, type safety, dynamic styling fallback handling, and edge cases.

#### Phase 5: Forensic Integrity Audit
- Dispatch Forensic Auditor (`teamwork_preview_auditor` in `.agents/auditor_1`):
  - Perform static analysis, git diff check, runtime build verification, and integrity check to ensure genuine non-hardcoded implementation.

#### Phase 6: Final Synthesis & Victory Claim
- Verify clean audit verdict.
- Report completion and victory claim to parent.
