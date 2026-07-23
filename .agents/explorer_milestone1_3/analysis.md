# Solution Blueprint: Booking Drawer Form Navigation & Submit Isolation

## Executive Summary
This document provides the concrete solution blueprint for updating `components/booking/booking-drawer.tsx` to resolve automatic form submission bugs upon reaching the final Review step. The fix enforces strict React DOM node unmounting via explicit `key` attributes (`key="continue-btn"` vs `key="submit-btn"`) and intercepts accidental form submit triggers caused by keyboard `Enter` bubbling in input fields.

---

## 1. Problem Analysis & Root Cause

### 1.1 DOM Node Reuse in React Reconciliation
In `components/booking/booking-drawer.tsx` (lines 760-777), navigation buttons were conditionally rendered without React `key` attributes:

```tsx
{stepIndex < totalSteps - 1 ? (
  <Button
    type="button"
    onClick={() => setStepIndex(stepIndex + 1)}
  >
    {content.navigation.continue} <ArrowRight data-icon="inline-end" />
  </Button>
) : (
  <Button
    type="submit"
    disabled={submitting}
  >
    ...
  </Button>
)}
```

Because both buttons occupy the same location in the JSX tree without explicit `key` props, React reconciles and mutates the existing `<button>` DOM element's attributes (`type="button"` $\rightarrow$ `type="submit"`). When a user clicks "Continue" on the step immediately preceding Review (e.g. Contact step), the click event loop updates state (`stepIndex` $\rightarrow$ `totalSteps - 1`), triggering a re-render. Mutating the element to `type="submit"` in the same click/event cycle can trigger premature form submission in browser event queues.

### 1.2 Unintended HTML Form Keyboard Submission
The `<form onSubmit={submit}>` element lacked an `onKeyDown` guard. In standard HTML forms, pressing `Enter` inside any text, date, or number input field fires the native `<form>` `submit` event. When `stepIndex === totalSteps - 1`, `submit()` executed without requiring an explicit click on the final Submit button.

### 1.3 Dynamic Step Filtering Across Service Packages
Steps in `booking-drawer.tsx` are computed dynamically via `useMemo`:
```tsx
const steps = useMemo(() => {
  const rawSteps = content.steps?.length ? content.steps : defaultSteps
  return rawSteps.map(...).filter(...)
}, [content.steps, formData])
```
For **Commercial Clean**, the "Home" step is conditionally filtered out (`showIfField: "serviceType", showIfOperator: "not_equals", showIfValue: "Commercial "`). Consequently, `totalSteps` drops from 6 (or 7) to 5. When moving from Contact (step index 3) to Review (step index 4), `stepIndex < totalSteps - 1` becomes false. Without isolated button keys and Enter key prevention, this step transition was particularly vulnerable to accidental submission.

---

## 2. Proposed Concrete Code Modifications

### Target File
`components/booking/booking-drawer.tsx`

---

### Modification 1: Form Keydown Handler
**Location**: `components/booking/booking-drawer.tsx`, line 334

#### Existing Code (Line 334):
```tsx
<form onSubmit={submit} className="flex min-h-[calc(100vh-140px)] flex-col" style={{ pointerEvents: "auto" }}>
```

#### Proposed Replacement:
```tsx
<form
  onSubmit={submit}
  onKeyDown={(e) => {
    if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA" && (e.target as HTMLElement).tagName !== "BUTTON") {
      e.preventDefault()
    }
  }}
  className="flex min-h-[calc(100vh-140px)] flex-col"
  style={{ pointerEvents: "auto" }}
>
```

#### Rationale:
- Prevents `Enter` key inside text inputs (`<input>`), select elements (`<select>`), date inputs, and number inputs from auto-triggering form submission.
- Preserves `Enter` newline insertion inside `<textarea>` elements.
- Preserves explicit `Enter` activation when keyboard focus is on interactive `<button>` elements (e.g. choice selections, add-on checkboxes, Continue button, Submit button).

---

### Modification 2: Navigation Button Keys & Button Types
**Location**: `components/booking/booking-drawer.tsx`, lines 751-778

#### Existing Code (Lines 751-778):
```tsx
<div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-background/95 p-4 backdrop-blur">
  <Button
    type="button"
    variant="ghost"
    disabled={stepIndex === 0 || submitting}
    onClick={() => setStepIndex(stepIndex - 1)}
    data-tina-field={rawBooking ? tinaField(rawBooking.navigation, "back") : undefined}
  >
    <ArrowLeft data-icon="inline-start" /> {content.navigation.back}
  </Button>
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
</div>
```

#### Proposed Replacement:
```tsx
<div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-background/95 p-4 backdrop-blur">
  <Button
    key="back-btn"
    type="button"
    variant="ghost"
    disabled={stepIndex === 0 || submitting}
    onClick={() => setStepIndex(stepIndex - 1)}
    data-tina-field={rawBooking ? tinaField(rawBooking.navigation, "back") : undefined}
  >
    <ArrowLeft data-icon="inline-start" /> {content.navigation.back}
  </Button>
  {stepIndex < totalSteps - 1 ? (
    <Button
      key="continue-btn"
      type="button"
      onClick={() => setStepIndex(stepIndex + 1)}
      data-tina-field={rawBooking ? tinaField(rawBooking.navigation, "continue") : undefined}
    >
      {content.navigation.continue} <ArrowRight data-icon="inline-end" />
    </Button>
  ) : (
    <Button
      key="submit-btn"
      type="submit"
      disabled={submitting}
      data-tina-field={rawBooking ? tinaField(rawBooking.navigation, "submit") : undefined}
    >
      {submitting ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Check data-icon="inline-start" />}
      {content.navigation.submit}
    </Button>
  )}
</div>
```

#### Rationale:
- `key="continue-btn"` and `key="submit-btn"` force React to unmount the Continue button DOM node and mount a completely new Submit button DOM node when transitioning to `stepIndex === totalSteps - 1`.
- Completely breaks DOM node element reuse and eliminates cross-render event leaks.
- `key="back-btn"` ensures back button element identity stability.

---

## 3. Package Compatibility Matrix & Verification

| Service Package | Total Steps | Transition Step $\rightarrow$ Review | Rendered Button on Step | Key Prop | Enter Key in Input | Final Submit Click |
|---|---|---|---|---|---|---|
| **Standard / Regular Clean** | 6 (or 7) | Contact (5) $\rightarrow$ Review (6) | Continue $\rightarrow$ Submit request | `key="continue-btn"` $\rightarrow$ `key="submit-btn"` | Prevented (`e.preventDefault()`) | Submits API request |
| **Deep Clean** | 6 (or 7) | Contact (5) $\rightarrow$ Review (6) | Continue $\rightarrow$ Submit request | `key="continue-btn"` $\rightarrow$ `key="submit-btn"` | Prevented (`e.preventDefault()`) | Submits API request |
| **Move In/Out Clean** | 6 (or 7) | Contact (5) $\rightarrow$ Review (6) | Continue $\rightarrow$ Submit request | `key="continue-btn"` $\rightarrow$ `key="submit-btn"` | Prevented (`e.preventDefault()`) | Submits API request |
| **Commercial Clean** | 5 (Home step skipped) | Contact (4) $\rightarrow$ Review (5) | Continue $\rightarrow$ Submit request | `key="continue-btn"` $\rightarrow$ `key="submit-btn"` | Prevented (`e.preventDefault()`) | Submits API request |
| **Airbnb Clean / Custom** | $N$ | Step $N-1 \rightarrow N$ | Continue $\rightarrow$ Submit request | `key="continue-btn"` $\rightarrow$ `key="submit-btn"` | Prevented (`e.preventDefault()`) | Submits API request |

---

## 4. Acceptance Criteria Verification Plan

1. **AC 1 (Review Step Transition)**:
   - Navigate through form steps for all services (including Commercial Clean).
   - Verify clicking "Continue" on the Contact step advances the drawer to the Review step and STAYS on the Review step without triggering API requests.
2. **AC 2 (Explicit Submit)**:
   - On the Review step, click "Submit request".
   - Verify network POST request to `/api/bookings` is sent and success UI is displayed.
3. **AC 3 (TypeScript Check)**:
   - Run `npx tsc --noEmit`. Expected output: 0 errors.
4. **AC 4 (Production Build Check)**:
   - Run `npm run build`. Expected output: Clean successful build.
