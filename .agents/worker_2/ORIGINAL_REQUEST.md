## 2026-07-22T00:57:50Z
You are Worker 2 (worker_2) tasked with hardening estimate calculation logic and unifying its usage.
Working directory: c:\Users\SOL\Desktop\Projet for Breeze\wesite\.agents\worker_2
Project root: c:\Users\SOL\Desktop\Projet for Breeze\wesite

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Tasks:
1. In lib/pricing.ts, update calculateEstimate():
   - Check if (!priceEntry || typeof priceEntry.cents !== "number") return null; before summing prices, preventing potential NaN outputs when cents is missing.
2. In components/booking/booking-drawer.tsx:
   - Import calculateEstimate from @/lib/pricing.
   - Update const estimate = useMemo(...) to use calculateEstimate(formData.serviceType, formData.bedrooms || 1, formData.bathrooms || 1, Array.isArray(formData.addOns) ? formData.addOns : [], servicesList, addOnsList).
3. Run npx tsc --noEmit and npm run build to verify zero type errors and clean compilation.
4. Write changes log to c:\Users\SOL\Desktop\Projet for Breeze\wesite\.agents\worker_2\changes.md and handoff to c:\Users\SOL\Desktop\Projet for Breeze\wesite\.agents\worker_2\handoff.md.
5. Send a message to parent when complete.
