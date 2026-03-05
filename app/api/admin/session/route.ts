export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { createClient } from "@/lib/db"
import { cookies } from "next/headers"

function getDB() {
  return createClient("", "")
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("admin_session")?.value

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const db = getDB()
    const { data: session } = await db
      .from("admin_sessions")
      .select("user_id")
      .eq("token", token)
      .gte("expires_at", new Date().toISOString())
      .single()

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const { data: user } = await db
      .from("admin_users")
      .select("username")
      .eq("id", (session as { user_id: string }).user_id)
      .single()

    return NextResponse.json({
      authenticated: true,
      username: (user as { username?: string } | null)?.username,
    })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("admin_session")?.value

    if (token) {
      const db = getDB()
      await db.from("admin_sessions").delete().eq("token", token)
      cookieStore.delete("admin_session")
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
