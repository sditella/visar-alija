"use client"

import { useState } from "react"
import Image from "next/image"
import { Phone, Mail, MapPin, X } from "lucide-react"

export function MiniFooter() {
  const [impressumOpen, setImpressumOpen] = useState(false)
  const [datenschutzOpen, setDatenschutzOpen] = useState(false)

  return (
    <>
      <footer className="py-8 border-t border-border bg-card">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Brand */}
            <Image
              src="/images/logo.png"
              alt="VA Transporte Logo"
              width={140}
              height={42}
              className="h-8 w-auto"
            />

            {/* Contact & links */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <a
                href="tel:+491799173390"
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Phone className="w-3 h-3" style={{ color: "#EF1C23" }} />
                0179 9173 390
              </a>
              <a
                href="mailto:visar.alija@gmx.de"
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Mail className="w-3 h-3" style={{ color: "#EF1C23" }} />
                visar.alija@gmx.de
              </a>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3" style={{ color: "#EF1C23" }} />
                82110 Germering
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
              <button
                onClick={() => setDatenschutzOpen(true)}
                className="hover:text-foreground transition-colors"
              >
                Datenschutz
              </button>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground text-center mt-5">
            &copy; 2026 VA Transporte. Alle Rechte vorbehalten.
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
                  VA Transporte
                </p>
                <p>Ludwig Thoma Str. 15</p>
                <p>82110 Germering</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Inhaber</p>
                <p>Visar Alija</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Kontakt</p>
                <p>Telefon: 0179 9173 390</p>
                <p>E-Mail: visar.alija@gmx.de</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Umsatzsteuer-ID</p>
                <p>
                  Umsatzsteuer-Identifikationsnummer gemäß &sect; 27 a
                  Umsatzsteuergesetz:
                </p>
                <p className="font-semibold text-foreground">DE270952028</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mt-2">
                  Bitte beachten Sie: Dieses Impressum gilt auch für unsere Präsenzen auf Social-Media-Plattformen und anderen Online-Plattformen.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Datenschutz Modal */}
      {datenschutzOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDatenschutzOpen(false)}
          />
          <div className="relative bg-card rounded-2xl border border-border shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8">
            <button
              onClick={() => setDatenschutzOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Schliessen"
            >
              <X className="w-5 h-5" />
            </button>

            <h2
              className="text-2xl font-bold text-foreground mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Datenschutzerklärung
            </h2>

            <div className="text-sm text-muted-foreground leading-relaxed flex flex-col gap-5">
              <section>
                <h3 className="font-semibold text-foreground mb-1">1. Verantwortlicher</h3>
                <p>VA Transporte &ndash; Visar Alija</p>
                <p>Ludwig Thoma Str. 15, 82110 Germering</p>
                <p>E-Mail: visar.alija@gmx.de &middot; Telefon: +49 179 9173390</p>
              </section>

              <section>
                <h3 className="font-semibold text-foreground mb-1">2. Erhebung und Speicherung personenbezogener Daten</h3>
                <p>
                  Beim Besuch unserer Website werden automatisch Informationen durch den Browser übermittelt
                  (IP-Adresse, Datum/Uhrzeit, Browsertyp, Betriebssystem, Referrer-URL). Diese Daten werden
                  zur Sicherstellung eines reibungslosen Verbindungsaufbaus und der Systemsicherheit temporär
                  in Server-Logfiles gespeichert. Die Rechtsgrundlage ist Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-foreground mb-1">3. Kontaktformular / Angebotsanfrage</h3>
                <p>
                  Wenn Sie über unser Anfrageformular Kontakt aufnehmen, werden Ihre Angaben (Name, Telefonnummer,
                  E-Mail, PLZ/Ort sowie Details zur gewünschten Dienstleistung) zur Bearbeitung Ihrer Anfrage
                  gespeichert. Die Rechtsgrundlage ist Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;b DSGVO (vorvertragliche Maßnahmen).
                  Ihre Daten werden nicht an Dritte weitergegeben und nach Abschluss der Anfrage bzw. des Auftrags
                  unter Beachtung gesetzlicher Aufbewahrungsfristen gelöscht.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-foreground mb-1">4. Telefonnummern-Validierung</h3>
                <p>
                  Zur Überprüfung der eingegebenen Telefonnummer kann ein externer Validierungsdienst genutzt werden.
                  Dabei wird ausschließlich die Telefonnummer übermittelt. Rechtsgrundlage ist Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO
                  (berechtigtes Interesse an der Vermeidung von Fehleingaben).
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-foreground mb-1">5. Analyse- und Tracking-Dienste</h3>
                <p>
                  Wir nutzen ggf. das Meta-Pixel (Facebook) zur statistischen Auswertung
                  und zur Optimierung unserer Werbemaßnahmen. Dabei können Cookies gesetzt und personenbezogene
                  Daten (z.&nbsp;B. IP-Adresse, Nutzungsverhalten) verarbeitet werden. Rechtsgrundlage ist
                  Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO. Sie können der Nutzung jederzeit widersprechen, indem Sie
                  Cookies in Ihrem Browser deaktivieren.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-foreground mb-1">6. WhatsApp-Kommunikation</h3>
                <p>
                  Wenn Sie uns über WhatsApp kontaktieren, werden Ihre Nachrichten und Ihre Telefonnummer
                  durch die WhatsApp Ireland Limited verarbeitet. Weitere Informationen finden Sie in der
                  Datenschutzerklärung von WhatsApp. Die Nutzung erfolgt auf Grundlage Ihrer Einwilligung
                  (Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;a DSGVO).
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-foreground mb-1">7. Ihre Rechte</h3>
                <p>Sie haben das Recht auf:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>Auskunft über Ihre gespeicherten Daten (Art.&nbsp;15 DSGVO)</li>
                  <li>Berichtigung unrichtiger Daten (Art.&nbsp;16 DSGVO)</li>
                  <li>Löschung Ihrer Daten (Art.&nbsp;17 DSGVO)</li>
                  <li>Einschränkung der Verarbeitung (Art.&nbsp;18 DSGVO)</li>
                  <li>Datenübertragbarkeit (Art.&nbsp;20 DSGVO)</li>
                  <li>Widerspruch gegen die Verarbeitung (Art.&nbsp;21 DSGVO)</li>
                </ul>
                <p className="mt-2">
                  Beschwerden können Sie an die zuständige Datenschutzaufsichtsbehörde richten:
                  Bayerisches Landesamt für Datenschutzaufsicht (BayLDA).
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-foreground mb-1">8. Aktualität</h3>
                <p>
                  Diese Datenschutzerklärung ist aktuell gültig (Stand: März 2026). Wir behalten uns vor,
                  sie bei Bedarf anzupassen.
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
