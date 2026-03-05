"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  LogOut,
  Loader2,
  LayoutGrid,
  List,
  Phone,
  Mail,
  MapPin,
  Clock,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Search,
  BarChart3,
  StickyNote,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { QuizAnalytics } from "@/components/admin/quiz-analytics"

type Lead = {
  id: string
  service_type: string
  property_type: string
  room_count: string
  timing: string
  has_heavy_items: string
  name: string
  phone: string
  email: string
  city: string
  message: string | null
  notes: string
  status: string
  created_at: string
}

const STATUSES = [
  { key: "new", label: "Neuer Lead", color: "#EF1C23", bg: "rgba(239,28,35,0.1)" },
  { key: "contacted", label: "Kontaktiert", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  { key: "appointment", label: "Termin vereinbart", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  { key: "unreachable", label: "Nicht erreicht", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  { key: "completed", label: "Abgeschlossen", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
]

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
  sonstiges: "Sonstiges",
  sonstiges_sanierung: "Sonstiges (Sanierung)",
}

const ENTRUEMPELUNG_SERVICES = ["entruempelung", "haushaltsaufloesung", "firmenaufloesung", "messiraeumung", "sonstiges"]
const SANIERUNG_SERVICES = ["kernsanierung", "teilsanierung", "entkernung", "altbausanierung", "renovierung", "sonstiges_sanierung"]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function LeadCard({
  lead,
  onStatusChange,
  onDelete,
  onNotesChange,
}: {
  lead: Lead
  onStatusChange: (id: string, status: string) => void
  onDelete: (id: string) => void
  onNotesChange: (id: string, notes: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [localNotes, setLocalNotes] = useState(lead.notes || "")
  const [saving, setSaving] = useState(false)
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleNotesChange = (value: string) => {
    setLocalNotes(value)
    if (notesTimer.current) clearTimeout(notesTimer.current)
    notesTimer.current = setTimeout(async () => {
      setSaving(true)
      await onNotesChange(lead.id, value)
      setSaving(false)
    }, 800)
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-foreground truncate">
            {lead.name}
          </h4>
          <p className="text-xs text-muted-foreground">
            {SERVICE_LABELS[lead.service_type] || lead.service_type}
          </p>
        </div>
        <GripVertical className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
      </div>

      <div className="flex flex-col gap-1 mb-3">
        <a
          href={`tel:${lead.phone}`}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Phone className="w-3 h-3" />
          {lead.phone}
        </a>
        <a
          href={`mailto:${lead.email}`}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors truncate"
        >
          <Mail className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{lead.email}</span>
        </a>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          {lead.city}
        </span>
      </div>

      <div className="mb-3 p-3 rounded-lg bg-secondary/50 text-xs flex flex-col gap-1.5">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Objekt:</span>
          <span className="font-medium text-foreground">{lead.property_type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Fläche:</span>
          <span className="font-medium text-foreground">{lead.room_count}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Zeitrahmen:</span>
          <span className="font-medium text-foreground">{lead.timing}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Schwere Gegenstände:</span>
          <span className="font-medium text-foreground">{lead.has_heavy_items || "—"}</span>
        </div>
      </div>
      {expanded && lead.message && (
        <div className="mb-3 p-3 rounded-lg bg-secondary/50 text-xs border-t border-border">
          <span className="text-muted-foreground">Nachricht:</span>
          <p className="font-medium text-foreground mt-0.5">{lead.message}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <select
            value={lead.status}
            onChange={(e) => onStatusChange(lead.id, e.target.value)}
            className="text-xs border border-border rounded-md px-2 py-1 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-[#EF1C23]"
          >
            {STATUSES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          {lead.message && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground"
              title={expanded ? "Nachricht ausblenden" : "Nachricht anzeigen"}
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={cn(
              "p-1 rounded-md hover:bg-secondary transition-colors",
              localNotes ? "text-[#EF1C23]" : "text-muted-foreground"
            )}
            title="Notizen"
          >
            <StickyNote className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (confirm("Lead wirklich löschen?")) onDelete(lead.id)
            }}
            className="p-1 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
            title="Löschen"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showNotes && (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-muted-foreground">Notizen</span>
            {saving && <span className="text-[10px] text-[#EF1C23]">Speichert...</span>}
          </div>
          <textarea
            value={localNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Notiz hinzufuegen..."
            className="w-full text-xs p-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#EF1C23] resize-none"
            rows={3}
          />
        </div>
      )}

      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border">
        <Clock className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">
          {formatDate(lead.created_at)}
        </span>
      </div>
    </div>
  )
}

function ListNotes({
  lead,
  onNotesChange,
}: {
  lead: Lead
  onNotesChange: (id: string, notes: string) => void
}) {
  const [localNotes, setLocalNotes] = useState(lead.notes || "")
  const [saving, setSaving] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (value: string) => {
    setLocalNotes(value)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setSaving(true)
      await onNotesChange(lead.id, value)
      setSaving(false)
    }, 800)
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={localNotes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Notiz..."
        className="w-full text-xs px-2 py-1 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#EF1C23]"
      />
      {saving && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#EF1C23]">...</span>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"kanban" | "list">("kanban")
  const [activeTab, setActiveTab] = useState<"leads" | "analytics">("leads")
  const [category, setCategory] = useState<"entruempelung" | "sanierung">("entruempelung")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/leads")
      if (res.status === 401) {
        router.push("/admin/login")
        return
      }
      const data = await res.json()
      if (Array.isArray(data)) setLeads(data)
    } catch {
      router.push("/admin/login")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    // Check session
    fetch("/api/admin/session")
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(() => fetchLeads())
      .catch(() => router.push("/admin/login"))
  }, [fetchLeads, router])

  const updateStatus = async (id: string, status: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    )
    await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
  }

  const updateNotes = async (id: string, notes: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, notes } : l))
    )
    await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, notes }),
    })
  }

  const deleteLead = async (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id))
    await fetch(`/api/admin/leads?id=${id}`, { method: "DELETE" })
  }

  const handleLogout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" })
    router.push("/admin/login")
  }

  const categoryServices = category === "sanierung" ? SANIERUNG_SERVICES : ENTRUEMPELUNG_SERVICES
  const categoryLeads = leads.filter((l) => categoryServices.includes(l.service_type))

  const filtered = categoryLeads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      l.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || l.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#EF1C23" }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div>
            <h1
              className="text-lg font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Admin Dashboard
            </h1>
            <p className="text-xs text-muted-foreground">
              {categoryLeads.length} Leads ({category === "sanierung" ? "Sanierung" : "Entruempelung"})
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Category Switcher */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as "entruempelung" | "sanierung")}
              className="text-xs border border-border rounded-lg px-3 py-1.5 bg-card text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-[#EF1C23]/50"
            >
              <option value="entruempelung">Entruempelung</option>
              <option value="sanierung">Sanierung</option>
            </select>

            {/* Tabs: Leads / Analytics */}
            <div className="hidden sm:flex items-center gap-1 bg-secondary rounded-lg p-1">
              <button
                onClick={() => setActiveTab("leads")}
                className={cn(
                  "px-2.5 py-1.5 rounded-md transition-colors text-xs font-medium",
                  activeTab === "leads"
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Leads
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={cn(
                  "px-2.5 py-1.5 rounded-md transition-colors text-xs font-medium flex items-center gap-1",
                  activeTab === "analytics"
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Analytics
              </button>
            </div>

            {/* View Toggle (only for leads tab) */}
            {activeTab === "leads" && (
              <div className="hidden sm:flex items-center gap-1 bg-secondary rounded-lg p-1">
                <button
                  onClick={() => setView("kanban")}
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    view === "kanban"
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Kanban"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    view === "list"
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Liste"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Abmelden</span>
            </Button>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="sm:hidden flex border-t border-border">
          <button
            onClick={() => setActiveTab("leads")}
            className={cn(
              "flex-1 py-2 text-xs font-medium text-center transition-colors",
              activeTab === "leads"
                ? "text-foreground border-b-2 border-[#EF1C23]"
                : "text-muted-foreground"
            )}
          >
            Leads
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={cn(
              "flex-1 py-2 text-xs font-medium text-center transition-colors",
              activeTab === "analytics"
                ? "text-foreground border-b-2 border-[#EF1C23]"
                : "text-muted-foreground"
            )}
          >
            Analytics
          </button>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <QuizAnalytics category={category} />
        )}

        {/* Leads Tab */}
        {activeTab === "leads" && (
        <>
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          {STATUSES.map((s) => {
            const count = categoryLeads.filter((l) => l.status === s.key).length
            return (
              <div
                key={s.key}
                className="rounded-xl border border-border p-3 bg-card"
              >
                <div
                  className="text-2xl font-bold"
                  style={{ color: s.color }}
                >
                  {count}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {s.label}
                </div>
              </div>
            )
          })}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Leads durchsuchen (Name, E-Mail, Telefon, Ort)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#EF1C23]/50 focus:border-[#EF1C23] transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#EF1C23]/50 focus:border-[#EF1C23] transition-colors sm:w-52"
          >
            <option value="all">Alle Status</option>
            {STATUSES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label} ({categoryLeads.filter((l) => l.status === s.key).length})
              </option>
            ))}
          </select>
        </div>

        {/* Kanban View */}
        {view === "kanban" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {STATUSES.map((status) => {
              const columnLeads = filtered.filter(
                (l) => l.status === status.key
              )
              return (
                <div key={status.key} className="flex flex-col">
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-t-xl"
                    style={{ backgroundColor: status.bg }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-xs font-bold text-foreground">
                      {status.label}
                    </span>
                    <span
                      className="ml-auto text-xs font-bold rounded-full px-2 py-0.5"
                      style={{
                        backgroundColor: status.color,
                        color: "#fff",
                      }}
                    >
                      {columnLeads.length}
                    </span>
                  </div>
                  <div className="flex-1 bg-secondary/30 rounded-b-xl p-2 flex flex-col gap-2 min-h-[200px]">
                    {columnLeads.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-8">
                        Keine Leads
                      </p>
                    ) : (
                      columnLeads.map((lead) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          onStatusChange={updateStatus}
                          onDelete={deleteLead}
                          onNotesChange={updateNotes}
                        />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                      Kontakt
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                      Dienstleistung
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                      Objekt
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                      Fläche
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                      Zeitrahmen
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                      Schwere Geg.
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                      Ort
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                      Datum
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground min-w-[200px]">
                      Notizen
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => {
                    const statusObj = STATUSES.find(
                      (s) => s.key === lead.status
                    )
                    return (
                      <tr
                        key={lead.id}
                        className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="font-semibold text-foreground">
                            {lead.name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <a
                              href={`tel:${lead.phone}`}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              {lead.phone}
                            </a>
                            <a
                              href={`mailto:${lead.email}`}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              {lead.email}
                            </a>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-foreground">
                          {SERVICE_LABELS[lead.service_type] ||
                            lead.service_type}
                        </td>
                        <td className="px-4 py-3 text-xs text-foreground">
                          {lead.property_type}
                        </td>
                        <td className="px-4 py-3 text-xs text-foreground">
                          {lead.room_count}
                        </td>
                        <td className="px-4 py-3 text-xs text-foreground">
                          {lead.timing}
                        </td>
                        <td className="px-4 py-3 text-xs text-foreground">
                          {lead.has_heavy_items || "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-foreground">
                          {lead.city}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              updateStatus(lead.id, e.target.value)
                            }
                            className="text-xs border border-border rounded-md px-2 py-1 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-[#EF1C23]"
                          >
                            {STATUSES.map((s) => (
                              <option key={s.key} value={s.key}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(lead.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <ListNotes lead={lead} onNotesChange={updateNotes} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              if (confirm("Lead wirklich löschen?"))
                                deleteLead(lead.id)
                            }}
                            className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={12}
                        className="px-4 py-12 text-center text-sm text-muted-foreground"
                      >
                        {searchQuery
                          ? "Keine Leads gefunden"
                          : "Noch keine Leads vorhanden"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  )
}
