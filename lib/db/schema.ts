import { date, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const bookingRequests = pgTable("booking_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceType: text("service_type").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  addOns: jsonb("add_ons").$type<string[]>().notNull().default([]),
  customFields: jsonb("custom_fields").$type<Record<string, any>>().notNull().default({}),
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
