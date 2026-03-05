export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { createClient } from "@/lib/db"
import { cookies } from "next/headers"

function getDB() {
  return createClient("", "")
}

async function verifyAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_session")?.value
  if (!token) return false

  const supabase = getDB()
  const { data: session } = await supabase
    .from("admin_sessions")
    .select("id")
    .eq("token", token)
    .gte("expires_at", new Date().toISOString())
    .single()

  return !!session
}

export async function GET() {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getDB()
  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(leads)
}

export async function PATCH(req: Request) {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { id, status, notes } = body

  const updateData: Record<string, string> = {}

  if (status !== undefined) {
    const validStatuses = ["new", "contacted", "appointment", "unreachable", "completed"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    updateData.status = status
  }

  if (notes !== undefined) {
    updateData.notes = notes
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
  }

  const supabase = getDB()
  const { error } = await supabase
    .from("leads")
    .update(updateData)
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 })
  }

  const supabase = getDB()
  const { error } = await supabase.from("leads").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
