'use client';

import { type CSSProperties } from 'react';
import { motion } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EtherealShadowProps {
  /** Color de los blobs. Default: tono ink de FISCALIZA */
  color?:     string;
  /** Velocidad de la animación en segundos (ciclo completo). Default: 20 */
  duration?:  number;
  /** Opacidad del grain (0–1). Default: 0 (sin grain) */
  grainOpacity?: number;
  style?:     CSSProperties;
  className?: string;
}

// ─── Blobs ───────────────────────────────────────────────────────────────────
// Cada blob tiene: posición inicial, dimensiones y keyframes de movimiento.
// Los keyframes son offsets en px relativos a la posición inicial.

const BLOBS = [
  {
    left: '5%',  top: '5%',  w: '60%', h: '55%',
    kx: [0,  60, -40,  30,  0],
    ky: [0, -50,  40, -25,  0],
    dur: 1.0,
  },
  {
    left: '55%', top: '-5%', w: '55%', h: '60%',
    kx: [0, -55,  35, -20,  0],
    ky: [0,  45, -55,  25,  0],
    dur: 1.15,
  },
  {
    left: '60%', top: '60%', w: '52%', h: '50%',
    kx: [0,  40, -30,  50,  0],
    ky: [0, -35,  60, -30,  0],
    dur: 0.9,
  },
  {
    left: '5%',  top: '65%', w: '48%', h: '55%',
    kx: [0, -45,  55, -35,  0],
    ky: [0,  55, -40,  20,  0],
    dur: 1.2,
  },
  {
    left: '38%', top: '35%', w: '40%', h: '42%',
    kx: [0,  35, -55,  25,  0],
    ky: [0, -30,  45, -40,  0],
    dur: 1.05,
  },
] as const;

// Grain SVG inline — sin dependencias externas
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`

// ─── Componente ───────────────────────────────────────────────────────────────

export function EtherealShadow({
  color        = 'rgba(17, 16, 16, 0.22)',
  duration     = 22,
  grainOpacity = 0,
  style,
  className,
}: EtherealShadowProps) {
  return (
    /*
      El className controla position/inset/z-index desde fuera.
      El componente solo impone overflow:hidden para recortar los blobs.
    */
    <div className={className} style={{ overflow: 'hidden', ...style }}>

      {/* Blobs animados con motion.div */}
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          style={{
            position:     'absolute',
            left:         b.left,
            top:          b.top,
            width:        b.w,
            height:       b.h,
            borderRadius: '50%',
            background:   color,
            filter:       'blur(50px)',
          }}
          animate={{
            x:     b.kx as unknown as number[],
            y:     b.ky as unknown as number[],
            scale: [1, 1.08, 0.94, 1.05, 1],
          }}
          transition={{
            duration:   duration * b.dur,
            delay:      i * 1.4,
            repeat:     Infinity,
            repeatType: 'loop',
            ease:       'easeInOut',
          }}
        />
      ))}

      {/* Grain opcional */}
      {grainOpacity > 0 && (
        <div
          style={{
            position:         'absolute',
            inset:            0,
            backgroundImage:  GRAIN_SVG,
            backgroundSize:   '200px 200px',
            backgroundRepeat: 'repeat',
            opacity:          grainOpacity,
            mixBlendMode:     'multiply',
            pointerEvents:    'none',
          }}
        />
      )}
    </div>
  );
}
