"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Home,
  Building2,
  Warehouse,
  HelpCircle,
  Send,
  MessageCircle,
  Trash2,
  Clock,
  Package,
  Paintbrush,
  SprayCan,
  TreePine,
  Loader2,
  AlertCircle,
  Skull,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getOrCreateSessionId, trackEvent } from "@/lib/quiz-tracking"

type QuizData = {
  serviceType: string
  propertyType: string
  roomCount: string
  timing: string
  hasHeavyItems: string
  name: string
  phone: string
  email: string
  city: string
  message: string
}

const initialData: QuizData = {
  serviceType: "",
  propertyType: "",
  roomCount: "",
  timing: "",
  hasHeavyItems: "",
  name: "",
  phone: "",
  email: "",
  city: "",
  message: "",
}

const TOTAL_STEPS = 6

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = (current / total) * 100
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          Schritt {current} von {total}
        </span>
        <span className="text-xs font-bold" style={{ color: "#EFA609" }}>
          {Math.round(pct)}%
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(239,166,9,0.15)" }}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: "#EFA609" }}
        />
      </div>
    </div>
  )
}

function OptionCard({
  label,
  icon,
  selected,
  onClick,
}: {
  label: string
  icon?: React.ReactNode
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full p-3.5 rounded-xl border-2 text-left transition-all duration-200",
        selected
          ? "border-[#EFA609] bg-[#EFA609]/5 shadow-sm"
          : "border-border bg-card hover:border-[#EFA609]/40 hover:bg-accent"
      )}
    >
      {icon && (
        <div
          className={cn(
            "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
            selected
              ? "bg-[#EFA609]/20 text-[#EFA609]"
              : "bg-secondary text-muted-foreground"
          )}
        >
          {icon}
        </div>
      )}
      <span
        className={cn(
          "font-medium text-sm flex-1",
          selected ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
      {selected && (
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "#EFA609" }} />
      )}
    </button>
  )
}

const STEP_NAMES = ["serviceType", "propertyType", "roomCount", "timing", "hasHeavyItems", "contact"]

export function LeadQuiz() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<QuizData>(initialData)
  const [submitted, setSubmitted] = useState(false)
  const sessionIdRef = useRef<string>("")

  // Track step views
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = getOrCreateSessionId("entruempelung")
    }
    const stepName = STEP_NAMES[step - 1] || "unknown"
    trackEvent({
      sessionId: sessionIdRef.current,
      eventType: "step_view",
      step: stepName,
      category: "entruempelung",
    })
  }, [step])
  const [phoneValidation, setPhoneValidation] = useState<{
    status: "idle" | "validating" | "valid" | "invalid"
    message: string
  }>({ status: "idle", message: "" })

  const update = (key: keyof QuizData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  const validatePhone = useCallback(async (phone: string) => {
    if (!phone || phone.replace(/\D/g, "").length < 6) {
      setPhoneValidation({ status: "idle", message: "" })
      return
    }
    setPhoneValidation({ status: "validating", message: "" })
    try {
      const res = await fetch(
        `/api/validate-phone?phone=${encodeURIComponent(phone)}`
      )
      const result = await res.json()
      if (result.valid) {
        setPhoneValidation({ status: "valid", message: "Nummer verifiziert" })
      } else {
        setPhoneValidation({
          status: "invalid",
          message: result.error || "Bitte geben Sie eine gültige Telefonnummer ein",
        })
      }
    } catch {
      // If the API fails, don't block the user
      setPhoneValidation({ status: "valid", message: "" })
    }
  }, [])

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!data.serviceType
      case 2:
        return !!data.propertyType
      case 3:
        return !!data.roomCount
      case 4:
        return !!data.timing
      case 5:
        return !!data.hasHeavyItems
      case 6:
        return !!data.name && !!data.phone && !!data.email && !!data.city && phoneValidation.status !== "invalid"
      default:
        return false
    }
  }

  const next = () => {
    if (step < TOTAL_STEPS && canProceed()) setStep(step + 1)
  }

  const prev = () => {
    if (step > 1) setStep(step - 1)
  }

  const autoAdvance = (key: keyof QuizData, value: string) => {
    update(key, value)
    trackEvent({
      sessionId: sessionIdRef.current,
      eventType: "answer",
      step: key,
      answer: value,
      category: "entruempelung",
    })
    if (step < TOTAL_STEPS) {
      setTimeout(() => setStep((s) => s + 1), 350)
    }
  }

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError("")
    try {
      // Read Meta cookies for Conversion API quality matching
      const getCookie = (name: string) => {
        const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
        return match ? match[2] : ""
      }
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          fbc: getCookie("_fbc"),
          fbp: getCookie("_fbp"),
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        setSubmitError(result.error || "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.")
        return
      }
      // Track quiz completion
      trackEvent({
        sessionId: sessionIdRef.current,
        eventType: "complete",
        step: "contact",
        category: "entruempelung",
      })
      // Fire Meta Pixel Lead event
      if (typeof window !== "undefined" && typeof (window as Record<string, unknown>).fbq === "function") {
        (window as Record<string, unknown> & { fbq: (...args: unknown[]) => void }).fbq("track", "Lead", {
          content_name: data.serviceType,
          content_category: data.propertyType,
          city: data.city,
        })
      }
      setSubmitted(true)
    } catch {
      setSubmitError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 text-center shadow-xl">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: "rgba(239,166,9,0.1)" }}
        >
          <CheckCircle2 className="w-8 h-8" style={{ color: "#EFA609" }} />
        </div>
        <h2
          className="text-xl sm:text-2xl font-bold text-foreground mb-3"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Vielen Dank, {data.name}!
        </h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed max-w-md mx-auto">
          Ihre Anfrage wurde erfolgreich gesendet. Wir melden uns innerhalb von
          24 Stunden bei Ihnen &ndash; meistens sogar schneller!
        </p>
        <div className="flex flex-col gap-3">
          <a href="tel:+491736151556" className="w-full">
            <Button
              className="w-full font-semibold text-sm py-5"
              style={{
                backgroundColor: "#EFA609",
                color: "#1a1000",
              }}
            >
              Jetzt anrufen: 0173 6151 556
            </Button>
          </a>
          <a
            href="https://wa.me/491736151556?text=Hallo%2C%20ich%20habe%20gerade%20eine%20Anfrage%20%C3%BCber%20Ihre%20Website%20gestellt%20und%20w%C3%BCrde%20gerne%20mehr%20erfahren."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button
              variant="outline"
              className="w-full font-semibold text-sm py-5 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Per WhatsApp schreiben
            </Button>
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-5 sm:p-7 shadow-xl">
      <ProgressBar current={step} total={TOTAL_STEPS} />

      <div className="min-h-[320px] flex flex-col">
        {/* Step 1 */}
        {step === 1 && (
          <div className="flex-1">
            <h3
              className="text-base font-bold text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Welche Dienstleistung brauchen Sie?
            </h3>
            <div className="flex flex-col gap-2.5">
              {[
                { value: "entruempelung", label: "Entrümpelung", icon: <Trash2 className="w-4 h-4" /> },
                { value: "haushaltsaufloesung", label: "Haushaltsauflösung", icon: <Home className="w-4 h-4" /> },
                { value: "firmenaufloesung", label: "Firmenauflösung", icon: <Building2 className="w-4 h-4" /> },
                { value: "messiraeumung", label: "Messiräumung", icon: <Warehouse className="w-4 h-4" /> },
                { value: "sonstiges", label: "Sonstiges / Unsicher", icon: <HelpCircle className="w-4 h-4" /> },
              ].map((opt) => (
                <OptionCard
                  key={opt.value}
                  label={opt.label}
                  icon={opt.icon}
                  selected={data.serviceType === opt.value}
                  onClick={() => autoAdvance("serviceType", opt.value)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="flex-1">
            <h3
              className="text-base font-bold text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Um welches Objekt handelt es sich?
            </h3>
            <div className="flex flex-col gap-2.5">
              {[
                { label: "Wohnung", icon: <Home className="w-4 h-4" /> },
                { label: "Einfamilienhaus", icon: <Building2 className="w-4 h-4" /> },
                { label: "Keller / Dachboden", icon: <Warehouse className="w-4 h-4" /> },
                { label: "Garage / Schuppen", icon: <Package className="w-4 h-4" /> },
                { label: "Büro / Gewerbe", icon: <Building2 className="w-4 h-4" /> },
              ].map((opt) => (
                <OptionCard
                  key={opt.label}
                  label={opt.label}
                  icon={opt.icon}
                  selected={data.propertyType === opt.label}
                  onClick={() => autoAdvance("propertyType", opt.label)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="flex-1">
            <h3
              className="text-base font-bold text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Wie groß ist die Fläche?
            </h3>
            <div className="flex flex-col gap-2.5">
              {[
                "1–2 Räume",
                "3–4 Räume",
                "5+ Räume / Ganzes Haus",
                "Nur Keller oder Dachboden",
                "Einzelne Gegenstände",
              ].map((opt) => (
                <OptionCard
                  key={opt}
                  label={opt}
                  selected={data.roomCount === opt}
                  onClick={() => autoAdvance("roomCount", opt)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="flex-1">
            <h3
              className="text-base font-bold text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Wann soll es losgehen?
            </h3>
            <div className="flex flex-col gap-2.5">
              {[
                { label: "So schnell wie möglich", icon: <Clock className="w-4 h-4" /> },
                { label: "Innerhalb von 7 Tagen", icon: <Clock className="w-4 h-4" /> },
                { label: "In 2–4 Wochen", icon: <Clock className="w-4 h-4" /> },
                { label: "Flexibel / Kein Zeitdruck", icon: <Clock className="w-4 h-4" /> },
              ].map((opt) => (
                <OptionCard
                  key={opt.label}
                  label={opt.label}
                  icon={opt.icon}
                  selected={data.timing === opt.label}
                  onClick={() => autoAdvance("timing", opt.label)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 5 */}
        {step === 5 && (
          <div className="flex-1">
            <h3
              className="text-base font-bold text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Schwere oder sperrige Gegenstände?
            </h3>
            <div className="flex flex-col gap-2.5">
              {[
                "Ja, z.B. Klavier, Tresor, schwere Möbel",
                "Einige größere Möbelstücke",
                "Nein, hauptsächlich Kleinteile",
                "Weiß ich nicht genau",
              ].map((opt) => (
                <OptionCard
                  key={opt}
                  label={opt}
                  selected={data.hasHeavyItems === opt}
                  onClick={() => autoAdvance("hasHeavyItems", opt)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Contact */}
        {step === 6 && (
          <div className="flex-1">
            <h3
              className="text-base font-bold text-foreground mb-1"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Fast geschafft! Wie erreichen wir Sie?
            </h3>
            <p className="text-xs text-muted-foreground mb-5">
              Wir melden uns schnellstmöglich mit Ihrem persönlichen Angebot.
            </p>
            <div className="flex flex-col gap-3.5">
              <div>
                <label
                  htmlFor="quiz-name"
                  className="block text-xs font-semibold text-foreground mb-1"
                >
                  Name <span className="text-destructive">*</span>
                </label>
                <input
                  id="quiz-name"
                  type="text"
                  placeholder="Ihr vollständiger Name"
                  value={data.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#EFA609]/50 focus:border-[#EFA609] transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="quiz-phone"
                  className="block text-xs font-semibold text-foreground mb-1"
                >
                  Telefon <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    id="quiz-phone"
                    type="tel"
                    placeholder="z.B. 0173 6151556"
                    value={data.phone}
                    onChange={(e) => {
                      update("phone", e.target.value)
                      setPhoneValidation({ status: "idle", message: "" })
                    }}
                    onBlur={(e) => validatePhone(e.target.value)}
                    className={cn(
                      "w-full rounded-lg border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-colors pr-10",
                      phoneValidation.status === "invalid"
                        ? "border-destructive focus:ring-destructive/50 focus:border-destructive"
                        : phoneValidation.status === "valid"
                        ? "border-green-500 focus:ring-green-500/50 focus:border-green-500"
                        : "border-input focus:ring-[#EFA609]/50 focus:border-[#EFA609]"
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {phoneValidation.status === "validating" && (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    )}
                    {phoneValidation.status === "valid" && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                    {phoneValidation.status === "invalid" && (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                </div>
                {phoneValidation.status === "invalid" && (
                  <p className="text-xs text-destructive mt-1">
                    {phoneValidation.message}
                  </p>
                )}
                {phoneValidation.status === "valid" && phoneValidation.message && (
                  <p className="text-xs text-green-600 mt-1">
                    {phoneValidation.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="quiz-email"
                  className="block text-xs font-semibold text-foreground mb-1"
                >
                  E-Mail <span className="text-destructive">*</span>
                </label>
                <input
                  id="quiz-email"
                  type="email"
                  placeholder="Ihre E-Mail-Adresse"
                  value={data.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#EFA609]/50 focus:border-[#EFA609] transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="quiz-city"
                  className="block text-xs font-semibold text-foreground mb-1"
                >
                  PLZ / Ort <span className="text-destructive">*</span>
                </label>
                <input
                  id="quiz-city"
                  type="text"
                  placeholder="z.B. 68642 Bürstadt"
                  value={data.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#EFA609]/50 focus:border-[#EFA609] transition-colors"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {submitError && (
        <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-xs text-destructive font-medium">{submitError}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
        {step > 1 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={prev}
            disabled={submitting}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Zurück
          </Button>
        ) : (
          <div />
        )}

        {step < TOTAL_STEPS ? (
          <Button
            type="button"
            onClick={next}
            disabled={!canProceed()}
            size="sm"
            className="font-semibold px-6"
            style={{
              backgroundColor: canProceed() ? "#EFA609" : undefined,
              color: canProceed() ? "#1a1000" : undefined,
            }}
          >
            Weiter
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canProceed() || submitting}
            size="sm"
            className="font-semibold px-6"
            style={{
              backgroundColor: canProceed() && !submitting ? "#EFA609" : undefined,
              color: canProceed() && !submitting ? "#1a1000" : undefined,
            }}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Wird gesendet...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-1" />
                Absenden
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
