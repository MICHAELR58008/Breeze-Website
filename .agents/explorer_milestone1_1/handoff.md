# Handoff Report: Explorer 1 (milestone1)

## 1. Observation

- **Target File**: `components/booking/booking-drawer.tsx`
- **Navigation Controls & Key Props** (lines 760–777):
  ```tsx
  {stepIndex < totalSteps - 1 ? (
    <Button
      type="button"
      onClick={() => setStepIndex(stepIndex + 1)}
      data-tina-field={rawBooking ? tinaField(rawBooking.navigation, "continue") : undefined}
    >
      {content.navigation.continue} <ArrowRight data-icon="inline-end" />
    </Button>
  ) : (
    <Button
      type="submit"
      disabled={submitting}
      data-tina-field={rawBooking ? tinaField(rawBooking.navigation, "submit") : undefined}
    >
      {submitting ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Check data-icon="inline-start" />}
      {content.navigation.submit}
    </Button>
  )}
  ```
  Neither `<Button type="button">` nor `<Button type="submit">` has a React `key` prop.

- **Form Submission Handler & Guard** (lines 239–243, 334):
  ```tsx
  <form onSubmit={submit} className="flex min-h-[calc(100vh-140px)] flex-col" style={{ pointerEvents: "auto" }}>
  ```
  ```tsx
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (stepIndex < totalSteps - 1) {
      return
    }
    if (submitting) return
    setSubmitting(true)
    ...
  ```
  On lines 241–243, `if (stepIndex < totalSteps - 1) return` returns early for steps `0` through `totalSteps - 2`. When `stepIndex === totalSteps - 1`, the guard condition evaluates to `false` and does not return early.

- **Step Filtering & Total Steps Calculation** (lines 184–203):
  `steps` array length (`totalSteps`) is computed dynamically based on `formData[step.showIfField]` (e.g. selecting "Commercial Clean" dynamically skips the Home step, reducing total steps).

---

## 2. Logic Chain

1. **Premise 1 (Observation 1)**: The Continue button (`type="button"`) and Submit button (`type="submit"`) are conditionally rendered at the exact same location in the JSX tree without explicit React `key` props.
2. **Premise 2 (React Reconciliation Rules)**: When React reconciles conditional elements of the same component type (`Button`) at the same position without unique `key` props, it reuses the existing DOM node (`<button>`) and updates its attributes (`type="button"` → `type="submit"`).
3. **Premise 3 (Observation 2)**: When user clicks "Continue" on step `totalSteps - 2`, `setStepIndex(stepIndex + 1)` updates `stepIndex` to `totalSteps - 1` (the final Review step).
4. **Premise 4 (Event Bleeding / DOM Mutation)**: Because the same `<button>` DOM node was clicked, and React updates its `type` attribute from `"button"` to `"submit"` during or immediately following event processing, the click interaction completing on a `type="submit"` element triggers a browser native `submit` event on the parent `<form>`.
5. **Premise 5 (Observation 2)**: The parent `<form onSubmit={submit}>` receives the native `submit` event. Since `stepIndex` is now `totalSteps - 1`, the guard `if (stepIndex < totalSteps - 1) return` evaluates to `false` and allows `submit()` to proceed to make the API request to `/api/bookings`.
6. **Conclusion**: Premature form submission occurs immediately upon transitioning to the final step due to DOM node reuse of the navigation button combined with un-guarded submission logic on the final step index.

---

## 3. Caveats

- **No Caveats**: All code paths in `components/booking/booking-drawer.tsx`, `lib/booking-content.ts`, and `content/booking/booking.json` have been fully inspected. No external APIs or unexamined side effects affect this navigation state mechanism.

---

## 4. Conclusion

The premature form submission bug occurs because React reuses the same underlying `<button>` DOM node when transitioning from `<Button type="button">` on step `totalSteps - 2` to `<Button type="submit">` on step `totalSteps - 1` due to missing React `key` props (`key="continue-btn"` and `key="submit-btn"`). Clicking "Continue" to enter the final step mutates the DOM button type to `submit` mid-interaction, causing the browser to dispatch a form submission event that passes the step index guard on step `totalSteps - 1`.

---

## 5. Verification Method

1. **Source Code Inspection**:
   - Verify `components/booking/booking-drawer.tsx` line 760+ has `key="continue-btn"` on the Continue button and `key="submit-btn"` on the Submit button.
2. **TypeScript Compilation & Build Verification**:
   - Run `npx tsc --noEmit` to ensure 0 TypeScript errors.
   - Run `npm run build` to confirm build succeeds without errors.
3. **Behavioral Invalidation Conditions**:
   - If clicking "Continue" on step 4 of 5 or 5 of 6 automatically triggers form submission or switches drawer state to "Request received", verification fails.
   - If transition completes cleanly to the Review step and stays on the Review step until "Submit request" is clicked, verification succeeds.

---

## 6. Remaining Work (For Implementer 1)

1. Open `components/booking/booking-drawer.tsx`.
2. Add `key="continue-btn"` to the Continue `<Button type="button">` element at line 761.
3. Add `key="submit-btn"` to the Submit `<Button type="submit">` element at line 769.
4. Verify submit handler handling so form submission requires explicit user interaction on the final Submit button.
5. Run `npx tsc --noEmit` and `npm run build` to confirm zero errors.
