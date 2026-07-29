import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { bookingRequests } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import { createHmac } from "crypto"

function validateSession(cookieHeader: string | null): boolean {
  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret) return false

  const match = (cookieHeader || "").match(/admin_session=([^;]+)/)
  if (!match) return false

  const [signature, sessionId] = match[1].split(".")
  if (!signature || !sessionId) return false

  const expected = createHmac("sha256", adminSecret).update(sessionId).digest("hex")
  return signature === expected
}

function authorize(request: Request): NextResponse | null {
  if (!process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "ADMIN_SECRET not configured on server" }, { status: 500 })
  }
  if (!validateSession(request.headers.get("cookie"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}

export async function GET(request: Request) {
  const auth = authorize(request)
  if (auth) return auth
  try {
    const bookings = await db
      .select()
      .from(bookingRequests)
      .orderBy(desc(bookingRequests.createdAt))
      .limit(50)
    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}
