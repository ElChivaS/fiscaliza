const WHATSAPP_NUMBER = "56945558924"
const WHATSAPP_MESSAGE = "Hola, quiero dejar feedback sobre FISCALIZA:"

export default function FeedbackTab() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Enviar feedback por WhatsApp"
      className="group fixed left-0 top-[calc(75%+1px)] z-40 flex -translate-y-1/2 items-stretch"
    >
      <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap rounded-l-lg border border-white bg-ink px-4 py-2 font-syne text-xs font-bold uppercase tracking-[0.2em] text-background shadow-lg">
        Feedback
      </span>
      <span className="pointer-events-none ml-2 self-center whitespace-nowrap rounded-lg bg-ink px-3 py-2 text-xs font-medium text-background opacity-0 shadow-md transition-all duration-200 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100">
        Clic para dar feedback
      </span>
    </a>
  )
}
