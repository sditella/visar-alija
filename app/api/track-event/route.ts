export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(`Missing Supabase env vars: url=${!!url}, key=${!!key}`)
  }
  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { sessionId, eventType, step, answer, category } = await request.json()

    if (!sessionId || !eventType || !step) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const cat = category || "entruempelung"

    // Upsert session
    const { data: existingSession } = await supabase
      .from("quiz_sessions")
      .select("id")
      .eq("session_id", sessionId)
      .maybeSingle()

    if (!existingSession) {
      await supabase.from("quiz_sessions").insert({
        session_id: sessionId,
        category: cat,
        last_step: step,
      })
    } else {
      await supabase
        .from("quiz_sessions")
        .update({ last_step: step })
        .eq("session_id", sessionId)
    }

    // Update session fields based on step answer
    if (answer) {
      const updateMap: Record<string, string> = {
        serviceType: "service_type",
        propertyType: "property_type",
        roomCount: "room_count",
        timing: "timing",
      }
      const column = updateMap[step]
      if (column) {
        await supabase
          .from("quiz_sessions")
          .update({ [column]: answer })
          .eq("session_id", sessionId)
      }
    }

    // Mark as completed
    if (eventType === "complete") {
      await supabase
        .from("quiz_sessions")
        .update({ completed_at: new Date().toISOString(), converted: true })
        .eq("session_id", sessionId)
    }

    // Insert event
    await supabase.from("quiz_events").insert({
      session_id: sessionId,
      event_type: eventType,
      step,
      answer: answer ?? null,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("[v0] track-event error:", msg)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
