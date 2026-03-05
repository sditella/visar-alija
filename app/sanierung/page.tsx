import type { Metadata } from "next"
import { HeroSanierung } from "@/components/hero-sanierung"
import { TrustBar } from "@/components/trust-bar"
import { MiniFooter } from "@/components/mini-footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Shield, Clock, Hammer, Recycle, Wrench, CheckCircle2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Sanierung vom Profi | VA Sanierungen",
  description:
    "Kernsanierung, Teilsanierung, Entkernung & Altbausanierung zum Festpreis. Kostenlose Beratung & Besichtigung. Jetzt unverbindlich anfragen!",
}

const benefits = [
  {
    icon: <Hammer className="w-5 h-5" />,
    title: "Kernsanierung",
    desc: "Kompletter Rueckbau und Neuaufbau -- alles aus einer Hand.",
  },
  {
    icon: <Wrench className="w-5 h-5" />,
    title: "Teilsanierung",
    desc: "Gezielte Massnahmen fuer Bad, Kueche, Boeden oder einzelne Raeume.",
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "Schnelle Umsetzung",
    desc: "Termintreue Ausfuehrung mit klar definiertem Zeitplan.",
  },
  {
    icon: <Recycle className="w-5 h-5" />,
    title: "Fachgerechte Entsorgung",
    desc: "Bauschutt und Altmaterial werden sauber entsorgt und recycelt.",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Versichert & Zuverlaessig",
    desc: "Vollstaendig versichert. Ihre Immobilie ist in guten Haenden.",
  },
  {
    icon: <CheckCircle2 className="w-5 h-5" />,
    title: "Festpreisgarantie",
    desc: "Transparente Kalkulation, keine versteckten Kosten.",
  },
]

export default function SanierungPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <HeroSanierung />
      <TrustBar />
      <section className="py-14 lg:py-16 bg-background">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-10">
            <h2
              className="text-2xl sm:text-3xl font-bold text-foreground text-balance"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Warum{" "}
              <span style={{ color: "#EF1C23" }}>VA Sanierungen</span>?
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
              Professionelle Sanierung mit Festpreis -- von der Planung bis zur Uebergabe.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="flex items-start gap-3.5 p-4 rounded-xl bg-card border border-border"
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "rgba(239,28,35,0.1)", color: "#EF1C23" }}
                >
                  {b.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{b.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <MiniFooter />
      <WhatsAppButton />
    </main>
  )
}
