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
  Clock,
  Loader2,
  AlertCircle,
  Hammer,
  Layers,
  Wrench,
  Landmark,
  PaintBucket,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getOrCreateSessionId, trackEvent } from "@/lib/quiz-tracking"

type QuizData = {
  serviceType: string
  propertyType: string
  roomCount: string
  timing: string
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
  name: "",
  phone: "",
  email: "",
  city: "",
  message: "",
}

const TOTAL_STEPS = 5

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

const STEP_NAMES_SAN = ["serviceType", "propertyType", "roomCount", "timing", "contact"]

export function SanierungQuiz() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<QuizData>(initialData)
  const [submitted, setSubmitted] = useState(false)
  const sessionIdRef = useRef<string>("")

  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = getOrCreateSessionId("sanierung")
    }
    const stepName = STEP_NAMES_SAN[step - 1] || "unknown"
    trackEvent({
      sessionId: sessionIdRef.current,
      eventType: "step_view",
      step: stepName,
      category: "sanierung",
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
          message: result.error || "Bitte geben Sie eine gueltige Telefonnummer ein",
        })
      }
    } catch {
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
      category: "sanierung",
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
      const getCookie = (name: string) => {
        const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
        return match ? match[2] : ""
      }
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: data.serviceType,
          propertyType: data.propertyType,
          roomCount: data.roomCount,
          timing: data.timing,
          hasHeavyItems: "",
          name: data.name,
          phone: data.phone,
          email: data.email,
          city: data.city,
          message: data.message,
          fbc: getCookie("_fbc"),
          fbp: getCookie("_fbp"),
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        setSubmitError(result.error || "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.")
        return
      }
      trackEvent({
        sessionId: sessionIdRef.current,
        eventType: "complete",
        step: "contact",
        category: "sanierung",
      })
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
          Ihre Sanierungsanfrage wurde erfolgreich gesendet. Wir melden uns innerhalb von
          24 Stunden bei Ihnen mit einem individuellen Angebot.
        </p>
        <div className="flex flex-col gap-3">
          <a href="tel:+491736151556" className="w-full">
            <Button
              className="w-full font-semibold text-sm py-5"
              style={{ backgroundColor: "#EFA609", color: "#1a1000" }}
            >
              Jetzt anrufen: 0173 6151 556
            </Button>
          </a>
          <a
            href="https://wa.me/491736151556?text=Hallo%2C%20ich%20habe%20gerade%20eine%20Sanierungsanfrage%20%C3%BCber%20Ihre%20Website%20gestellt."
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
        {/* Step 1: Art der Sanierung */}
        {step === 1 && (
          <div className="flex-1">
            <h3
              className="text-base font-bold text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Welche Art von Sanierung brauchen Sie?
            </h3>
            <div className="flex flex-col gap-2.5">
              {[
                { value: "kernsanierung", label: "Kernsanierung", icon: <Hammer className="w-4 h-4" /> },
                { value: "teilsanierung", label: "Teilsanierung", icon: <Wrench className="w-4 h-4" /> },
                { value: "entkernung", label: "Entkernung", icon: <Layers className="w-4 h-4" /> },
                { value: "altbausanierung", label: "Altbausanierung", icon: <Landmark className="w-4 h-4" /> },
                { value: "renovierung", label: "Renovierung / Modernisierung", icon: <PaintBucket className="w-4 h-4" /> },
                { value: "sonstiges_sanierung", label: "Sonstiges / Unsicher", icon: <HelpCircle className="w-4 h-4" /> },
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

        {/* Step 2: Objektart */}
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
                { label: "Mehrfamilienhaus", icon: <Building2 className="w-4 h-4" /> },
                { label: "Altbau / Denkmalschutz", icon: <Landmark className="w-4 h-4" /> },
                { label: "Gewerbe / Buero", icon: <Warehouse className="w-4 h-4" /> },
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

        {/* Step 3: Flaeche */}
        {step === 3 && (
          <div className="flex-1">
            <h3
              className="text-base font-bold text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Wie gross ist die zu sanierende Flaeche?
            </h3>
            <div className="flex flex-col gap-2.5">
              {[
                "Bis 50 m\u00B2",
                "50 - 100 m\u00B2",
                "100 - 200 m\u00B2",
                "Ueber 200 m\u00B2",
                "Weiss ich noch nicht genau",
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

        {/* Step 4: Zeitrahmen */}
        {step === 4 && (
          <div className="flex-1">
            <h3
              className="text-base font-bold text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Wann soll die Sanierung starten?
            </h3>
            <div className="flex flex-col gap-2.5">
              {[
                { label: "So schnell wie moeglich", icon: <Clock className="w-4 h-4" /> },
                { label: "Innerhalb von 2 Wochen", icon: <Clock className="w-4 h-4" /> },
                { label: "In 1-3 Monaten", icon: <Clock className="w-4 h-4" /> },
                { label: "Flexibel / Noch in Planung", icon: <Clock className="w-4 h-4" /> },
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

        {/* Step 5: Kontaktdaten */}
        {step === 5 && (
          <div className="flex-1">
            <h3
              className="text-base font-bold text-foreground mb-1"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Fast geschafft! Wie erreichen wir Sie?
            </h3>
            <p className="text-xs text-muted-foreground mb-5">
              Wir melden uns schnellstmoeglich mit Ihrem individuellen Sanierungsangebot.
            </p>
            <div className="flex flex-col gap-3.5">
              <div>
                <label htmlFor="san-name" className="block text-xs font-semibold text-foreground mb-1">
                  Name <span className="text-destructive">*</span>
                </label>
                <input
                  id="san-name"
                  type="text"
                  placeholder="Ihr vollstaendiger Name"
                  value={data.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#EFA609]/50 focus:border-[#EFA609] transition-colors"
                />
              </div>
              <div>
                <label htmlFor="san-phone" className="block text-xs font-semibold text-foreground mb-1">
                  Telefon <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    id="san-phone"
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
                  <p className="text-xs text-destructive mt-1">{phoneValidation.message}</p>
                )}
                {phoneValidation.status === "valid" && phoneValidation.message && (
                  <p className="text-xs text-green-600 mt-1">{phoneValidation.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="san-email" className="block text-xs font-semibold text-foreground mb-1">
                  E-Mail <span className="text-destructive">*</span>
                </label>
                <input
                  id="san-email"
                  type="email"
                  placeholder="Ihre E-Mail-Adresse"
                  value={data.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#EFA609]/50 focus:border-[#EFA609] transition-colors"
                />
              </div>
              <div>
                <label htmlFor="san-city" className="block text-xs font-semibold text-foreground mb-1">
                  PLZ / Ort <span className="text-destructive">*</span>
                </label>
                <input
                  id="san-city"
                  type="text"
                  placeholder="z.B. 68642 Buerstadt"
                  value={data.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#EFA609]/50 focus:border-[#EFA609] transition-colors"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
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
            Zurueck
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
