"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, Lock } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Login fehlgeschlagen")
        return
      }

      router.push("/admin")
    } catch {
      setError("Ein Fehler ist aufgetreten")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="bg-card rounded-2xl border border-border shadow-lg p-8">
          <div className="flex items-center justify-center mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(239,166,9,0.15)" }}
            >
              <Lock className="w-6 h-6" style={{ color: "#EFA609" }} />
            </div>
          </div>

          <h1
            className="text-xl font-bold text-foreground text-center mb-1"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Admin Login
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Momo Entrümpelung Dashboard
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Benutzername
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#EFA609]/50 focus:border-[#EFA609] transition-colors"
                placeholder="Benutzername"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#EFA609]/50 focus:border-[#EFA609] transition-colors"
                placeholder="Passwort"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-xs text-destructive font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full font-semibold py-5"
              style={{ backgroundColor: "#EFA609", color: "#1a1000" }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Anmelden...
                </>
              ) : (
                "Anmelden"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
