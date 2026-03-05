"use client"

import Image from "next/image"
import { Phone, MessageCircle, Star, Shield, Clock, CheckCircle2 } from "lucide-react"
import { LeadQuiz } from "@/components/lead-quiz"

export function HeroQuiz() {
  return (
    <section className="relative min-h-screen flex flex-col" style={{ backgroundColor: "#111" }}>
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/hero-bg.jpg)" }}
      >
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.65) 60%, rgba(0,0,0,0.80) 100%)" }} />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10">
          <Image
            src="/images/logo.png"
            alt="Momo Entrümpelung Logo"
            width={140}
            height={42}
            className="h-9 w-auto"
            priority
          />
          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/491736151556?text=Hallo%2C%20ich%20h%C3%A4tte%20gerne%20ein%20Angebot."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-white/10"
              title="WhatsApp"
              aria-label="WhatsApp schreiben"
            >
              <MessageCircle className="w-5 h-5" style={{ color: "#25D366" }} />
            </a>
            <a
              href="tel:+491736151556"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              <Phone className="w-4 h-4" style={{ color: "#EFA609" }} />
              <span className="hidden sm:inline">0173 6151 556</span>
            </a>
          </div>
        </div>

        {/* Content: Quiz first on mobile, side by side on desktop */}
        <div className="flex-1 flex items-start lg:items-center px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
          <div className="mx-auto w-full max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-16 items-start">

              {/* QUIZ — order-first on all screens */}
              <div className="order-first lg:order-last w-full max-w-md mx-auto lg:mx-0 lg:max-w-none">
                {/* Hook above quiz on mobile */}
                <div className="lg:hidden mb-4 text-center">
                  <h1 className="text-2xl font-bold text-white leading-tight text-balance">
                    Entrümpelung <span style={{ color: "#EFA609" }}>leicht gemacht.</span>
                  </h1>
                  <p className="text-sm text-white/70 mt-1">
                    Kostenlos & unverbindlich — in 2 Minuten zum Festpreis-Angebot
                  </p>
                </div>
                <LeadQuiz />
              </div>

              {/* Value prop — hidden on mobile, shown on desktop */}
              <div className="hidden lg:flex order-last lg:order-first flex-col justify-center">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6 self-start"
                  style={{ backgroundColor: "rgba(239,166,9,0.15)", color: "#EFA609" }}
                >
                  <Star className="w-3 h-3 fill-current" />
                  Festpreisgarantie &ndash; keine versteckten Kosten
                </div>

                <h1
                  className="text-4xl xl:text-5xl font-bold text-white leading-tight text-balance mb-5"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Entrümpelung
                  <br />
                  <span style={{ color: "#EFA609" }}>leicht gemacht.</span>
                </h1>

                <p className="text-lg text-white/70 leading-relaxed mb-8 max-w-md">
                  Professionell, schnell &amp; zum Festpreis. Beantworten Sie 5 kurze Fragen und erhalten Sie Ihr kostenloses Angebot.
                </p>

                <div className="flex flex-col gap-4 mb-10">
                  {[
                    { icon: <Shield className="w-4 h-4" />, text: "Kostenlose & unverbindliche Beratung" },
                    { icon: <Clock className="w-4 h-4" />, text: "Express-Termine innerhalb von 24h" },
                    { icon: <CheckCircle2 className="w-4 h-4" />, text: "100% Kundenzufriedenheit" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3 text-white/80 text-sm">
                      <div style={{ color: "#EFA609" }}>{item.icon}</div>
                      {item.text}
                    </div>
                  ))}
                </div>

                {/* Reviews strip */}
                <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" style={{ color: "#EFA609" }} />
                    ))}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">4,9 / 5 Sterne</p>
                    <p className="text-white/50 text-xs">Aus 200+ Google-Bewertungen</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
