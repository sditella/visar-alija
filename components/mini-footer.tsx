"use client"

import { useState } from "react"
import Image from "next/image"
import { Phone, Mail, MapPin, X } from "lucide-react"

export function MiniFooter() {
  const [impressumOpen, setImpressumOpen] = useState(false)

  return (
    <>
      <footer className="py-8 border-t border-border bg-card">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Brand */}
            <Image
              src="/images/logo.png"
              alt="Momo Entrümpelung Logo"
              width={140}
              height={42}
              className="h-8 w-auto"
            />

            {/* Contact & links */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <a
                href="tel:+491736151556"
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Phone className="w-3 h-3" style={{ color: "#EFA609" }} />
                0173 6151 556
              </a>
              <a
                href="mailto:info@momo-entruempelung.de"
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Mail className="w-3 h-3" style={{ color: "#EFA609" }} />
                info@momo-entruempelung.de
              </a>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3" style={{ color: "#EFA609" }} />
                68642 Bürstadt
              </span>
            </div>

            {/* Legal links */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <button
                onClick={() => setImpressumOpen(true)}
                className="hover:text-foreground transition-colors"
              >
                Impressum
              </button>
              <span className="text-border">|</span>
              <a href="#" className="hover:text-foreground transition-colors">
                Datenschutz
              </a>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground text-center mt-5">
            &copy; 2026 Momo Entrümpelung&reg;. Alle Rechte vorbehalten.
          </p>
        </div>
      </footer>

      {/* Impressum Modal */}
      {impressumOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setImpressumOpen(false)}
          />
          <div className="relative bg-card rounded-2xl border border-border shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-8">
            <button
              onClick={() => setImpressumOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Schliessen"
            >
              <X className="w-5 h-5" />
            </button>

            <h2
              className="text-2xl font-bold text-foreground mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Impressum
            </h2>

            <div className="text-sm text-muted-foreground leading-relaxed flex flex-col gap-4">
              <p className="font-medium text-foreground">
                Angaben gemäß &sect; 5 TMG
              </p>
              <div>
                <p className="font-semibold text-foreground">
                  Momo Entrümpelung&reg;
                </p>
                <p>Reichenberger Str. 36</p>
                <p>68642 Bürstadt</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Inhaber</p>
                <p>Muhammed Arslan</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Kontakt</p>
                <p>Telefon: 0173 6151 556</p>
                <p>E-Mail: info@momo-entruempelung.de</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Umsatzsteuer-ID</p>
                <p>
                  Umsatzsteuer-Identifikationsnummer gemäß &sect; 27 a
                  Umsatzsteuergesetz:
                </p>
                <p className="font-semibold text-foreground">DE279376423</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
