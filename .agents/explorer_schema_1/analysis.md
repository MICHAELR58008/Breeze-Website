# TinaCMS Schema & Content Expansion Analysis: Booking Form Blocks

**Explorer:** Explorer 1 (`explorer_schema_1`)  
**Project:** Breeze Website (`c:\Users\SOL\Desktop\Projet for Breeze\wesite`)  
**Date:** 2026-07-22  
**Target Files Inspected:**
- `tina/config.ts` (Lines 242–427: `booking` collection schema)
- `content/booking/booking.json` (Lines 94–219: `steps` array content)
- `lib/booking-content.ts` (Lines 4–31, 129–151: TypeScript interfaces & `typenameToTemplate` mapping)
- `components/booking/booking-drawer.tsx` (Lines 354–547: Step field renderer & visual editing `data-tina-field`)

---

## Executive Summary

The TinaCMS `booking` collection allows content managers to dynamically construct custom form steps and input fields for the booking drawer. Currently, `tina/config.ts` defines 9 field block templates under `booking.steps.fields.templates`: `textInput`, `numberInput`, `choiceInput`, `dateInput`, `photoUpload`, `richTextHeading`, `servicesSelector`, `addonsSelector`, and `estimateSummary`.

This analysis provides the complete, production-ready schema design for expanding `booking.steps.fields` with **6 new block types**:
1. `imageBlock`: Media image display with caption, alt text, and aspect ratio choices.
2. `infoCard`: Feature callout card with icon, title, description, and visual variants (`default`, `highlight`, `outline`).
3. `infoBanner`: Notice/alert banner with rich text/textarea message, banner types (`info`, `warning`, `success`), and dismissible flag.
4. `textareaInput`: Multi-line text input field with configurable row height, placeholder, label, and validation.
5. `selectInput`: Dropdown select control supporting custom option list (value/label pairs), default value selection, and required flag.
6. `checkboxGroup`: Multi-selection checkbox group supporting option list (value, label, optional price delta in cents), and required flag.

---

## 1. Existing Schema & Data Structure Assessment

### A. Existing Schema in `tina/config.ts`
The `booking` collection (`path: "content/booking"`, `format: "json"`) contains a polymorphic `steps` list field:
```ts
{
  type: "object",
  name: "steps",
  label: "Form Steps & Custom Fields Builder",
  list: true,
  ui: {
    itemProps: (item) => ({ label: item?.title || "New Step" }),
  },
  fields: [
    { type: "string", name: "title", label: "Step Title", required: true },
    { type: "string", name: "description", label: "Step Subtitle / Description" },
    { type: "boolean", name: "disabled", label: "Disable / Hide this Step" },
    { type: "string", name: "showIfField", label: "Conditional Visibility: Dependent Field Name (optional)" },
    { type: "string", name: "showIfOperator", label: "Operator", options: ["equals", "not_equals", "contains"] },
    { type: "string", name: "showIfValue", label: "Value to match" },
    {
      type: "object",
      name: "fields",
      label: "Step Inputs & Elements",
      list: true,
      templates: [ /* existing 9 templates */ ]
    }
  ]
}
```

### B. Existing Content Structure in `content/booking/booking.json`
Each step in `booking.json` contains a `fields` array. TinaCMS identifies polymorphic block items using the `_template` field:
```json
{
  "title": "Contact",
  "description": "Where should we send your quote?",
  "fields": [
    {
      "name": "name",
      "label": "Your Full Name",
      "required": true,
      "_template": "textInput"
    }
  ]
}
```

### C. TinaCMS Runtime & Visual Editing Data Flow
1. **GraphQL Generation**: TinaCMS generates GraphQL types based on template names under `booking.steps.fields`. For template `textInput`, the GraphQL `__typename` is `BookingStepsFieldsTextInput`.
2. **Normalization (`lib/booking-content.ts`)**: `normalizeSteps()` maps GraphQL `__typename` to `_template` via `typenameToTemplate` lookup table.
3. **Visual Editing (`components/booking/booking-drawer.tsx`)**: In visual edit mode, `tinaField(rawBooking.steps?.[originalStepIndex]?.fields?.[fieldIdx])` generates a `data-tina-field` DOM attribute that links the React element directly to the TinaCMS admin UI sidebar panel.

---

## 2. Comprehensive Schema Specifications for 6 New Block Types

Below are the exact schema definitions to be added to `templates` in `tina/config.ts`:

### Block 1: `imageBlock`
- **Purpose**: Displays inline media images within form steps (e.g., example cleanings, room diagrams).
- **Template Name**: `imageBlock`
- **Label**: `Image Block`
- **Tina Schema Code**:
```ts
{
  name: "imageBlock",
  label: "Image Block",
  ui: {
    itemProps: (item) => ({
      label: item?.caption || item?.alt || "Image Block",
    }),
    defaultItem: {
      src: "",
      alt: "",
      caption: "",
      aspect: "16/9",
    },
  },
  fields: [
    {
      type: "image",
      name: "src",
      label: "Image Source",
    },
    {
      type: "string",
      name: "alt",
      label: "Alt Text",
    },
    {
      type: "string",
      name: "caption",
      label: "Caption / Subtitle",
    },
    {
      type: "string",
      name: "aspect",
      label: "Aspect Ratio",
      options: ["auto", "16/9", "4/3", "1/1", "square", "video"],
    },
  ],
}
```

---

### Block 2: `infoCard`
- **Purpose**: Highlighted informational callout cards (e.g., service guarantees, key details, tips).
- **Template Name**: `infoCard`
- **Label**: `Info Card`
- **Tina Schema Code**:
```ts
{
  name: "infoCard",
  label: "Info Card",
  ui: {
    itemProps: (item) => ({
      label: item?.title || "Info Card",
    }),
    defaultItem: {
      title: "",
      description: "",
      icon: "info",
      variant: "default",
    },
  },
  fields: [
    {
      type: "string",
      name: "title",
      label: "Title",
    },
    {
      type: "string",
      name: "description",
      label: "Description",
      ui: {
        component: "textarea",
      },
    },
    {
      type: "string",
      name: "icon",
      label: "Icon",
      options: [
        "info",
        "star",
        "check",
        "shield",
        "sparkles",
        "clock",
        "alert",
        "heart",
        "help",
      ],
    },
    {
      type: "string",
      name: "variant",
      label: "Card Variant",
      options: ["default", "highlight", "outline"],
    },
  ],
}
```

---

### Block 3: `infoBanner`
- **Purpose**: Full-width notice/alert banners for important messages or warnings.
- **Template Name**: `infoBanner`
- **Label**: `Info Banner`
- **Tina Schema Code**:
```ts
{
  name: "infoBanner",
  label: "Info Banner",
  ui: {
    itemProps: (item) => ({
      label: item?.text ? `Banner: ${item.text.slice(0, 25)}...` : "Info Banner",
    }),
    defaultItem: {
      text: "",
      type: "info",
      dismissible: false,
    },
  },
  fields: [
    {
      type: "string",
      name: "text",
      label: "Banner Text",
      ui: {
        component: "textarea",
      },
    },
    {
      type: "string",
      name: "type",
      label: "Banner Type",
      options: ["info", "warning", "success"],
    },
    {
      type: "boolean",
      name: "dismissible",
      label: "Dismissible / Closable?",
    },
  ],
}
```

---

### Block 4: `textareaInput`
- **Purpose**: Multi-line text input for user feedback, entry instructions, or special requests.
- **Template Name**: `textareaInput`
- **Label**: `Textarea Field`
- **Tina Schema Code**:
```ts
{
  name: "textareaInput",
  label: "Textarea Field",
  ui: {
    itemProps: (item) => ({
      label: item?.label || item?.name || "Textarea Field",
    }),
    defaultItem: {
      name: "",
      label: "",
      placeholder: "",
      required: false,
      rows: 4,
    },
  },
  fields: [
    {
      type: "string",
      name: "name",
      label: "Field ID Key",
    },
    {
      type: "string",
      name: "label",
      label: "Label Text",
    },
    {
      type: "string",
      name: "placeholder",
      label: "Placeholder Text",
    },
    {
      type: "boolean",
      name: "required",
      label: "Required Field?",
    },
    {
      type: "number",
      name: "rows",
      label: "Number of Rows (Height)",
    },
  ],
}
```

---

### Block 5: `selectInput`
- **Purpose**: Single-select dropdown control for choosing options (frequency, home type, time of day).
- **Template Name**: `selectInput`
- **Label**: `Select / Dropdown Field`
- **Tina Schema Code**:
```ts
{
  name: "selectInput",
  label: "Select / Dropdown Field",
  ui: {
    itemProps: (item) => ({
      label: item?.label || item?.name || "Select Field",
    }),
    defaultItem: {
      name: "",
      label: "",
      required: false,
      defaultValue: "",
      options: [],
    },
  },
  fields: [
    {
      type: "string",
      name: "name",
      label: "Field ID Key",
    },
    {
      type: "string",
      name: "label",
      label: "Label Text",
    },
    {
      type: "object",
      name: "options",
      label: "Dropdown Options",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item?.label || item?.value || "Option",
        }),
      },
      fields: [
        { type: "string", name: "value", label: "Option Value / ID" },
        { type: "string", name: "label", label: "Display Label" },
      ],
    },
    {
      type: "boolean",
      name: "required",
      label: "Required Field?",
    },
    {
      type: "string",
      name: "defaultValue",
      label: "Default Selected Value",
    },
  ],
}
```

---

### Block 6: `checkboxGroup`
- **Purpose**: Multi-selection checkbox list for options, focus areas, or add-ons with optional pricing.
- **Template Name**: `checkboxGroup`
- **Label**: `Checkbox Group Field`
- **Tina Schema Code**:
```ts
{
  name: "checkboxGroup",
  label: "Checkbox Group Field",
  ui: {
    itemProps: (item) => ({
      label: item?.label || item?.name || "Checkbox Group",
    }),
    defaultItem: {
      name: "",
      label: "",
      required: false,
      options: [],
    },
  },
  fields: [
    {
      type: "string",
      name: "name",
      label: "Field ID Key",
    },
    {
      type: "string",
      name: "label",
      label: "Label Text",
    },
    {
      type: "object",
      name: "options",
      label: "Checkbox Options",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item?.label
            ? `${item.label}${item.priceCents ? ` (+$${(item.priceCents / 100).toFixed(2)})` : ""}`
            : "Option",
        }),
      },
      fields: [
        { type: "string", name: "value", label: "Option Value / ID" },
        { type: "string", name: "label", label: "Display Label" },
        { type: "number", name: "priceCents", label: "Additional Price (in Cents, optional)" },
      ],
    },
    {
      type: "boolean",
      name: "required",
      label: "Required Field?",
    },
  ],
}
```

---

## 3. Sample Data Structure for `content/booking/booking.json`

Here are example JSON representations for each of the 6 new block types to demonstrate valid data formatting in `booking.json`:

```json
[
  {
    "_template": "imageBlock",
    "src": "/images/breeze-clean-home.png",
    "alt": "Sparkling clean living room",
    "caption": "Professional finish after every deep clean.",
    "aspect": "16/9"
  },
  {
    "_template": "infoCard",
    "title": "Owner-Led Quality Guarantee",
    "description": "Every clean is backed by our 24-hour satisfaction promise. If anything is missed, we'll re-clean it at no extra cost.",
    "icon": "shield",
    "variant": "highlight"
  },
  {
    "_template": "infoBanner",
    "text": "First-time customer? Save 10% on weekly recurring cleanings!",
    "type": "info",
    "dismissible": true
  },
  {
    "_template": "textareaInput",
    "name": "specialInstructions",
    "label": "Special Instructions or Entry Notes",
    "placeholder": "Gate code, pet notes, or specific areas needing extra care...",
    "required": false,
    "rows": 4
  },
  {
    "_template": "selectInput",
    "name": "cleaningFrequency",
    "label": "Cleaning Frequency",
    "required": true,
    "defaultValue": "one_time",
    "options": [
      { "value": "one_time", "label": "One-time Clean" },
      { "value": "weekly", "label": "Weekly Service (10% discount)" },
      { "value": "biweekly", "label": "Bi-weekly Service (5% discount)" }
    ]
  },
  {
    "_template": "checkboxGroup",
    "name": "priorityAreas",
    "label": "Priority Focus Areas",
    "required": false,
    "options": [
      { "value": "appliances", "label": "Inside Major Appliances", "priceCents": 3000 },
      { "value": "baseboards", "label": "Deep Baseboard Scrub", "priceCents": 2500 },
      { "value": "windows", "label": "Interior Window Sills & Glass", "priceCents": 3500 }
    ]
  }
]
```

---

## 4. Required Runtime & Frontend Integration Upgrades

To ensure complete end-to-end functionality when implementers integrate these blocks:

### A. GraphQL Typename Mapping (`lib/booking-content.ts`)
Add the 6 new block GraphQL typenames to `typenameToTemplate`:
```ts
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
  // New Block Types
  BookingStepsFieldsImageBlock: "imageBlock",
  BookingStepsFieldsInfoCard: "infoCard",
  BookingStepsFieldsInfoBanner: "infoBanner",
  BookingStepsFieldsTextareaInput: "textareaInput",
  BookingStepsFieldsSelectInput: "selectInput",
  BookingStepsFieldsCheckboxGroup: "checkboxGroup",
}
```

### B. TypeScript Interface Updates (`lib/booking-content.ts`)
Update `FormFieldBlock` to include fields for the 6 new templates:
```ts
export interface FormFieldOption {
  id?: string
  value?: string
  label?: string
  priceCents?: number
}

export interface FormFieldBlock {
  _template: string
  name?: string
  label?: string
  placeholder?: string
  required?: boolean
  validationType?: string
  min?: number
  max?: number
  options?: FormFieldOption[]
  hint?: string
  text?: string
  question?: string
  disclaimer?: string
  prompt?: string
  selectedText?: string
  emptyText?: string
  // New block properties
  src?: string
  alt?: string
  caption?: string
  aspect?: string
  title?: string
  description?: string
  icon?: string
  variant?: string
  type?: string
  dismissible?: boolean
  rows?: number
  defaultValue?: string
}
```

### C. Visual Editing (`data-tina-field`) & UI Actions
- All templates use `itemProps` formatters so content authors see readable labels in TinaCMS admin sidebar list items.
- All templates define `defaultItem` presets so clicking "Add Item" in TinaCMS admin immediately inserts a fully populated object without validation errors.
- Since `fields` has `list: true` and `templates: [...]`, TinaCMS natively provides item reordering, template selection, and item deletion UI controls.
- Visual editing attributes `data-tina-field` are supported seamlessly via `tinaField(rawBooking.steps?.[originalStepIndex]?.fields?.[fieldIdx])`.

---

## 5. Summary Matrix of Block Types

| Block Name | Primary Fields | Key Control / UI Type | Visual Edit Ready | Admin Reorder / Create / Delete |
|---|---|---|---|---|
| `imageBlock` | `src`, `alt`, `caption`, `aspect` | Tina Image picker + Aspect select | Yes (`data-tina-field`) | Supported via `templates` |
| `infoCard` | `title`, `description`, `icon`, `variant` | Textarea + Icon/Variant select | Yes (`data-tina-field`) | Supported via `templates` |
| `infoBanner` | `text`, `type`, `dismissible` | Textarea + Type select + Boolean | Yes (`data-tina-field`) | Supported via `templates` |
| `textareaInput` | `name`, `label`, `placeholder`, `required`, `rows` | Multi-line input config + Number rows | Yes (`data-tina-field`) | Supported via `templates` |
| `selectInput` | `name`, `label`, `options`, `required`, `defaultValue` | Dropdown config + Option list builder | Yes (`data-tina-field`) | Supported via `templates` |
| `checkboxGroup` | `name`, `label`, `options`, `required` | Checkbox group + Option & Price builder | Yes (`data-tina-field`) | Supported via `templates` |
