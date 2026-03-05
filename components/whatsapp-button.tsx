"use client"

import { MessageCircle } from "lucide-react"

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/491799173390?text=Hallo%2C%20ich%20h%C3%A4tte%20gerne%20ein%20Angebot%20f%C3%BCr%20eine%20Entr%C3%BCmpelung."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      style={{
        backgroundColor: "#25D366",
        boxShadow: "0 4px 20px rgba(37,211,102,0.4)",
      }}
      aria-label="WhatsApp Chat starten"
    >
      <MessageCircle className="w-6 h-6 text-white" />
    </a>
  )
}
