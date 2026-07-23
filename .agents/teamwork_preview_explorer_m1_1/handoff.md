# Handoff Report: Booking Pricing Schema Analysis & Migration Plan

## 1. Observation

- **`tina/config.ts` (lines 276–292)**:
  ```typescript
  {
    type: "object",
    name: "prices",
    label: "Prices",
    list: true,
    ui: { ... },
    fields: [
      { type: "string", name: "key" },
      { type: "string", name: "bedrooms" },
      { type: "string", name: "bathrooms" },
      { type: "number", name: "cents" },
    ],
  }
  ```
- **`content/booking/booking.json` (lines 3–76)**:
  - `deep`: `prices` array contains `"1-1"` (18000), `"2-2"` (22000), `"3-3"` (29000).
  - `regular`: `prices` array contains `"1-1"` (13500), `"2-2"` (15000), `"3-3"` (18000).
  - `Commercial `: ID `"Commercial "`, features `["1"]`, no `prices` array present.
- **`lib/pricing.ts` (lines 70–91)**:
  - `calculateEstimate` looks up matrix key `${bedrooms}-${bathrooms}` in `svc.prices`. If missing (e.g. 2 beds, 1 bath), it returns `null`.

## 2. Logic Chain

1. **Problem Identification**: Matrix lookup causes missing estimate entries for non-matching room counts (e.g., 2 bed / 1 bath returns `null`). Content editing in TinaCMS requires managing array items per room pair.
2. **Schema Solution (R1)**: Replacing `prices` array on `services` with 3 scalar number fields (`basePriceCents`, `pricePerBedroomCents`, `pricePerBathroomCents`) enables continuous linear calculation: $\text{Base} + (\text{Bedrooms} \times \text{PerBed}) + (\text{Bathrooms} \times \text{PerBath})$.
3. **Data Calibration (R3)**:
   - For `deep`: Base 13000 ($130), Bed 2000 ($20), Bath 3000 ($30) yields $180 for 1-1 (exact match), $230 for 2-2 (close to $220), $280 for 3-3 (close to $290).
   - For `regular`: Base 11000 ($110), Bed 1000 ($10), Bath 1500 ($15) yields $135 for 1-1 (exact match), $160 for 2-2 (close to $150), $185 for 3-3 (close to $180).
   - For `Commercial `: Base 0, Bed 0, Bath 0 (since commercial clean bypasses room count selection and requires custom quote).

## 3. Caveats

- **Linear Approximation**: Replacing discrete matrix entries with a linear model ($A + B \times \text{beds} + C \times \text{baths}$) slightly alters non-1-1 prices (e.g., Deep 2-2 becomes $230 vs $220 prior; Regular 2-2 becomes $160 vs $150 prior), but ensures smooth scaling for all room combinations (1..10 beds/baths).
- **TypeScript & Tina Client Regeneration**: Editing `tina/config.ts` will require running the Tina CMS build process to update auto-generated GraphQL schema and TypeScript definitions (`tina/__generated__/`).

## 4. Conclusion

The exact schema modifications for `tina/config.ts` (R1) and data migration changes for `content/booking/booking.json` (R3) have been fully formulated and documented in `analysis.md`. The design cleanly removes matrix lookup complexity while enabling universal linear price calculations across all bedroom and bathroom count inputs.

## 5. Verification Method

1. **Schema Verification**: Inspect `tina/config.ts` to confirm `prices` object field is removed from `services.fields` and `basePriceCents`, `pricePerBedroomCents`, `pricePerBathroomCents` are added.
2. **Content Verification**: Validate `content/booking/booking.json` using `npm run build` or `JSON.parse` to ensure valid JSON syntax and correct field structure across all service objects (`deep`, `regular`, `Commercial `).
3. **Calculation Verification**: Run pricing tests or check `calculateEstimate("deep", 1, 1, [])` = `18000`, `calculateEstimate("regular", 1, 1, [])` = `13500`.
