import { Star, Users, TrendingUp, ThumbsUp } from "lucide-react"

const stats = [
  {
    icon: <TrendingUp className="w-5 h-5" />,
    value: "500+",
    label: "Aufträge erledigt",
  },
  {
    icon: <Star className="w-5 h-5" />,
    value: "4.9/5",
    label: "Kundenbewertung",
  },
  {
    icon: <Users className="w-5 h-5" />,
    value: "9+",
    label: "Jahre Erfahrung",
  },
  {
    icon: <ThumbsUp className="w-5 h-5" />,
    value: "99%",
    label: "Weiterempfehlung",
  },
]

export function TrustBar() {
  return (
    <section
      className="py-5 border-b border-border"
      style={{ backgroundColor: "#EF1C23" }}
    >
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 justify-center"
            >
              <div className="flex-shrink-0" style={{ color: "#ffffff", opacity: 0.7 }}>
                {stat.icon}
              </div>
              <div>
                <div
                  className="text-lg font-bold leading-none"
                  style={{ color: "#ffffff" }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-xs font-medium mt-0.5"
                  style={{ color: "#ffffff", opacity: 0.7 }}
                >
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
