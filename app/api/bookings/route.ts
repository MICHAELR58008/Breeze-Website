import { del, put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { z } from "zod"
import { calculateEstimate, validServiceTypes, validAddOnIds, type AddOn, type ServiceType } from "@/lib/pricing"
import { db } from "@/lib/db"
import { bookingRequests } from "@/lib/db/schema"

const requestSchema = z
  .object({
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
    customFields: z.record(z.string(), z.unknown()).optional().default({}),
  })
  .passthrough()

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"])

export async function POST(request: Request) {
  const uploaded: string[] = []
  try {
    const formData = await request.formData()
    const coreKeys = new Set([
      "serviceType",
      "bedrooms",
      "bathrooms",
      "addOns",
      "preferredDate",
      "preferredWindow",
      "name",
      "email",
      "phone",
      "website",
      "startedAt",
      "photos",
    ])

    const customFields: Record<string, any> = {}
    for (const [key, value] of formData.entries()) {
      if (coreKeys.has(key)) continue
      let parsedVal: any = value
      if (typeof value === "string" && (value.startsWith("[") || value.startsWith("{"))) {
        try {
          parsedVal = JSON.parse(value)
        } catch {
          parsedVal = value
        }
      }
      customFields[key] = parsedVal
    }

    const addOnsRaw = formData.get("addOns")
    let addOnsParsed: string[] = []
    if (addOnsRaw) {
      try {
        addOnsParsed = typeof addOnsRaw === "string" ? JSON.parse(addOnsRaw) : []
      } catch {
        addOnsParsed = []
      }
    }

    const parsed = requestSchema.safeParse({
      serviceType: formData.get("serviceType") || "deep",
      bedrooms: formData.get("bedrooms") || 1,
      bathrooms: formData.get("bathrooms") || 1,
      addOns: addOnsParsed,
      preferredDate: formData.get("preferredDate") || new Date().toISOString().split("T")[0],
      preferredWindow: formData.get("preferredWindow") || "flexible",
      name: formData.get("name") || "Guest Customer",
      email: formData.get("email") || "customer@example.com",
      phone: formData.get("phone") || "0000000000",
      website: formData.get("website") || "",
      startedAt: formData.get("startedAt") || Date.now(),
      customFields,
    })

    if (!parsed.success) {
      return NextResponse.json({ error: "Please review your information and try again." }, { status: 400 })
    }

    const photos = formData.getAll("photos").filter((item): item is File => item instanceof File && item.size > 0)
    if (photos.length > 5 || photos.some((file) => file.size > 5 * 1024 * 1024 || !allowedTypes.has(file.type))) {
      return NextResponse.json({ error: "Upload up to 5 JPG, PNG, WEBP, or HEIC photos under 5 MB each." }, { status: 400 })
    }

    const requestId = crypto.randomUUID()
    for (const [index, photo] of photos.entries()) {
      const extension = photo.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg"
      const blob = await put(`booking-photos/${requestId}/${index}.${extension}`, photo, {
        access: "private",
        addRandomSuffix: true,
      })
      uploaded.push(blob.pathname)
    }

    const estimate = calculateEstimate(
      parsed.data.serviceType as ServiceType,
      parsed.data.bedrooms,
      parsed.data.bathrooms,
      parsed.data.addOns as AddOn[],
    )

    await db.insert(bookingRequests).values({
      id: requestId,
      serviceType: parsed.data.serviceType,
      bedrooms: parsed.data.bedrooms,
      bathrooms: parsed.data.bathrooms,
      addOns: parsed.data.addOns,
      customFields: parsed.data.customFields || {},
      estimateCents: estimate,
      estimateStatus: estimate === null ? "custom_quote" : "estimated",
      preferredDate: parsed.data.preferredDate,
      preferredWindow: parsed.data.preferredWindow,
      customerName: parsed.data.name,
      customerEmail: parsed.data.email,
      customerPhone: parsed.data.phone,
      photoPathnames: uploaded,
    })

    return NextResponse.json({ success: true, requestId })
  } catch (error) {
    if (uploaded.length) await del(uploaded).catch(() => undefined)
    console.error("Booking request failed", error)
    return NextResponse.json({ error: "We could not submit your request. Please call or email Breeze instead." }, { status: 500 })
  }
}
