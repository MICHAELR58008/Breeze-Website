import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { z } from "zod"

const bookingJsonPath = path.join(process.cwd(), "content", "booking", "booking.json")

const serviceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().default(""),
  subtitle: z.string().optional().default(""),
  features: z.array(z.string()).optional().default([]),
  basePriceCents: z.number().nonnegative(),
  pricePerBedroomCents: z.number().nonnegative(),
  pricePerBathroomCents: z.number().nonnegative(),
})

const addOnSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  cents: z.number().nonnegative(),
})

const updatePricingSchema = z.object({
  services: z.array(serviceSchema),
  addOns: z.array(addOnSchema),
})

export async function GET() {
  try {
    const fileData = await fs.readFile(bookingJsonPath, "utf-8")
    const booking = JSON.parse(fileData)
    return NextResponse.json({
      services: booking.services || [],
      addOns: booking.addOns || [],
    })
  } catch (error) {
    console.error("Error reading pricing data:", error)
    return NextResponse.json({ error: "Failed to read pricing content" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const parsed = updatePricingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid pricing payload", details: parsed.error.format() },
        { status: 400 }
      )
    }

    const fileData = await fs.readFile(bookingJsonPath, "utf-8")
    const booking = JSON.parse(fileData)

    booking.services = parsed.data.services
    booking.addOns = parsed.data.addOns

    await fs.writeFile(bookingJsonPath, JSON.stringify(booking, null, 2), "utf-8")

    return NextResponse.json({ success: true, services: booking.services, addOns: booking.addOns })
  } catch (error) {
    console.error("Error updating pricing data:", error)
    return NextResponse.json({ error: "Failed to save pricing changes" }, { status: 500 })
  }
}
