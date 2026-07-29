import { NextResponse } from "next/server"
import { createHmac, randomUUID } from "crypto"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    const storedPassword = process.env.ADMIN_PASSWORD
    const adminSecret = process.env.ADMIN_SECRET

    if (!storedPassword || !adminSecret) {
      return NextResponse.json(
        { error: "Admin auth is not configured on server" },
        { status: 500 }
      )
    }

    if (!password || password !== storedPassword) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      )
    }

    const sessionId = randomUUID()
    const signature = createHmac("sha256", adminSecret)
      .update(sessionId)
      .digest("hex")

    const cookieValue = `${signature}.${sessionId}`
    const maxAge = 8 * 60 * 60

    const response = NextResponse.json({ success: true })
    response.cookies.set("admin_session", cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge,
      path: "/",
    })

    return response
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    )
  }
}
