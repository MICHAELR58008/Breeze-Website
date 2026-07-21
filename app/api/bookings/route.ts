import { del, put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { z } from "zod"
import { calculateEstimate, type AddOn, type ServiceType } from "@/lib/pricing"
import { db } from "@/lib/db"
import { bookingRequests } from "@/lib/db/schema"

const requestSchema = z.object({
  serviceType: z.enum(["deep", "regular"]),
  bedrooms: z.coerce.number().int().min(1).max(10),
  bathrooms: z.coerce.number().int().min(1).max(10),
  addOns: z.array(z.enum(["garage", "oven", "fridge"])).max(3),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferredWindow: z.enum(["morning", "afternoon", "flexible"]),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(7).max(30),
  website: z.string().max(0),
  startedAt: z.coerce.number(),
})

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"])

export async function POST(request: Request) {
  const uploaded: string[] = []
  try {
    const formData = await request.formData()
    const parsed = requestSchema.safeParse({
      serviceType: formData.get("serviceType"),
      bedrooms: formData.get("bedrooms"),
      bathrooms: formData.get("bathrooms"),
      addOns: JSON.parse(String(formData.get("addOns") || "[]")),
      preferredDate: formData.get("preferredDate"),
      preferredWindow: formData.get("preferredWindow"),
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      website: formData.get("website") || "",
      startedAt: formData.get("startedAt"),
    })

    if (!parsed.success || Date.now() - parsed.data.startedAt < 2500) {
      return NextResponse.json({ error: "Please review your information and try again." }, { status: 400 })
    }

    const requestedDate = new Date(`${parsed.data.preferredDate}T12:00:00`)
    if (Number.isNaN(requestedDate.getTime()) || requestedDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      return NextResponse.json({ error: "Please choose a future date." }, { status: 400 })
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
