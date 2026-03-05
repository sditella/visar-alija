export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/db"

function getDB() {
  return createClient("", "")
}

const STEP_ORDER_ENTRUEMPELUNG = ["serviceType", "propertyType", "roomCount", "timing", "contact"]
const STEP_LABELS_ENTRUEMPELUNG: Record<string, string> = {
  serviceType: "Schritt 1: Dienstleistung",
  propertyType: "Schritt 2: Objektart",
  roomCount: "Schritt 3: Flaeche",
  timing: "Schritt 4: Zeitrahmen",
  contact: "Schritt 5: Kontaktdaten",
}

const STEP_ORDER_SANIERUNG = ["serviceType", "propertyType", "roomCount", "timing", "contact"]
const STEP_LABELS_SANIERUNG: Record<string, string> = {
  serviceType: "Schritt 1: Sanierungsart",
  propertyType: "Schritt 2: Objektart",
  roomCount: "Schritt 3: Flaeche (m2)",
  timing: "Schritt 4: Zeitrahmen",
  contact: "Schritt 5: Kontaktdaten",
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getDB()
    const category = request.nextUrl.searchParams.get("category") || "entruempelung"

    const stepOrder = category === "sanierung" ? STEP_ORDER_SANIERUNG : STEP_ORDER_ENTRUEMPELUNG
    const stepLabels = category === "sanierung" ? STEP_LABELS_SANIERUNG : STEP_LABELS_ENTRUEMPELUNG

    // Get all session IDs for this category
    const { data: sessions } = await supabase
      .from("quiz_sessions")
      .select("session_id")
      .eq("category", category)

    const sessionIds = (sessions || []).map((s) => s.session_id)

    // Funnel: count distinct sessions per step_view
    let funnel = stepOrder.map((step) => ({
      step,
      label: stepLabels[step] || step,
      count: 0,
    }))

    if (sessionIds.length > 0) {
      const { data: events } = await supabase
        .from("quiz_events")
        .select("step, session_id")
        .eq("event_type", "step_view")
        .in("session_id", sessionIds)

      const stepCounts: Record<string, Set<string>> = {}
      for (const ev of events || []) {
        if (!stepCounts[ev.step]) stepCounts[ev.step] = new Set()
        stepCounts[ev.step].add(ev.session_id)
      }

      funnel = stepOrder.map((step) => ({
        step,
        label: stepLabels[step] || step,
        count: stepCounts[step]?.size || 0,
      }))
    }

    // Answers per step
    const answersByStep: Record<string, { answer: string; count: number }[]> = {}

    if (sessionIds.length > 0) {
      const { data: answerEvents } = await supabase
        .from("quiz_events")
        .select("step, answer")
        .eq("event_type", "answer")
        .not("answer", "is", null)
        .in("session_id", sessionIds)

      const answerCounts: Record<string, Record<string, number>> = {}
      for (const ev of answerEvents || []) {
        if (!answerCounts[ev.step]) answerCounts[ev.step] = {}
        answerCounts[ev.step][ev.answer] = (answerCounts[ev.step][ev.answer] || 0) + 1
      }

      for (const [step, answers] of Object.entries(answerCounts)) {
        answersByStep[step] = Object.entries(answers)
          .map(([answer, count]) => ({ answer, count }))
          .sort((a, b) => b.count - a.count)
      }
    }

    // Overall stats
    const { count: total } = await supabase
      .from("quiz_sessions")
      .select("*", { count: "exact", head: true })
      .eq("category", category)

    const { count: conversions } = await supabase
      .from("quiz_sessions")
      .select("*", { count: "exact", head: true })
      .eq("category", category)
      .eq("converted", true)

    const totalN = total || 0
    const conversionsN = conversions || 0
    const conversionRate = totalN > 0 ? Math.round((conversionsN / totalN) * 100 * 100) / 100 : 0

    // Recent sessions
    const { data: recentSessions } = await supabase
      .from("quiz_sessions")
      .select("session_id, started_at, last_step, service_type, property_type, room_count, timing, converted")
      .eq("category", category)
      .order("started_at", { ascending: false })
      .limit(20)

    // Saved reports for this category
    const { data: reports } = await supabase
      .from("analytics_reports")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false })

    return NextResponse.json({
      funnel,
      answersByStep,
      stats: { total: totalN, conversions: conversionsN, conversionRate },
      recentSessions: recentSessions || [],
      reports: reports || [],
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("[v0] analytics error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST: Create snapshot and reset for a category
export async function POST(request: NextRequest) {
  try {
    const { action, name, category } = await request.json()
    const cat = category || "entruempelung"

    if (action !== "snapshot_and_reset") {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }

    const supabase = getDB()
    const reportName = name || `Report ${new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}`

    // Get period for this category
    const { data: periodData } = await supabase
      .from("quiz_sessions")
      .select("started_at")
      .eq("category", cat)
      .order("started_at", { ascending: true })
      .limit(1)

    const { data: periodEndData } = await supabase
      .from("quiz_sessions")
      .select("started_at")
      .eq("category", cat)
      .order("started_at", { ascending: false })
      .limit(1)

    const periodStart = periodData?.[0]?.started_at || new Date().toISOString()
    const periodEnd = periodEndData?.[0]?.started_at || new Date().toISOString()

    // Stats
    const { count: total } = await supabase
      .from("quiz_sessions")
      .select("*", { count: "exact", head: true })
      .eq("category", cat)

    const { count: conversions } = await supabase
      .from("quiz_sessions")
      .select("*", { count: "exact", head: true })
      .eq("category", cat)
      .eq("converted", true)

    const totalN = total || 0
    const conversionsN = conversions || 0
    const conversionRate = totalN > 0 ? Math.round((conversionsN / totalN) * 100 * 100) / 100 : 0

    // Funnel data
    const { data: catSessions } = await supabase
      .from("quiz_sessions")
      .select("session_id")
      .eq("category", cat)

    const sessionIds = (catSessions || []).map((s) => s.session_id)

    let funnelData: { step: string; count: number }[] = []
    const stepOrder = cat === "sanierung" ? STEP_ORDER_SANIERUNG : STEP_ORDER_ENTRUEMPELUNG

    if (sessionIds.length > 0) {
      const { data: funnelEvents } = await supabase
        .from("quiz_events")
        .select("step, session_id")
        .eq("event_type", "step_view")
        .in("session_id", sessionIds)

      const stepCounts: Record<string, Set<string>> = {}
      for (const ev of funnelEvents || []) {
        if (!stepCounts[ev.step]) stepCounts[ev.step] = new Set()
        stepCounts[ev.step].add(ev.session_id)
      }

      funnelData = stepOrder.map((step) => ({
        step,
        count: stepCounts[step]?.size || 0,
      }))
    }

    // Answers data
    const answersData: Record<string, { answer: string; count: number }[]> = {}
    if (sessionIds.length > 0) {
      const { data: answerEvents } = await supabase
        .from("quiz_events")
        .select("step, answer")
        .eq("event_type", "answer")
        .not("answer", "is", null)
        .in("session_id", sessionIds)

      const answerCounts: Record<string, Record<string, number>> = {}
      for (const ev of answerEvents || []) {
        if (!answerCounts[ev.step]) answerCounts[ev.step] = {}
        answerCounts[ev.step][ev.answer] = (answerCounts[ev.step][ev.answer] || 0) + 1
      }

      for (const [step, answers] of Object.entries(answerCounts)) {
        answersData[step] = Object.entries(answers)
          .map(([answer, count]) => ({ answer, count }))
          .sort((a, b) => b.count - a.count)
      }
    }

    // Save snapshot
    await supabase.from("analytics_reports").insert({
      category: cat,
      name: reportName,
      period_start: periodStart,
      period_end: periodEnd,
      total_sessions: totalN,
      conversions: conversionsN,
      conversion_rate: conversionRate,
      funnel_data: funnelData,
      answers_data: answersData,
    })

    // Delete events for sessions of this category, then delete sessions
    if (sessionIds.length > 0) {
      await supabase.from("quiz_events").delete().in("session_id", sessionIds)
    }
    await supabase.from("quiz_sessions").delete().eq("category", cat)

    return NextResponse.json({
      success: true,
      message: `Report "${reportName}" gespeichert und ${cat === "sanierung" ? "Sanierung" : "Entruempelung"}-Analytics zurueckgesetzt.`,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("[v0] analytics reset error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
