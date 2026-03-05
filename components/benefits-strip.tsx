import { Shield, Clock, Banknote, Recycle, Truck, Sparkles } from "lucide-react"

const benefits = [
  {
    icon: <Banknote className="w-5 h-5" />,
    title: "Festpreisgarantie",
    desc: "Keine versteckten Kosten. Sie zahlen nur den vereinbarten Preis.",
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "Express-Service",
    desc: "Kurzfristige Termine innerhalb von 24 Stunden möglich.",
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "Besenreine Übergabe",
    desc: "Wir hinterlassen alles sauber und ordentlich.",
  },
  {
    icon: <Recycle className="w-5 h-5" />,
    title: "Umweltgerechte Entsorgung",
    desc: "Fachgerechte Trennung und recyclingkonforme Entsorgung.",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Versichert & Seriös",
    desc: "Vollständig versichert. Ihr Eigentum ist bei uns sicher.",
  },
  {
    icon: <Truck className="w-5 h-5" />,
    title: "Komplettservice",
    desc: "Von der Besichtigung bis zur Entsorgung alles aus einer Hand.",
  },
]

export function BenefitsStrip() {
  return (
    <section className="py-14 lg:py-16 bg-background">
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center mb-10">
          <h2
            className="text-2xl sm:text-3xl font-bold text-foreground text-balance"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Warum{" "}
            <span style={{ color: "#EF1C23" }}>VA Transporte</span>?
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            Professionell, transparent und zuverlässig &ndash; seit über 9 Jahren.
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
  )
}
