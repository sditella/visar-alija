export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { createClient } from "@/lib/db"
import crypto from "crypto"

const SERVICE_LABELS: Record<string, string> = {
  entruempelung: "Entruempelung",
  haushaltsaufloesung: "Haushaltsaufloesung",
  firmenaufloesung: "Firmenaufloesung",
  messiraeumung: "Messiraeumung",
  kernsanierung: "Kernsanierung",
  teilsanierung: "Teilsanierung",
  entkernung: "Entkernung",
  altbausanierung: "Altbausanierung",
  renovierung: "Renovierung / Modernisierung",
  sonstiges: "Sonstiges / Unsicher",
  sonstiges_sanierung: "Sonstiges / Unsicher (Sanierung)",
}

function getDB() {
  return createClient("", "")
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      serviceType,
      propertyType,
      roomCount,
      timing,
      hasHeavyItems,
      name,
      phone,
      email,
      city,
      message,
    } = body

    if (!name || !phone || !email || !city || !serviceType) {
      return NextResponse.json(
        { error: "Bitte füllen Sie alle Pflichtfelder aus." },
        { status: 400 }
      )
    }

    const supabase = getDB()
    const { data: lead, error: dbError } = await supabase
      .from("leads")
      .insert({
        service_type: serviceType,
        property_type: propertyType,
        room_count: roomCount,
        timing,
        has_heavy_items: hasHeavyItems,
        name,
        phone,
        email,
        city,
        message: message || "",
        status: "new",
      })
      .select()
      .single()

    if (dbError) {
      console.error("DB Error:", dbError.message, dbError.details, dbError.hint)
      return NextResponse.json(
        { error: "Fehler beim Speichern: " + dbError.message },
        { status: 500 }
      )
    }

    // Send Meta Conversion API event (non-blocking)
    sendConversionApiEvent({
      eventName: "Lead",
      email,
      phone,
      city,
      serviceType: SERVICE_LABELS[serviceType] || serviceType,
      propertyType,
      sourceUrl: req.headers.get("referer") || "",
      userAgent: req.headers.get("user-agent") || "",
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "",
      fbc: body.fbc || "",
      fbp: body.fbp || "",
    }).catch((err) => console.error("[v0] CAPI error:", err))

    // Send email notification
    let emailStatus = "skipped"
    try {
      await sendNotificationEmail({
        serviceType: SERVICE_LABELS[serviceType] || serviceType,
        propertyType,
        roomCount,
        timing,
        hasHeavyItems,
        name,
        phone,
        email,
        city,
        message,
      })
      emailStatus = "sent"
    } catch (emailErr: unknown) {
      const emailMsg = emailErr instanceof Error ? emailErr.message : String(emailErr)
      console.error("[v0] Email error:", emailMsg)
      emailStatus = "failed: " + emailMsg
    }

    return NextResponse.json({ success: true, id: lead.id, emailStatus })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("Lead API catch:", msg)
    return NextResponse.json(
      { error: "Serverfehler: " + msg },
      { status: 500 }
    )
  }
}

async function sendNotificationEmail(data: {
  serviceType: string
  propertyType: string
  roomCount: string
  timing: string
  hasHeavyItems: string
  name: string
  phone: string
  email: string
  city: string
  message?: string
}) {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || "587", 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  console.log("[v0] SMTP config:", { host, port, user: user ? user.slice(0, 3) + "***" : "MISSING", pass: pass ? "SET" : "MISSING" })

  if (!host || !user || !pass) {
    console.warn("[v0] SMTP not configured, skipping email. Missing:", { host: !host, user: !user, pass: !pass })
    return
  }

  // Dynamic import to avoid edge runtime issues
  const nodemailer = await import("nodemailer")

  const transporter = nodemailer.default.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  const isSanierung = [
    "Kernsanierung", "Teilsanierung", "Entkernung",
    "Altbausanierung", "Renovierung / Modernisierung",
    "Sonstiges / Unsicher (Sanierung)",
  ].includes(data.serviceType)

  const header = isSanierung
    ? "=== NEUE ANFRAGE - MOMO SANIERUNG ==="
    : "=== NEUE ANFRAGE - MOMO ENTRUEMPELUNG ==="

  const detailLines = [
    `Dienstleistung:       ${data.serviceType}`,
    `Objektart:            ${data.propertyType}`,
    isSanierung
      ? `Flaeche (m2):         ${data.roomCount}`
      : `Raeume:               ${data.roomCount}`,
    `Zeitrahmen:           ${data.timing}`,
  ]

  if (data.hasHeavyItems) {
    detailLines.push(`Schwere Gegenstaende: ${data.hasHeavyItems}`)
  }

  const textBody = [
    header,
    "",
    "KONTAKTDATEN",
    `Name:     ${data.name}`,
    `Telefon:  ${data.phone}`,
    `E-Mail:   ${data.email}`,
    `PLZ/Ort:  ${data.city}`,
    "",
    "DETAILS ZUR ANFRAGE",
    ...detailLines,
    ...(data.message ? ["", "NACHRICHT", data.message] : []),
    "",
    "==========================================",
  ].join("\n")

  await transporter.sendMail({
    from: isSanierung
      ? `"Momo Sanierung Website" <${user}>`
      : `"Momo Entruempelung Website" <${user}>`,
    to: "info@momo-entruempelung.de",
    bcc: "info@ditella.de",
    subject: `Neue Anfrage (${isSanierung ? "Sanierung" : "Entruempelung"}): ${data.serviceType} - ${data.name}`,
    text: textBody,
  })
}

// --- Meta Conversion API (Server-Side) ---

function hashSHA256(value: string): string {
  return crypto
    .createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex")
}

function normalizePhone(phone: string): string {
  // Remove spaces, dashes, brackets
  let cleaned = phone.replace(/[\s\-()]/g, "")
  // Convert German 0-prefix to +49
  if (cleaned.startsWith("0")) {
    cleaned = "+49" + cleaned.slice(1)
  }
  // If no country code, assume Germany
  if (!cleaned.startsWith("+")) {
    cleaned = "+49" + cleaned
  }
  return cleaned
}

async function sendConversionApiEvent(params: {
  eventName: string
  email: string
  phone: string
  city: string
  serviceType: string
  propertyType: string
  sourceUrl: string
  userAgent: string
  ip: string
  fbc: string
  fbp: string
}) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const accessToken = process.env.META_CONVERSION_API_TOKEN

  if (!pixelId || !accessToken) {
    console.warn("[v0] Meta CAPI not configured, skipping")
    return
  }

  const eventId = crypto.randomUUID()
  const timestamp = Math.floor(Date.now() / 1000)

  const userData: Record<string, string> = {
    em: hashSHA256(params.email),
    ph: hashSHA256(normalizePhone(params.phone)),
    ct: hashSHA256(params.city),
    country: hashSHA256("de"),
  }

  // Add click ID and browser ID if available (from _fbc / _fbp cookies)
  if (params.fbc) userData.fbc = params.fbc
  if (params.fbp) userData.fbp = params.fbp
  if (params.ip) userData.client_ip_address = params.ip
  if (params.userAgent) userData.client_user_agent = params.userAgent

  const event = {
    event_name: params.eventName,
    event_time: timestamp,
    event_id: eventId,
    event_source_url: params.sourceUrl,
    action_source: "website",
    user_data: userData,
    custom_data: {
      content_name: params.serviceType,
      content_category: params.propertyType,
      lead_type: params.serviceType,
    },
  }

  const url = `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [event],
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error("[v0] CAPI response error:", res.status, body)
  } else {
    console.log("[v0] CAPI event sent:", params.eventName, eventId)
  }
}
