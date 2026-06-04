import { motion, useReducedMotion } from 'framer-motion'
import { useMemo } from 'react'

const HEART_EMOJIS = ['💕', '💗', '🤍', '💞', '🌸']

interface Drifter {
  id: number
  emoji: string
  left: number // vw
  size: number // rem
  duration: number // s
  delay: number // s
  sway: number // px
  opacity: number
}

/**
 * Animated romantic backdrop rendered behind everything: a softly shifting
 * blush gradient, a couple of drifting glow blobs, and a modest set of
 * translucent emoji hearts floating upward with a gentle sway.
 * Respects prefers-reduced-motion (static gradient, no drifters).
 */
export default function HeartsBackground() {
  const reduce = useReducedMotion()

  const drifters = useMemo<Drifter[]>(() => {
    const count = 14
    // Deterministic pseudo-random so layout is stable across renders.
    const rand = (seed: number) => {
      const x = Math.sin(seed * 99.13) * 43758.5453
      return x - Math.floor(x)
    }
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: HEART_EMOJIS[i % HEART_EMOJIS.length],
      left: rand(i + 1) * 100,
      size: 1.1 + rand(i + 2) * 1.9,
      duration: 16 + rand(i + 3) * 16,
      delay: rand(i + 4) * -32,
      sway: 20 + rand(i + 5) * 40,
      opacity: 0.25 + rand(i + 6) * 0.4,
    }))
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base + slowly shifting gradient */}
      <div className="absolute inset-0 bg-blush-100" />
      <motion.div
        className="absolute inset-[-25%] bg-[linear-gradient(120deg,#fff5f8,#ffe4ee,#ffc9dd,#ffe4ee,#fff5f8)] bg-[length:300%_300%]"
        animate={reduce ? undefined : { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={reduce ? undefined : { duration: 28, ease: 'easeInOut', repeat: Infinity }}
      />

      {/* Drifting glow blobs */}
      <motion.div
        className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-blush-300/40 blur-3xl"
        animate={reduce ? undefined : { x: [0, 60, 0], y: [0, 40, 0] }}
        transition={reduce ? undefined : { duration: 24, ease: 'easeInOut', repeat: Infinity }}
      />
      <motion.div
        className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-coral/30 blur-3xl"
        animate={reduce ? undefined : { x: [0, -50, 0], y: [0, -30, 0] }}
        transition={reduce ? undefined : { duration: 30, ease: 'easeInOut', repeat: Infinity }}
      />

      {/* Drifting hearts — skipped entirely under reduced motion */}
      {!reduce &&
        drifters.map((d) => (
          <motion.span
            key={d.id}
            className="absolute bottom-[-10vh] select-none"
            style={{ left: `${d.left}vw`, fontSize: `${d.size}rem`, opacity: d.opacity }}
            initial={{ y: 0, x: 0 }}
            animate={{ y: '-120vh', x: [0, d.sway, -d.sway, 0] }}
            transition={{
              duration: d.duration,
              delay: d.delay,
              repeat: Infinity,
              ease: 'linear',
              x: { duration: d.duration / 2, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            {d.emoji}
          </motion.span>
        ))}
    </div>
  )
}
