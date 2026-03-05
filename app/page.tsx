import { HeroQuiz } from "@/components/hero-quiz"
import { TrustBar } from "@/components/trust-bar"
import { BenefitsStrip } from "@/components/benefits-strip"
import { MiniFooter } from "@/components/mini-footer"
import { WhatsAppButton } from "@/components/whatsapp-button"

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <HeroQuiz />
      <TrustBar />
      <BenefitsStrip />
      <MiniFooter />
      <WhatsAppButton />
    </main>
  )
}
