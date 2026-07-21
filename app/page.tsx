import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-black/5">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-syne font-bold text-xl text-ink tracking-tight">
            FISCALIZA
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted hover:text-ink transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-ink text-white px-4 py-2 rounded-xl hover:bg-ink/90 transition-colors"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-surface border border-black/10 rounded-full px-4 py-1.5 text-xs font-medium text-muted mb-8">
          <span className="size-1.5 rounded-full bg-valid animate-pulse" />
          Disponible ahora en Chile
        </div>

        <h1 className="font-syne font-extrabold text-5xl sm:text-6xl md:text-7xl text-ink leading-[1.05] mb-6">
          Tus documentos<br />
          <span className="text-muted">siempre listos.</span>
        </h1>

        <p className="text-lg text-muted max-w-xl mx-auto mb-10 leading-relaxed">
          ¿Fiscalización en camino? Tus documentos a la mano, todos en tu celular,
          sin búsquedas, sin tarjetas, en segundos.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-ink text-white px-8 py-4 rounded-2xl text-base font-medium hover:bg-ink/90 transition-all hover:-translate-y-0.5"
          >
            Empezar gratis
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-surface border border-black/10 text-ink px-8 py-4 rounded-2xl text-base font-medium hover:bg-black/5 transition-colors"
          >
            Ya tengo cuenta
          </Link>
        </div>

        {/* Doc pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-12">
          {[
            "Licencia de conducir",
            "Revisión técnica",
            "Permiso de circulación",
            "SOAP",
          ].map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 bg-surface border border-black/10 rounded-full px-3 py-1.5 text-xs font-medium text-ink"
            >
              <span className="size-1.5 rounded-full bg-valid" />
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="bg-surface py-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
            El problema
          </p>
          <h2 className="font-syne font-bold text-3xl text-ink mb-12 max-w-lg">
            Fiscalización inesperada.<br />Documentos en otro bolso.
          </h2>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                n: "01",
                title: "4 documentos distintos",
                desc: "Cada uno en su propio formato, con fechas de vencimiento diferentes.",
              },
              {
                n: "02",
                title: "Multas por documentos vencidos",
                desc: "Un papel vencido puede costarte más de $50.000 en multas.",
              },
              {
                n: "03",
                title: "Legal desde 2021",
                desc: "La Ley 21.302 autoriza presentar documentos vehiculares en formato digital.",
              },
            ].map(({ n, title, desc }) => (
              <div
                key={n}
                className="rounded-2xl p-6 border-l-4 border-expired bg-background"
              >
                <span className="text-xs font-syne font-bold text-muted mb-3 block">
                  {n}
                </span>
                <h3 className="font-syne font-bold text-ink mb-2">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUCIÓN */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
            La solución
          </p>
          <h2 className="font-syne font-bold text-3xl text-ink mb-12 max-w-lg">
            Una bóveda digital.<br />Siempre en tu bolsillo.
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: "📁",
                title: "Todo centralizado",
                desc: "Todos tus documentos en un solo lugar, organizados por vehículo.",
              },
              {
                icon: "⚡",
                title: "Presentación en segundos",
                desc: "Vista fullscreen optimizada para mostrar al fiscalizador sin fricción.",
              },
              {
                icon: "🔔",
                title: "Alertas de vencimiento",
                desc: "Te avisamos 30 días antes de que venza cualquier documento.",
              },
              {
                icon: "🔒",
                title: "Privado y seguro",
                desc: "Tus documentos nunca son públicos. Acceso solo con URL firmada.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl bg-surface border border-black/8 p-6"
              >
                <span className="text-3xl mb-4 flex justify-center">{icon}</span>
                <h3 className="font-syne font-bold text-ink mb-2">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-ink py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-syne font-extrabold text-4xl text-white mb-4">
            Empieza gratis hoy.
          </h2>
          <p className="text-white/60 mb-8 text-lg">
            1 vehículo, documentos ilimitados. Sin tarjeta de crédito.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-ink px-8 py-4 rounded-2xl text-base font-medium hover:bg-white/90 transition-colors"
          >
            Crear cuenta gratuita
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/5 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <span className="font-syne font-bold text-ink">FISCALIZA</span>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-ink transition-colors">
              Política de privacidad
            </Link>
            <Link href="#" className="hover:text-ink transition-colors">
              Términos de uso
            </Link>
          </div>
          <span>© {new Date().getFullYear()} FISCALIZA Chile</span>
        </div>
      </footer>
    </div>
  )
}
