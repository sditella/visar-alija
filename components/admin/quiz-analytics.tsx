"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Loader2,
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FunnelStep = {
  step: string
  label: string
  count: number
}

type AnswerEntry = {
  answer: string
  count: number
}

type Report = {
  id: string
  name: string
  created_at: string
  period_start: string
  period_end: string
  total_sessions: number
  conversions: number
  conversion_rate: number
  funnel_data: FunnelStep[]
  answers_data: Record<string, AnswerEntry[]>
}

type AnalyticsData = {
  funnel: FunnelStep[]
  answersByStep: Record<string, AnswerEntry[]>
  stats: { total: number; conversions: number; conversionRate: number }
  recentSessions: {
    session_id: string
    started_at: string
    last_step: string
    service_type: string | null
    property_type: string | null
    converted: boolean
  }[]
  reports: Report[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function QuizAnalytics({ category }: { category: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [snapshotName, setSnapshotName] = useState("")
  const [saving, setSaving] = useState(false)
  const [expandedReport, setExpandedReport] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics?category=${category}`)
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error("Analytics fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSnapshot = async () => {
    if (!confirm("Report speichern und Analytics-Daten zuruecksetzen?")) return
    setSaving(true)
    try {
      const res = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "snapshot_and_reset",
          name: snapshotName || undefined,
          category,
        }),
      })
      const result = await res.json()
      if (result.success) {
        setSnapshotName("")
        fetchData()
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#EF1C23" }} />
      </div>
    )
  }

  if (!data) {
    return (
      <p className="text-center text-muted-foreground py-16">Fehler beim Laden der Analytics.</p>
    )
  }

  const maxFunnel = Math.max(...data.funnel.map((f) => f.count), 1)

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border p-4 bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">Sessions</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{data.stats.total}</div>
        </div>
        <div className="rounded-xl border border-border p-4 bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4" style={{ color: "#22c55e" }} />
            <span className="text-xs font-semibold text-muted-foreground">Conversions</span>
          </div>
          <div className="text-3xl font-bold" style={{ color: "#22c55e" }}>
            {data.stats.conversions}
          </div>
        </div>
        <div className="rounded-xl border border-border p-4 bg-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" style={{ color: "#EF1C23" }} />
            <span className="text-xs font-semibold text-muted-foreground">Conversion Rate</span>
          </div>
          <div className="text-3xl font-bold" style={{ color: "#EF1C23" }}>
            {data.stats.conversionRate}%
          </div>
        </div>
      </div>

      {/* Funnel */}
      <div className="rounded-xl border border-border p-4 bg-card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4" style={{ color: "#EF1C23" }} />
          <h3 className="text-sm font-bold text-foreground">Quiz-Funnel</h3>
        </div>
        <div className="flex flex-col gap-3">
          {data.funnel.map((step, i) => {
            const pct = maxFunnel > 0 ? (step.count / maxFunnel) * 100 : 0
            const dropoff =
              i > 0 && data.funnel[i - 1].count > 0
                ? Math.round(((data.funnel[i - 1].count - step.count) / data.funnel[i - 1].count) * 100)
                : 0
            return (
              <div key={step.step}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground">{step.label}</span>
                  <div className="flex items-center gap-2">
                    {i > 0 && dropoff > 0 && (
                      <span className="text-[10px] text-destructive font-medium">-{dropoff}%</span>
                    )}
                    <span className="text-xs font-bold text-foreground">{step.count}</span>
                  </div>
                </div>
                <div
                  className="h-6 rounded-md overflow-hidden"
                  style={{ backgroundColor: "rgba(239,28,35,0.1)" }}
                >
                  <div
                    className="h-full rounded-md transition-all duration-500"
                    style={{
                      width: `${Math.max(pct, 2)}%`,
                      backgroundColor: "#EF1C23",
                      opacity: 0.3 + (0.7 * (1 - i / data.funnel.length)),
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Answers per Step */}
      {Object.keys(data.answersByStep).length > 0 && (
        <div className="rounded-xl border border-border p-4 bg-card">
          <h3 className="text-sm font-bold text-foreground mb-4">Antworten pro Schritt</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(data.answersByStep).map(([step, answers]) => {
              const stepLabel =
                data.funnel.find((f) => f.step === step)?.label || step
              const totalAnswers = answers.reduce((sum, a) => sum + a.count, 0)
              return (
                <div key={step} className="p-3 rounded-lg bg-secondary/50">
                  <h4 className="text-xs font-semibold text-foreground mb-2">{stepLabel}</h4>
                  <div className="flex flex-col gap-1.5">
                    {answers.slice(0, 5).map((a) => {
                      const pct = totalAnswers > 0 ? Math.round((a.count / totalAnswers) * 100) : 0
                      return (
                        <div key={a.answer} className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[11px] text-foreground truncate">{a.answer}</span>
                              <span className="text-[10px] text-muted-foreground ml-2 flex-shrink-0">
                                {a.count} ({pct}%)
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-border overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: "#EF1C23",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      {data.recentSessions.length > 0 && (
        <div className="rounded-xl border border-border p-4 bg-card">
          <h3 className="text-sm font-bold text-foreground mb-4">
            Letzte Sessions ({data.recentSessions.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 text-muted-foreground font-semibold">Datum</th>
                  <th className="text-left py-2 pr-3 text-muted-foreground font-semibold">Letzter Schritt</th>
                  <th className="text-left py-2 pr-3 text-muted-foreground font-semibold">Service</th>
                  <th className="text-left py-2 pr-3 text-muted-foreground font-semibold">Objekt</th>
                  <th className="text-left py-2 text-muted-foreground font-semibold">Konvertiert</th>
                </tr>
              </thead>
              <tbody>
                {data.recentSessions.map((s) => (
                  <tr key={s.session_id} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(s.started_at)}
                    </td>
                    <td className="py-2 pr-3 text-foreground">{s.last_step}</td>
                    <td className="py-2 pr-3 text-foreground">{s.service_type || "—"}</td>
                    <td className="py-2 pr-3 text-foreground">{s.property_type || "—"}</td>
                    <td className="py-2">
                      <span
                        className={cn(
                          "inline-block px-2 py-0.5 rounded-full text-[10px] font-bold",
                          s.converted
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        )}
                      >
                        {s.converted ? "Ja" : "Nein"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Snapshot & Reset */}
      <div className="rounded-xl border border-border p-4 bg-card">
        <h3 className="text-sm font-bold text-foreground mb-3">Report speichern & zuruecksetzen</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Speichert den aktuellen Stand als Report und setzt die Analytics-Daten fuer{" "}
          {category === "sanierung" ? "Sanierung" : "Entruempelung"} zurueck.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={snapshotName}
            onChange={(e) => setSnapshotName(e.target.value)}
            placeholder="Report-Name (optional)"
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#EF1C23]/50"
          />
          <Button
            onClick={handleSnapshot}
            disabled={saving || data.stats.total === 0}
            className="text-sm"
            style={{ backgroundColor: "#EF1C23" }}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <Save className="w-4 h-4 mr-1" />
            )}
            Speichern & Zuruecksetzen
          </Button>
        </div>
      </div>

      {/* Saved Reports */}
      {data.reports.length > 0 && (
        <div className="rounded-xl border border-border p-4 bg-card">
          <h3 className="text-sm font-bold text-foreground mb-4">Gespeicherte Reports</h3>
          <div className="flex flex-col gap-3">
            {data.reports.map((report) => (
              <div key={report.id} className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() =>
                    setExpandedReport(expandedReport === report.id ? null : report.id)
                  }
                  className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-xs font-bold text-foreground">{report.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(report.period_start)} - {formatDate(report.period_end)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-muted-foreground">
                        {report.total_sessions} Sessions
                      </span>
                      <span style={{ color: "#22c55e" }}>{report.conversions} Conversions</span>
                      <span style={{ color: "#EF1C23" }}>{report.conversion_rate}%</span>
                    </div>
                    {expandedReport === report.id ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>
                {expandedReport === report.id && (
                  <div className="p-3 border-t border-border bg-secondary/30">
                    {/* Funnel */}
                    <h4 className="text-xs font-semibold text-foreground mb-2">Funnel</h4>
                    <div className="flex flex-col gap-1.5 mb-4">
                      {(report.funnel_data || []).map((f) => (
                        <div key={f.step} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{f.step}</span>
                          <span className="font-medium text-foreground">{f.count}</span>
                        </div>
                      ))}
                    </div>
                    {/* Answers */}
                    {report.answers_data && Object.keys(report.answers_data).length > 0 && (
                      <>
                        <h4 className="text-xs font-semibold text-foreground mb-2">Antworten</h4>
                        {Object.entries(report.answers_data).map(([step, answers]) => (
                          <div key={step} className="mb-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">
                              {step}
                            </span>
                            {(answers as AnswerEntry[]).map((a) => (
                              <div key={a.answer} className="flex justify-between text-xs ml-2">
                                <span className="text-foreground">{a.answer}</span>
                                <span className="text-muted-foreground">{a.count}x</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
