// Shared quiz analytics tracking utility

export function getOrCreateSessionId(category: string): string {
  const storageKey = `quiz_session_${category}`
  if (typeof window === "undefined") return crypto.randomUUID()
  let id = sessionStorage.getItem(storageKey)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(storageKey, id)
  }
  return id
}

export function trackEvent(params: {
  sessionId: string
  eventType: "step_view" | "answer" | "complete"
  step: string
  answer?: string
  category: string
}) {
  const body = JSON.stringify(params)

  // Use sendBeacon for reliability (fires even if user navigates away)
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon("/api/track-event", body)
  } else {
    fetch("/api/track-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {})
  }
}
