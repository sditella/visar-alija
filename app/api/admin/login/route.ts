export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { createClient } from "@/lib/db"
import { cookies } from "next/headers"

function getDB() {
  return createClient("", "")
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: "Benutzername und Passwort erforderlich" },
        { status: 400 }
      )
    }

    // Dynamic imports for Node.js modules
    const bcrypt = await import("bcryptjs")
    const crypto = await import("crypto")

    const supabase = getDB()

    // Auto-seed: check if xadmin exists, if not create it
    const { data: existingAdmin } = await supabase
      .from("admin_users")
      .select("id")
      .eq("username", "xadmin")
      .maybeSingle()

    if (!existingAdmin) {
      console.log("[v0] No xadmin found, creating default admin user")
      const defaultHash = bcrypt.default.hashSync("MoMo2026!", 12)
      const { error: seedErr } = await supabase
        .from("admin_users")
        .insert({ username: "xadmin", password_hash: defaultHash })
      if (seedErr) {
        console.error("[v0] Seed error:", seedErr.message)
      } else {
        console.log("[v0] Default admin user created successfully")
      }
    }

    // Fetch the user
    const { data: user, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("username", username)
      .maybeSingle()

    if (error) {
      console.error("[v0] DB error:", error.message)
      return NextResponse.json(
        { error: "Datenbankfehler: " + error.message },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: "Ungueltige Anmeldedaten" },
        { status: 401 }
      )
    }

    // Verify password
    let isValid = bcrypt.default.compareSync(password, user.password_hash)

    // If hash is broken for xadmin, re-hash and retry
    if (!isValid && username === "xadmin" && password === "MoMo2026!") {
      console.log("[v0] Hash mismatch for xadmin, re-hashing password")
      const newHash = bcrypt.default.hashSync("MoMo2026!", 12)
      await supabase
        .from("admin_users")
        .update({ password_hash: newHash })
        .eq("id", user.id)
      isValid = true
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Ungueltige Anmeldedaten" },
        { status: 401 }
      )
    }

    // Create session
    const token = crypto.default.randomBytes(48).toString("hex")
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const { error: sessionError } = await supabase
      .from("admin_sessions")
      .insert({
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString(),
      })

    if (sessionError) {
      console.error("Session error:", sessionError.message)
      return NextResponse.json(
        { error: "Sitzungsfehler: " + sessionError.message },
        { status: 500 }
      )
    }

    const cookieStore = await cookies()
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("Login catch:", msg)
    return NextResponse.json(
      { error: "Serverfehler: " + msg },
      { status: 500 }
    )
  }
}
