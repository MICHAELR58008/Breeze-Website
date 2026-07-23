# Changes Report — Booking Sheet / Drawer Customization System Expansion

## Files Modified

### 1. `tina/config.ts`
- Expanded `booking.steps.fields.templates` to support 6 new block templates:
  - `imageBlock`: fields `src` (image), `alt` (string), `caption` (string), `aspect` (select: auto, 16/9, 4/3, 1/1, square, video). Defined `ui.itemProps` and `ui.defaultItem`.
  - `infoCard`: fields `title` (string), `description` (textarea), `icon` (select: info, sparkles, shield, star, check, help), `variant` (select: default, highlight, outline). Defined `ui.itemProps` and `ui.defaultItem`.
  - `infoBanner`: fields `text` (textarea), `type` (select: info, warning, success), `dismissible` (boolean). Defined `ui.itemProps` and `ui.defaultItem`.
  - `textareaInput`: fields `name` (string), `label` (string), `placeholder` (string), `required` (boolean), `rows` (number). Defined `ui.itemProps` and `ui.defaultItem`.
  - `selectInput`: fields `name` (string), `label` (string), `options` (list of value/label objects), `required` (boolean), `defaultValue` (string). Defined `ui.itemProps` and `ui.defaultItem`.
  - `checkboxGroup`: fields `name` (string), `label` (string), `options` (list of value/label/priceCents objects), `required` (boolean). Defined `ui.itemProps` and `ui.defaultItem`.

### 2. `lib/booking-content.ts`
- Updated `typenameToTemplate` dictionary to map:
  - `BookingStepsFieldsImageBlock` -> `"imageBlock"`
  - `BookingStepsFieldsInfoCard` -> `"infoCard"`
  - `BookingStepsFieldsInfoBanner` -> `"infoBanner"`
  - `BookingStepsFieldsTextareaInput` -> `"textareaInput"`
  - `BookingStepsFieldsSelectInput` -> `"selectInput"`
  - `BookingStepsFieldsCheckboxGroup` -> `"checkboxGroup"`
- Expanded `FormFieldBlock` TypeScript interface to include properties for all 6 new block types (`src`, `alt`, `caption`, `aspect`, `title`, `description`, `icon`, `variant`, `type`, `dismissible`, `rows`, `defaultValue`, `options` array with `value` & `priceCents`).

### 3. `components/booking/booking-drawer.tsx`
- Imported icons (`AlertTriangle`, `CheckCircle2`, `HelpCircle`, `Info`, `Shield`, `Star`, `X`) from `lucide-react`.
- Added `InfoBannerItem` helper component to manage dismissible state for banner elements.
- Expanded `switch (field._template)` block to render all 6 block types with Tailwind CSS styling consistent with the design system.
- Bound `data-tina-field={tinaAttr}` visual editing attribute to the root element of every block template.
- Maintained flat `formData` state binding for dynamic inputs (`textareaInput`, `selectInput`, `checkboxGroup`).
- Preserved Bed/Bath inputs and `calculateEstimate` logic completely intact and functional.

### 4. `lib/db/schema.ts`
- Added `customFields: jsonb("custom_fields").$type<Record<string, any>>().notNull().default({})` to the `bookingRequests` table definition.

### 5. `app/api/bookings/route.ts`
- Updated Zod validation schema `requestSchema` to allow custom fields via `.passthrough()` and `customFields: z.record(z.string(), z.unknown()).optional().default({})`.
- Updated `POST` route handler to extract non-core dynamic form fields from incoming `FormData` into a `customFields` object, parsing JSON strings for arrays/objects when applicable.
- Saved `customFields` to `db.insert(bookingRequests).values(...)`.

## Build & Typecheck Verification
- `npx tsc --noEmit`: PASS (0 type errors)
- `npm run build`: PASS (Clean Next.js build completed in 1985ms)
