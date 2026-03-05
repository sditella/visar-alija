export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(`Missing Supabase env vars: url=${!!url}, key=${!!key}`)
  }
  return createClient(url, key)
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("admin_session")?.value

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const supabase = getSupabase()
    const { data: session } = await supabase
      .from("admin_sessions")
      .select("*, admin_users(username)")
      .eq("token", token)
      .gte("expires_at", new Date().toISOString())
      .single()

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      username: session.admin_users?.username,
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
      const supabase = getSupabase()
      await supabase.from("admin_sessions").delete().eq("token", token)
      cookieStore.delete("admin_session")
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
