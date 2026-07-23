# Explorer API 3 Handoff Report

## 1. Observation

- **File Inspected**: `app/api/bookings/route.ts` (lines 8-20 & 28-40)
  ```ts
  const requestSchema = z.object({
    serviceType: z.string().catch("deep"),
    bedrooms: z.coerce.number().int().min(1).max(10).catch(1),
    bathrooms: z.coerce.number().int().min(1).max(10).catch(1),
    addOns: z.array(z.string()).catch([]),
    preferredDate: z.string().catch(new Date().toISOString().split("T")[0]),
    preferredWindow: z.string().catch("flexible"),
    name: z.string().trim().catch("Guest Customer"),
    email: z.string().trim().catch("customer@example.com"),
    phone: z.string().trim().catch("0000000000"),
    website: z.string().max(0).catch(""),
    startedAt: z.coerce.number().catch(Date.now()),
  })
  ```
  ```ts
  const parsed = requestSchema.safeParse({
    serviceType: formData.get("serviceType") || "deep",
    bedrooms: formData.get("bedrooms") || 1,
    bathrooms: formData.get("bathrooms") || 1,
    addOns: JSON.parse(String(formData.get("addOns") || "[]")),
    preferredDate: formData.get("preferredDate") || new Date().toISOString().split("T")[0]),
    preferredWindow: formData.get("preferredWindow") || "flexible",
    name: formData.get("name") || "Guest Customer",
    email: formData.get("email") || "customer@example.com",
    phone: formData.get("phone") || "0000000000",
    website: formData.get("website") || "",
    startedAt: formData.get("startedAt") || Date.now(),
  })
  ```
- **File Inspected**: `lib/db/schema.ts` (lines 3-20)
  ```ts
  export const bookingRequests = pgTable("booking_requests", {
    id: uuid("id").defaultRandom().primaryKey(),
    serviceType: text("service_type").notNull(),
    bedrooms: integer("bedrooms").notNull(),
    bathrooms: integer("bathrooms").notNull(),
    addOns: jsonb("add_ons").$type<string[]>().notNull().default([]),
    estimateCents: integer("estimate_cents"),
    estimateStatus: text("estimate_status").notNull(),
    preferredDate: date("preferred_date").notNull(),
    preferredWindow: text("preferred_window").notNull(),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone").notNull(),
    photoPathnames: jsonb("photo_pathnames").$type<string[]>().notNull().default([]),
    status: text("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  })
  ```
- **File Inspected**: `components/booking/booking-drawer.tsx` (lines 240-246)
  ```ts
  const body = new FormData()
  Object.entries(formData).forEach(([key, value]) => {
    body.set(key, typeof value === "object" ? JSON.stringify(value) : String(value))
  })
  ```
- **File Inspected**: `lib/pricing.ts` & `lib/booking-content.ts`:
  - Standard pricing calculation uses `bedrooms`, `bathrooms`, `serviceType`, and `addOns`. Custom dynamic inputs (e.g. text or choice inputs added via Tina CMS) do not break pricing because pricing defaults to `calculateEstimate`.

---

## 2. Logic Chain

1. **Premise**: Site administrators can define dynamic custom form fields in Tina CMS / `booking.json` steps (e.g. `squareFeet`, `notes`, `entryCode`).
2. **Observation**: `booking-drawer.tsx` stores all field responses in `formData` (a `Record<string, any>`) and serializes every key-value pair into the `FormData` body submitted to `/api/bookings`.
3. **Observation**: In `app/api/bookings/route.ts`, only 11 specific hardcoded keys are fetched from `formData` and passed to `requestSchema.safeParse(...)`.
4. **Deduction**: Any dynamic custom field present in `FormData` is silently dropped during manual payload construction in `route.ts`.
5. **Deduction**: Furthermore, `requestSchema` lacks a `customFields` record or `.passthrough()` modifier, meaning any non-core key passed to Zod would either be stripped or rejected if strict mode were enabled.
6. **Deduction**: Furthermore, `bookingRequests` in `lib/db/schema.ts` lacks a JSONB column to persist dynamic field entries.
7. **Conclusion**: To support dynamic custom fields:
   - `route.ts` must dynamically collect all entries from `formData` (or JSON) into a `rawPayload` dictionary.
   - Any key that is not one of the 11 known core fields should be automatically grouped into a `customFields` object/map.
   - `requestSchema` should be extended with `customFields: z.record(z.string(), z.unknown()).optional().default({})` and `.passthrough()`.
   - `lib/db/schema.ts` should add `customFields: jsonb("custom_fields").$type<Record<string, any>>().notNull().default({})` to store dynamic fields safely in PostgreSQL.

---

## 3. Caveats

- **Database Migration Required**: Adding `customFields` to `lib/db/schema.ts` requires running Drizzle schema migration (`npx drizzle-kit generate` / `push`) if a live PostgreSQL database is connected.
- **No Third-Party CRM / Email Handler Present**: Inspection of `app/api/bookings/route.ts` confirmed there are currently no external CRM (e.g. HubSpot, Salesforce) or email notification calls in this route handler; all persistence is handled via Drizzle ORM to Postgres and image uploads via Vercel Blob.

---

## 4. Conclusion

`app/api/bookings/route.ts` can be upgraded to support dynamic custom fields cleanly without breaking any existing core field validation, honeypot protection, or Vercel Blob uploads. The complete implementation plan and code snippets are detailed in `analysis.md`.

---

## 5. Verification Method

1. **Codebase Inspection**:
   - Verify `app/api/bookings/route.ts` against proposed changes in `analysis.md`.
   - Verify `lib/db/schema.ts` for the `customFields` column.
2. **Payload Test Simulation**:
   - Send a `POST` request to `/api/bookings` with additional fields e.g.:
     `body.append("squareFeet", "1800")`
     `body.append("specialNotes", "Clean under couch")`
   - Confirm that response status is `200 OK` with `{ success: true, requestId: "..." }`.
   - Confirm `customFields` in database record contains `{"squareFeet": "1800", "specialNotes": "Clean under couch"}`.
3. **Core Fields Invalidation Check**:
   - Omit core fields or send empty values; verify fallback defaults (`Guest Customer`, default date, etc.) still apply as expected.
