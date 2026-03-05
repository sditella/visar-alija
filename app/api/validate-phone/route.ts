import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone")

  if (!phone) {
    return NextResponse.json({ valid: false, error: "Keine Nummer angegeben" })
  }

  const apiKey = process.env.NUMVERIFY_API_KEY
  if (!apiKey) {
    // If no API key configured, do basic format validation for German numbers
    const cleaned = phone.replace(/[\s\-\/\(\)]/g, "")
    const isGermanFormat =
      /^(\+49|0049|0)[1-9]\d{6,12}$/.test(cleaned)
    return NextResponse.json({
      valid: isGermanFormat,
      error: isGermanFormat ? undefined : "Bitte geben Sie eine gültige deutsche Telefonnummer ein",
    })
  }

  try {
    // Normalize to international format for numverify
    let normalized = phone.replace(/[\s\-\/\(\)]/g, "")
    if (normalized.startsWith("0") && !normalized.startsWith("00")) {
      normalized = "49" + normalized.slice(1)
    } else if (normalized.startsWith("+")) {
      normalized = normalized.slice(1)
    } else if (normalized.startsWith("00")) {
      normalized = normalized.slice(2)
    }

    const res = await fetch(
      `http://apilayer.net/api/validate?access_key=${apiKey}&number=${normalized}&country_code=DE&format=1`
    )
    const data = await res.json()

    if (data.valid) {
      return NextResponse.json({ valid: true })
    } else {
      return NextResponse.json({
        valid: false,
        error: "Bitte geben Sie eine gültige Telefonnummer ein",
      })
    }
  } catch {
    // On API error, fall back to basic validation
    const cleaned = phone.replace(/[\s\-\/\(\)]/g, "")
    const isGermanFormat = /^(\+49|0049|0)[1-9]\d{6,12}$/.test(cleaned)
    return NextResponse.json({
      valid: isGermanFormat,
      error: isGermanFormat ? undefined : "Bitte geben Sie eine gültige Telefonnummer ein",
    })
  }
}
