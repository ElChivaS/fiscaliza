import type { BodyType } from "@/lib/data/vehicles"

interface Props {
  type:      BodyType
  className?: string
}

// Todas las siluetas usan viewBox="0 0 200 80", fill="currentColor"
// Autos: frente a la IZQUIERDA, trasera a la DERECHA
// Motos: frente a la IZQUIERDA (rueda delantera cx~50), trasera a la DERECHA (rueda trasera cx~150)
const silhouettes: Record<BodyType, React.ReactNode> = {

  // ─── Autos ───────────────────────────────────────────────────────────────

  sedan: (
    <svg viewBox="0 0 200 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="52" width="176" height="16" rx="4" />
      <path d="M42 52 L50 30 C54 22 66 16 84 15 L118 15 C136 15 148 20 154 28 L162 52 Z" />
      <path d="M12 56 L12 52 L42 52 L38 56 Z" />
      <path d="M162 52 L166 56 L188 56 L188 52 Z" />
      <circle cx="54" cy="66" r="13" fill="white" opacity="0.15" />
      <circle cx="54" cy="66" r="13" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="54" cy="66" r="4" />
      <circle cx="152" cy="66" r="13" fill="white" opacity="0.15" />
      <circle cx="152" cy="66" r="13" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="152" cy="66" r="4" />
      <path d="M54 50 L60 30 C63 23 72 19 83 18 L100 18 L98 50 Z" fill="white" opacity="0.25" />
      <path d="M102 18 L118 18 C130 18 140 22 146 30 L152 50 L102 50 Z" fill="white" opacity="0.25" />
    </svg>
  ),

  hatchback: (
    <svg viewBox="0 0 200 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="52" width="175" height="16" rx="4" />
      <path d="M38 52 L46 28 C50 19 64 14 82 14 L128 14 C148 14 158 22 162 34 L166 52 Z" />
      <path d="M10 56 L10 52 L38 52 L34 56 Z" />
      <circle cx="52" cy="66" r="13" fill="white" opacity="0.15" />
      <circle cx="52" cy="66" r="13" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="52" cy="66" r="4" />
      <circle cx="150" cy="66" r="13" fill="white" opacity="0.15" />
      <circle cx="150" cy="66" r="13" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="150" cy="66" r="4" />
      <path d="M52 50 L58 28 C61 20 70 17 82 16 L100 16 L98 50 Z" fill="white" opacity="0.25" />
      <path d="M102 16 L128 16 C142 16 155 24 160 36 L162 50 L102 50 Z" fill="white" opacity="0.25" />
    </svg>
  ),

  suv: (
    <svg viewBox="0 0 200 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="48" width="184" height="18" rx="4" />
      <path d="M34 48 L38 16 C40 9 52 6 68 6 L138 6 C154 6 162 9 166 16 L172 48 Z" />
      <path d="M8 52 L8 48 L34 48 L30 52 Z" />
      <path d="M172 48 L176 52 L192 52 L192 48 Z" />
      <circle cx="52" cy="65" r="14" fill="white" opacity="0.15" />
      <circle cx="52" cy="65" r="14" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="52" cy="65" r="4.5" />
      <circle cx="155" cy="65" r="14" fill="white" opacity="0.15" />
      <circle cx="155" cy="65" r="14" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="155" cy="65" r="4.5" />
      <path d="M42 46 L44 18 C45 11 52 8 62 8 L96 8 L96 46 Z" fill="white" opacity="0.25" />
      <path d="M100 8 L140 8 C152 8 160 12 164 20 L168 46 L100 46 Z" fill="white" opacity="0.25" />
    </svg>
  ),

  pickup: (
    <svg viewBox="0 0 200 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="52" width="184" height="14" rx="3" />
      <path d="M30 52 L34 24 C36 15 48 10 62 10 L108 10 C116 10 120 14 122 20 L126 52 Z" />
      <rect x="128" y="38" width="62" height="14" rx="2" />
      <rect x="126" y="36" width="4" height="18" rx="1" />
      <path d="M8 54 L8 52 L30 52 L26 56 Z" />
      <circle cx="50" cy="65" r="13" fill="white" opacity="0.15" />
      <circle cx="50" cy="65" r="13" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="50" cy="65" r="4" />
      <circle cx="158" cy="65" r="13" fill="white" opacity="0.15" />
      <circle cx="158" cy="65" r="13" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="158" cy="65" r="4" />
      <path d="M38 50 L40 26 C41 17 48 12 60 12 L96 12 L96 50 Z" fill="white" opacity="0.25" />
      <path d="M100 12 L108 12 C116 12 120 15 122 22 L124 50 L100 50 Z" fill="white" opacity="0.25" />
    </svg>
  ),

  van: (
    <svg viewBox="0 0 200 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="46" width="188" height="20" rx="4" />
      <path d="M28 46 L28 8 C28 6 30 5 32 5 L175 5 C180 5 186 8 190 14 L194 30 L194 46 Z" />
      <path d="M6 50 L6 46 L28 46 L24 50 Z" />
      <circle cx="48" cy="65" r="14" fill="white" opacity="0.15" />
      <circle cx="48" cy="65" r="14" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="48" cy="65" r="4.5" />
      <circle cx="155" cy="65" r="14" fill="white" opacity="0.15" />
      <circle cx="155" cy="65" r="14" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="155" cy="65" r="4.5" />
      <path d="M28 44 L28 12 C28 8 30 6 34 6 L62 6 L62 44 Z" fill="white" opacity="0.3" />
      <rect x="68" y="10" width="38" height="28" rx="3" fill="white" opacity="0.2" />
      <rect x="112" y="10" width="38" height="28" rx="3" fill="white" opacity="0.2" />
    </svg>
  ),

  wagon: (
    <svg viewBox="0 0 200 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="52" width="180" height="16" rx="4" />
      <path d="M38 52 L44 26 C46 18 58 13 76 13 L158 13 C168 13 172 18 174 26 L178 52 Z" />
      <path d="M10 56 L10 52 L38 52 L34 56 Z" />
      <circle cx="54" cy="66" r="13" fill="white" opacity="0.15" />
      <circle cx="54" cy="66" r="13" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="54" cy="66" r="4" />
      <circle cx="152" cy="66" r="13" fill="white" opacity="0.15" />
      <circle cx="152" cy="66" r="13" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="152" cy="66" r="4" />
      <path d="M48 50 L52 27 C54 19 62 15 74 15 L96 15 L96 50 Z" fill="white" opacity="0.25" />
      <rect x="100" y="15" width="42" height="35" rx="2" fill="white" opacity="0.25" />
      <path d="M148 15 L158 15 C166 15 170 19 172 26 L174 50 L148 50 Z" fill="white" opacity="0.25" />
    </svg>
  ),

  coupe: (
    <svg viewBox="0 0 200 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="56" width="180" height="13" rx="4" />
      <path d="M38 56 L52 26 C58 16 74 12 95 11 L125 11 C148 12 162 20 168 34 L174 56 Z" />
      <path d="M10 58 L10 56 L38 56 L34 60 Z" />
      <path d="M174 56 L178 60 L190 60 L190 56 Z" />
      <circle cx="56" cy="67" r="12" fill="white" opacity="0.15" />
      <circle cx="56" cy="67" r="12" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="56" cy="67" r="4" />
      <circle cx="150" cy="67" r="12" fill="white" opacity="0.15" />
      <circle cx="150" cy="67" r="12" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="150" cy="67" r="4" />
      <path d="M56 54 L64 26 C67 17 76 13 90 12 L108 12 L106 54 Z" fill="white" opacity="0.25" />
      <path d="M110 12 L126 12 C144 12 158 20 164 34 L168 54 L110 54 Z" fill="white" opacity="0.25" />
    </svg>
  ),

  // ─── Motos ───────────────────────────────────────────────────────────────
  // Frente (izq): rueda delantera cx=50, cy=63, r=14
  // Trasera (der): rueda trasera cx=150, cy=63, r=14

  racing: (
    <svg viewBox="0 0 200 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Rueda delantera */}
      <circle cx="50" cy="63" r="14" fill="white" opacity="0.15" />
      <circle cx="50" cy="63" r="14" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="50" cy="63" r="4" />
      {/* Rueda trasera */}
      <circle cx="150" cy="63" r="14" fill="white" opacity="0.15" />
      <circle cx="150" cy="63" r="14" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="150" cy="63" r="4" />
      {/* Carenado delantero aerodinámico */}
      <path d="M46 50 L54 40 L70 36 L72 48 L58 56 Z" />
      {/* Horquilla */}
      <path d="M66 36 L72 36 L66 63 L56 63 L62 40 Z" />
      {/* Chasis bajo */}
      <path d="M72 36 L82 28 L130 28 L148 42 L148 63 L66 63 L66 36 Z" />
      {/* Depósito plano */}
      <path d="M84 28 Q110 14 134 22 L130 28 L84 28 Z" />
      {/* Cola deportiva */}
      <path d="M128 28 L148 34 L154 28 L148 24 L132 24 Z" />
      {/* Asiento bajo */}
      <path d="M108 28 L136 30 L138 36 L108 32 Z" />
      {/* Manillar bajo (clip-on) */}
      <rect x="68" y="30" width="18" height="3" rx="1.5" />
    </svg>
  ),

  naked: (
    <svg viewBox="0 0 200 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Rueda delantera */}
      <circle cx="50" cy="63" r="14" fill="white" opacity="0.15" />
      <circle cx="50" cy="63" r="14" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="50" cy="63" r="4" />
      {/* Rueda trasera */}
      <circle cx="150" cy="63" r="14" fill="white" opacity="0.15" />
      <circle cx="150" cy="63" r="14" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="150" cy="63" r="4" />
      {/* Horquilla delantera */}
      <path d="M64 44 L70 44 L58 63 L50 63 L62 44 Z" />
      {/* Bloque motor + chasis */}
      <path d="M70 44 L78 34 L122 34 L136 50 L136 63 L64 63 L64 44 Z" />
      {/* Depósito */}
      <path d="M80 34 Q102 16 126 26 L122 34 L80 34 Z" />
      {/* Asiento */}
      <path d="M110 34 L138 44 L142 50 L112 40 Z" />
      {/* Brazo oscilante */}
      <path d="M130 56 L136 56 L150 63 L136 63 Z" />
      {/* Manillar (upright) */}
      <rect x="58" y="24" width="22" height="4" rx="2" />
      <rect x="67" y="24" width="4" height="18" rx="2" />
    </svg>
  ),

  scooter: (
    <svg viewBox="0 0 200 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Rueda delantera */}
      <circle cx="50" cy="63" r="14" fill="white" opacity="0.15" />
      <circle cx="50" cy="63" r="14" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="50" cy="63" r="4" />
      {/* Rueda trasera */}
      <circle cx="150" cy="63" r="14" fill="white" opacity="0.15" />
      <circle cx="150" cy="63" r="14" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="150" cy="63" r="4" />
      {/* Escudo delantero / legshield */}
      <path d="M50 49 L58 36 L72 32 L74 42 L64 52 Z" />
      {/* Horquilla */}
      <path d="M64 36 L72 34 L66 63 L56 63 L60 44 Z" />
      {/* Cuerpo redondeado */}
      <path d="M74 42 L80 32 L118 28 L144 36 L144 63 L64 63 L64 52 Z" />
      {/* Cúpula / panel frontal */}
      <path d="M80 32 Q100 16 122 22 L118 28 L80 28 Z" />
      {/* Asiento plano y largo */}
      <path d="M100 28 L144 32 L144 38 L100 34 Z" />
      {/* Manillar scooter (amplio) */}
      <rect x="54" y="22" width="28" height="4" rx="2" />
      <rect x="66" y="22" width="4" height="12" rx="2" />
    </svg>
  ),

  cruiser: (
    <svg viewBox="0 0 200 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Rueda delantera */}
      <circle cx="44" cy="63" r="14" fill="white" opacity="0.15" />
      <circle cx="44" cy="63" r="14" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="44" cy="63" r="4" />
      {/* Rueda trasera */}
      <circle cx="156" cy="63" r="14" fill="white" opacity="0.15" />
      <circle cx="156" cy="63" r="14" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="156" cy="63" r="4" />
      {/* Horquilla larga y rakeada */}
      <path d="M58 46 L68 42 L56 63 L44 63 L54 46 Z" />
      {/* Chasis bajo y largo */}
      <path d="M68 42 L76 36 L138 36 L148 48 L148 63 L58 63 L58 46 Z" />
      {/* Depósito teardrop grande */}
      <path d="M80 36 Q108 20 140 30 L138 36 L80 36 Z" />
      {/* Asiento largo y bajo */}
      <path d="M108 36 L148 40 L150 46 L110 42 Z" />
      {/* Brazo oscilante */}
      <path d="M138 56 L148 56 L156 63 L142 63 Z" />
      {/* Manillar alto (apehangers) */}
      <rect x="56" y="20" width="24" height="4" rx="2" />
      <rect x="66" y="20" width="4" height="22" rx="2" />
    </svg>
  ),

  enduro: (
    <svg viewBox="0 0 200 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Rueda delantera */}
      <circle cx="50" cy="63" r="14" fill="white" opacity="0.15" />
      <circle cx="50" cy="63" r="14" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="50" cy="63" r="4" />
      {/* Rueda trasera */}
      <circle cx="150" cy="63" r="14" fill="white" opacity="0.15" />
      <circle cx="150" cy="63" r="14" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="150" cy="63" r="4" />
      {/* Horquilla larga (mucho recorrido) */}
      <path d="M60 38 L68 34 L60 63 L50 63 L56 38 Z" />
      {/* Guardabarros alto */}
      <path d="M54 40 L64 34 L68 38 L58 44 Z" />
      {/* Chasis alto */}
      <path d="M68 34 L76 22 L126 22 L140 36 L140 63 L60 63 L60 38 Z" />
      {/* Depósito angular */}
      <path d="M80 22 Q106 8 130 16 L126 22 L80 22 Z" />
      {/* Asiento alto y plano */}
      <path d="M102 22 L140 28 L140 34 L102 26 Z" />
      {/* Brazo oscilante */}
      <path d="M132 56 L140 56 L150 63 L136 63 Z" />
      {/* Manillar ancho y algo levantado */}
      <rect x="58" y="20" width="26" height="4" rx="2" />
      <rect x="68" y="20" width="4" height="14" rx="2" />
    </svg>
  ),

  cafe_racer: (
    <svg viewBox="0 0 200 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Rueda delantera */}
      <circle cx="50" cy="63" r="14" fill="white" opacity="0.15" />
      <circle cx="50" cy="63" r="14" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="50" cy="63" r="4" />
      {/* Rueda trasera */}
      <circle cx="150" cy="63" r="14" fill="white" opacity="0.15" />
      <circle cx="150" cy="63" r="14" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="150" cy="63" r="4" />
      {/* Horquilla */}
      <path d="M62 42 L70 38 L62 63 L50 63 L58 42 Z" />
      {/* Chasis retro compacto */}
      <path d="M70 38 L80 28 L128 28 L140 42 L140 63 L62 63 L62 42 Z" />
      {/* Depósito redondo estilo retro */}
      <path d="M82 28 Q104 14 130 24 L128 28 L82 28 Z" />
      {/* Cola tipo monoposto / rear cowl */}
      <path d="M118 28 L140 34 L144 28 L140 22 L122 24 Z" />
      {/* Asiento plano y corto */}
      <path d="M106 28 L128 30 L130 36 L106 32 Z" />
      {/* Manillar tipo clip-on pero más alto que racing */}
      <rect x="62" y="26" width="20" height="3.5" rx="1.5" />
      <rect x="70" y="26" width="4" height="14" rx="2" />
    </svg>
  ),

  touring: (
    <svg viewBox="0 0 200 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Rueda delantera */}
      <circle cx="50" cy="63" r="14" fill="white" opacity="0.15" />
      <circle cx="50" cy="63" r="14" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="50" cy="63" r="4" />
      {/* Rueda trasera */}
      <circle cx="150" cy="63" r="14" fill="white" opacity="0.15" />
      <circle cx="150" cy="63" r="14" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="150" cy="63" r="4" />
      {/* Horquilla */}
      <path d="M62 44 L70 40 L62 63 L50 63 L56 44 Z" />
      {/* Carenado completo / fairing grande */}
      <path d="M46 52 L58 38 L72 34 L74 44 L62 56 Z" />
      {/* Parabrisa alto */}
      <path d="M60 38 L68 20 L78 20 L74 38 Z" />
      {/* Cuerpo principal */}
      <path d="M72 34 L80 24 L130 24 L148 40 L148 63 L62 63 L62 44 Z" />
      {/* Depósito */}
      <path d="M82 24 Q108 12 132 20 L130 24 L82 24 Z" />
      {/* Maletas laterales */}
      <rect x="130" y="40" width="16" height="20" rx="3" />
      {/* Asiento amplio */}
      <path d="M104 24 L140 30 L140 36 L104 28 Z" />
      {/* Manillar upright cómodo */}
      <rect x="62" y="24" width="20" height="4" rx="2" />
      <rect x="70" y="24" width="4" height="18" rx="2" />
    </svg>
  ),

  trike: (
    <svg viewBox="0 0 200 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Rueda delantera */}
      <circle cx="50" cy="63" r="14" fill="white" opacity="0.15" />
      <circle cx="50" cy="63" r="14" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="50" cy="63" r="4" />
      {/* Rueda trasera izquierda */}
      <circle cx="138" cy="63" r="13" fill="white" opacity="0.15" />
      <circle cx="138" cy="63" r="13" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="138" cy="63" r="4" />
      {/* Rueda trasera derecha */}
      <circle cx="164" cy="63" r="13" fill="white" opacity="0.15" />
      <circle cx="164" cy="63" r="13" stroke="currentColor" strokeWidth="5" fill="none" />
      <circle cx="164" cy="63" r="4" />
      {/* Horquilla delantera */}
      <path d="M62 44 L70 40 L62 63 L50 63 L56 44 Z" />
      {/* Cuerpo principal */}
      <path d="M70 40 L78 28 L130 28 L148 44 L148 63 L126 63 L126 50 L152 50 L152 63 L62 63 L62 44 Z" />
      {/* Eje trasero / diferencial */}
      <rect x="124" y="48" width="42" height="8" rx="3" />
      {/* Depósito */}
      <path d="M80 28 Q106 14 130 22 L128 28 L80 28 Z" />
      {/* Asiento */}
      <path d="M102 28 L136 32 L136 38 L102 32 Z" />
      {/* Manillar */}
      <rect x="62" y="26" width="22" height="4" rx="2" />
      <rect x="71" y="26" width="4" height="16" rx="2" />
    </svg>
  ),
}

export default function BodySilhouette({ type, className = "" }: Props) {
  return (
    <div className={className}>
      {silhouettes[type] ?? silhouettes.sedan}
    </div>
  )
}
