# Comprehensive Analysis: Booking Drawer UI & Dynamic Form Rendering Engine

## Executive Summary
This report presents a thorough analysis and architectural design for extending `components/booking/booking-drawer.tsx` and `lib/booking-content.ts` with 6 new dynamic block types (`imageBlock`, `infoCard`, `infoBanner`, `textareaInput`, `selectInput`, `checkboxGroup`).

The design maintains 100% backwards compatibility with existing core functionalities:
1. Bed/Bath number selection and `calculateEstimate` pricing lookup logic remain completely untouched and fully functional.
2. Dynamic form state tracking seamlessly integrates into the flat `formData: Record<string, any>` React state, ensuring conditional step visibility (`showIfField`) and API payload submission (`/api/bookings`) work out of the box.
3. Visual editing attributes (`data-tina-field`) are systematically attached to all rendered block elements for real-time click-to-edit support in TinaCMS.
4. UI styling strictly adheres to the project's Tailwind CSS design system, leveraging existing design tokens (`bg-card`, `border-border`, `text-muted-foreground`, `bg-primary/10`, focus rings, and dark/light mode compatibility).

---

## 1. Inspection of `components/booking/booking-drawer.tsx` & Child Components

### Component Structure & Hierarchy
The booking drawer system is built using a clean React Context and wrapper architecture:
- **`BookingProvider`**: Entry point accepting `content`, optional `tina` data, and `children`.
  - **`BookingProviderTinaWrapper`**: Used when active in TinaCMS preview mode (`tina` prop present). Invokes `useTina()` hook to receive live editor state and normalizes `rawBooking`.
  - **`BookingProviderStaticWrapper`**: Used for static production rendering using pre-built content (`BookingContent`).
- **`BookingDrawerCore`**: Primary drawer component containing:
  - Slide-over sheet wrapper (`<Sheet>` and `<SheetContent>`) from `@/components/ui/sheet`.
  - Form state management (`formData`, `photos`, `stepIndex`, `startedAt`, `submitting`, `complete`).
  - Dynamic theme custom CSS properties calculator (`themeStyle`).
  - Active steps memoized filter (`steps`).
  - `estimate` pricing memoized calculator.
  - Step navigation header (`<Progress>`), body block renderer, and sticky bottom navigation footer (`<Button>` back/continue/submit).

### UI Primitives & Utilities Imported
- **shadcn / Radix primitives**: `<Button>`, `<Checkbox>`, `<Input>`, `<Progress>`, `<Sheet>`, `<Field>`, `<FieldLabel>`, `<FieldSet>`, `<FieldLegend>`, `<FieldDescription>`.
- **Lucide Icons**: `ArrowLeft`, `ArrowRight`, `CalendarDays`, `Check`, `ImagePlus`, `Loader2`, `Sparkles`, `Info`, `AlertCircle`.
- **Pricing & Content Helpers**: `calculateEstimate`, `formatPrice`, `t()`, `normalizeBookingData`, `defaultSteps`.
- **TinaCMS**: `useTina`, `tinaField`.

---

## 2. Analysis of Step & Field Rendering Engine

### Current Step Computation & Filtering
Steps are filtered dynamically based on conditional rules (`showIfField`):
```tsx
const steps = useMemo(() => {
  const rawSteps = content.steps?.length ? content.steps : defaultSteps
  return rawSteps
    .map((step, originalIndex) => ({ step, originalIndex }))
    .filter(({ step }) => {
      if (step.disabled) return false
      if (!step.showIfField) return true
      const val = formData[step.showIfField]
      if (step.showIfOperator === "equals") return String(val) === String(step.showIfValue)
      if (step.showIfOperator === "not_equals") return String(val) !== String(step.showIfValue)
      if (step.showIfOperator === "contains") return String(val).includes(String(step.showIfValue))
      return true
    })
}, [content.steps, formData])
```
*Note*: Preserving `originalStepIndex` is critical because `data-tina-field` indexing into `rawBooking.steps?.[originalStepIndex]` requires the un-filtered step index to point to the correct schema object in TinaCMS.

### Field Rendering Switch Loop
Currently, `currentStep.fields?.map` iterates through step fields and matches `field._template`:
- Existing templates: `servicesSelector`, `addonsSelector`, `textInput`, `numberInput`, `choiceInput`, `dateInput`, `photoUpload`, `richTextHeading`, `estimateSummary`.

---

## 3. Local Form State & Pricing Calculation Analysis

### State Initialization & Storage
`formData` is initialized with:
```typescript
const initialState: Record<string, any> = {
  serviceType: "deep",
  bedrooms: 1,
  bathrooms: 1,
  addOns: [] as string[],
  preferredDate: "",
  preferredWindow: "flexible",
  name: "",
  email: "",
  phone: "",
}
```

### Mutators
1. `updateField(key: string, value: any)`: Updates any key on `formData`.
2. `toggleAddOn(addOnId: string)`: Adds or removes add-on IDs from `formData.addOns`.

### Pricing Logic (`calculateEstimate`)
```typescript
const estimate = useMemo(() => {
  const svc = servicesList.find((s) => s.id === formData.serviceType)
  if (!svc) return null
  const key = `${formData.bedrooms || 1}-${formData.bathrooms || 1}`
  const priceEntry = svc.prices?.find((p) => p.key === key)
  if (!priceEntry) return null
  const base = priceEntry.cents
  const selectedAddOns = Array.isArray(formData.addOns) ? formData.addOns : []
  const addOnTotal = selectedAddOns.reduce((sum, id) => {
    const addon = addOnsList.find((a) => a.id === id)
    return sum + (addon?.cents ?? 0)
  }, 0)
  return base + addOnTotal
}, [formData.serviceType, formData.bedrooms, formData.bathrooms, formData.addOns, servicesList, addOnsList])
```
- **Preservation Guarantee**: Bed/Bath selection and `calculateEstimate` rely strictly on `formData.serviceType`, `formData.bedrooms`, `formData.bathrooms`, and `formData.addOns`. The 6 new block types store independent form keys or display static content, leaving pricing calculations completely untouched and 100% functional.

---

## 4. Component Rendering Design for 6 New Block Types

Below are the detailed UI component designs, Tailwind CSS class specifications, interactive handlers, and Tina visual editing attributes for the 6 new block types:

### 1. `imageBlock` (Static Content / Media)
- **Purpose**: Render an image with optional caption inside form steps.
- **Fields**: `url` (string), `alt` (string), `caption` (string), `aspectRatio` (string, e.g. "aspect-video", "aspect-square", "aspect-auto").
- **UI Design & Tailwind CSS**:
  - Container with `data-tina-field={tinaAttr}`.
  - Image wrapped in `overflow-hidden rounded-xl border border-border bg-muted/20 shadow-xs`.
  - Image class: `w-full object-cover`.
  - Optional caption: `mt-2 text-center text-xs text-muted-foreground`.
- **JSX Spec**:
  ```tsx
  case "imageBlock":
    return (
      <div key={`field-${fieldIdx}`} className="flex flex-col gap-2" data-tina-field={tinaAttr}>
        {field.url && (
          <div className={cn("overflow-hidden rounded-xl border border-border bg-muted/20 shadow-xs", field.aspectRatio || "aspect-video")}>
            <img src={field.url} alt={field.alt || "Step graphic"} className="h-full w-full object-cover" />
          </div>
        )}
        {field.caption && (
          <p className="text-center text-xs text-muted-foreground">{field.caption}</p>
        )}
      </div>
    )
  ```

### 2. `infoCard` (Static Visual Content)
- **Purpose**: Display featured text card with title, description, optional icon, and subtle background accent.
- **Fields**: `title` (string), `description` (string), `icon` (string), `variant` ("default" | "primary" | "accent" | "muted").
- **UI Design & Tailwind CSS**:
  - Card container: `rounded-xl border p-5 shadow-xs transition-colors`.
  - Variants:
    - `"default"` (card): `border-border bg-card text-card-foreground`
    - `"primary"`: `border-primary/30 bg-primary/10 text-foreground`
    - `"accent"`: `border-accent bg-accent/10 text-accent-foreground`
    - `"muted"`: `border-border bg-muted/50 text-muted-foreground`
  - Header with optional Icon (`Info`, `Sparkles`, `ShieldCheck`): `size-5 text-primary shrink-0`.
  - Title: `font-display text-lg font-medium text-foreground`.
  - Description: `mt-1.5 text-sm text-muted-foreground leading-relaxed`.
- **JSX Spec**:
  ```tsx
  case "infoCard":
    return (
      <div
        key={`field-${fieldIdx}`}
        data-tina-field={tinaAttr}
        className={cn(
          "rounded-xl border p-5 shadow-xs transition-colors",
          field.variant === "primary" && "border-primary/30 bg-primary/10",
          field.variant === "accent" && "border-accent bg-accent/10",
          field.variant === "muted" && "border-border bg-muted/50",
          (!field.variant || field.variant === "default") && "border-border bg-card"
        )}
      >
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            {field.title && <h4 className="font-display text-lg font-medium text-foreground">{field.title}</h4>}
            {field.description && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{field.description}</p>}
          </div>
        </div>
      </div>
    )
  ```

### 3. `infoBanner` (Notice / Callout Banner)
- **Purpose**: Display alert banners (notes, disclaimers, highlights) across step content.
- **Fields**: `text` (string), `variant` ("info" | "warning" | "success" | "accent"), `icon` (string).
- **UI Design & Tailwind CSS**:
  - Container: `flex items-start gap-3 rounded-lg border p-4 text-sm leading-relaxed shadow-2xs`.
  - Variants:
    - `"info"`: `border-blue-500/20 bg-blue-500/10 text-blue-900 dark:border-blue-500/30 dark:text-blue-200`
    - `"warning"`: `border-amber-500/20 bg-amber-500/10 text-amber-900 dark:border-amber-500/30 dark:text-amber-200`
    - `"success"`: `border-emerald-500/20 bg-emerald-500/10 text-emerald-900 dark:border-emerald-500/30 dark:text-emerald-200`
    - `"accent"` (default): `border-primary/30 bg-primary/10 text-foreground`
- **JSX Spec**:
  ```tsx
  case "infoBanner":
    return (
      <div
        key={`field-${fieldIdx}`}
        data-tina-field={tinaAttr}
        className={cn(
          "flex items-start gap-3 rounded-lg border p-4 text-sm leading-relaxed shadow-2xs",
          field.variant === "info" && "border-blue-500/20 bg-blue-500/10 text-blue-900 dark:border-blue-500/30 dark:text-blue-200",
          field.variant === "warning" && "border-amber-500/20 bg-amber-500/10 text-amber-900 dark:border-amber-500/30 dark:text-amber-200",
          field.variant === "success" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-900 dark:border-emerald-500/30 dark:text-emerald-200",
          (!field.variant || field.variant === "accent") && "border-primary/30 bg-primary/10 text-foreground"
        )}
      >
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <span>{field.text}</span>
      </div>
    )
  ```

### 4. `textareaInput` (Multi-line User Input)
- **Purpose**: Allow users to enter multi-line text (e.g. entry details, cleaning notes).
- **Fields**: `name` (string), `label` (string), `placeholder` (string), `required` (boolean), `rows` (number), `hint` (string).
- **UI Design & Tailwind CSS**:
  - Container: `<Field data-tina-field={tinaAttr}>`.
  - `<FieldLabel htmlFor={field.name}>{field.label}</FieldLabel>`.
  - Standard/shadcn Textarea: `border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50`.
  - Controlled value: `formData[field.name || ""] || ""`
  - Change handler: `onChange={(e) => updateField(field.name || "", e.target.value)}`.
  - Optional `<FieldDescription>{field.hint}</FieldDescription>`.
- **JSX Spec**:
  ```tsx
  case "textareaInput":
    return (
      <Field key={`field-${fieldIdx}`} data-tina-field={tinaAttr}>
        {field.label && <FieldLabel htmlFor={field.name}>{field.label}</FieldLabel>}
        <Textarea
          id={field.name}
          rows={field.rows || 3}
          placeholder={field.placeholder || ""}
          required={field.required}
          value={formData[field.name || ""] || ""}
          onChange={(e) => updateField(field.name || "", e.target.value)}
        />
        {field.hint && <FieldDescription>{field.hint}</FieldDescription>}
      </Field>
    )
  ```

### 5. `selectInput` (Dropdown Menu)
- **Purpose**: Select single option from a dropdown.
- **Fields**: `name` (string), `label` (string), `placeholder` (string), `required` (boolean), `options` (`Array<{ id: string; label: string }>`), `hint` (string).
- **UI Design & Tailwind CSS**:
  - Uses shadcn `<Select>`, `<SelectTrigger>`, `<SelectValue>`, `<SelectContent>`, `<SelectItem>` primitives from `@/components/ui/select`.
  - Trigger styled with `w-full border-input bg-transparent dark:bg-input/30 focus-visible:ring-[3px] focus-visible:ring-ring/50`.
  - Controlled value: `formData[field.name || ""] || ""`
  - Change handler: `onValueChange={(val) => updateField(field.name || "", val)}`.
- **JSX Spec**:
  ```tsx
  case "selectInput":
    return (
      <Field key={`field-${fieldIdx}`} data-tina-field={tinaAttr}>
        {field.label && <FieldLabel htmlFor={field.name}>{field.label}</FieldLabel>}
        <Select
          value={formData[field.name || ""] || ""}
          onValueChange={(val) => updateField(field.name || "", val)}
        >
          <SelectTrigger id={field.name} className="w-full">
            <SelectValue placeholder={field.placeholder || "Select an option..."} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {field.hint && <FieldDescription>{field.hint}</FieldDescription>}
      </Field>
    )
  ```

### 6. `checkboxGroup` (Multi-Option Selection Toggles)
- **Purpose**: Select multiple items from a checkable list.
- **Fields**: `name` (string), `label` (string), `options` (`Array<{ id: string; label: string; description?: string }>`), `hint` (string).
- **UI Design & Tailwind CSS**:
  - Outer container: `<FieldSet data-tina-field={tinaAttr}>`.
  - Legend: `<FieldLegend variant="label">{field.label}</FieldLegend>`.
  - List items: `<Field orientation="horizontal" className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50">`.
  - Custom multi-toggle handler `toggleCheckboxGroupOption(fieldName, optionId)`:
    ```tsx
    const toggleCheckboxGroupOption = (fieldName: string, optionId: string) => {
      setFormData((prev) => {
        const currentList = Array.isArray(prev[fieldName]) ? prev[fieldName] : []
        return {
          ...prev,
          [fieldName]: currentList.includes(optionId)
            ? currentList.filter((id: string) => id !== optionId)
            : [...currentList, optionId],
        }
      })
    }
    ```
- **JSX Spec**:
  ```tsx
  case "checkboxGroup":
    return (
      <FieldSet key={`field-${fieldIdx}`} data-tina-field={tinaAttr}>
        {field.label && <FieldLegend variant="label">{field.label}</FieldLegend>}
        <div className="flex flex-col gap-3">
          {field.options?.map((opt, optIdx) => {
            const currentList = Array.isArray(formData[field.name || ""]) ? formData[field.name || ""] : []
            const isChecked = currentList.includes(opt.id)
            return (
              <Field
                key={opt.id || `opt-${optIdx}`}
                orientation="horizontal"
                className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
              >
                <Checkbox
                  id={`${field.name}-${opt.id}`}
                  checked={isChecked}
                  onCheckedChange={() => toggleCheckboxGroupOption(field.name || "", opt.id)}
                />
                <FieldLabel htmlFor={`${field.name}-${opt.id}`} className="flex flex-1 flex-col justify-center cursor-pointer">
                  <span className="font-medium text-foreground">{opt.label}</span>
                  {opt.description && (
                    <span className="text-xs text-muted-foreground">{opt.description}</span>
                  )}
                </FieldLabel>
              </Field>
            )
          })}
        </div>
        {field.hint && <FieldDescription>{field.hint}</FieldDescription>}
      </FieldSet>
    )
  ```

---

## 5. Dynamic Form State Tracking Plan

### Flat `formData: Record<string, any>` Model
Using a unified flat object for state tracking offers clear architectural advantages:
1. **Zero Modifications to Existing State Keys**: `bedrooms`, `bathrooms`, `serviceType`, and `addOns` continue to exist at top-level `formData`, preserving `calculateEstimate` without requiring deep state navigation.
2. **Conditional Step Visibility Compatibility**: Steps using `showIfField` can query `formData[step.showIfField]` directly, whether the target field is a standard input or one of the new dynamic inputs (`selectInput`, `checkboxGroup`).
3. **Form Submission Serialization**: In `submit(event: FormEvent)`, `Object.entries(formData)` automatically serializes all dynamic input values (e.g. text, arrays as JSON, dates) into `FormData` passed to `/api/bookings`.

---

## 6. Type Definitions & GraphQL Schema Mapping (`lib/booking-content.ts`)

### `FormFieldBlock` Interface Extensions
```typescript
export interface FormFieldBlock {
  _template: string
  name?: string
  label?: string
  placeholder?: string
  required?: boolean
  validationType?: string
  min?: number
  max?: number
  options?: Array<{ id: string; label: string; description?: string }>
  hint?: string
  text?: string
  question?: string
  disclaimer?: string
  prompt?: string
  selectedText?: string
  emptyText?: string
  // New properties for 6 block types:
  url?: string
  alt?: string
  caption?: string
  aspectRatio?: string
  title?: string
  description?: string
  icon?: string
  variant?: string
  rows?: number
}
```

### `typenameToTemplate` Mapping Update
To translate GraphQL `__typename` generated by TinaCMS into local `_template` names:
```typescript
const typenameToTemplate: Record<string, string> = {
  BookingStepsFieldsTextInput: "textInput",
  BookingStepsFieldsNumberInput: "numberInput",
  BookingStepsFieldsChoiceInput: "choiceInput",
  BookingStepsFieldsDateInput: "dateInput",
  BookingStepsFieldsPhotoUpload: "photoUpload",
  BookingStepsFieldsRichTextHeading: "richTextHeading",
  BookingStepsFieldsServicesSelector: "servicesSelector",
  BookingStepsFieldsAddonsSelector: "addonsSelector",
  BookingStepsFieldsEstimateSummary: "estimateSummary",
  // 6 New Block GraphQL Typenames:
  BookingStepsFieldsImageBlock: "imageBlock",
  BookingStepsFieldsInfoCard: "infoCard",
  BookingStepsFieldsInfoBanner: "infoBanner",
  BookingStepsFieldsTextareaInput: "textareaInput",
  BookingStepsFieldsSelectInput: "selectInput",
  BookingStepsFieldsCheckboxGroup: "checkboxGroup",
}
```

---

## 7. Verification & Invalidation Conditions

### Independent Verification Steps
1. **Compilation Check**: Run `npx tsc --noEmit` or `npm run build` to confirm no TypeScript compilation or interface mismatches exist.
2. **Visual Editing Check**: In TinaCMS admin editor, verify click-to-edit overlays appear on new block elements (`data-tina-field`).
3. **Calculation Integrity**: Verify changing Bed/Bath numbers or toggling extras updates `<EstimateCallout>` immediately.
4. **State Submission**: Submit form with dynamic inputs populated and confirm network payload in `/api/bookings` includes dynamic field keys.

---
