import { motion, useReducedMotion } from 'framer-motion'
import { useMemo } from 'react'

const CONFETTI_EMOJIS = ['💕', '✨', '💖', '🎉', '🌸', '💗', '💞', '🤍']

interface Piece {
  id: number
  emoji: string
  left: number // vw
  size: number // rem
  duration: number
  delay: number
  drift: number // px
  rotate: number
}

/**
 * Emoji/CSS confetti for the finale — hearts and sparkles bursting and raining.
 * Pure framer-motion, no library. Honors prefers-reduced-motion (renders nothing).
 */
export default function Confetti() {
  const reduce = useReducedMotion()

  const pieces = useMemo<Piece[]>(() => {
    const count = 36
    const rand = (seed: number) => {
      const x = Math.sin(seed * 12.9898) * 43758.5453
      return x - Math.floor(x)
    }
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length],
      left: rand(i + 1) * 100,
      size: 1.2 + rand(i + 2) * 1.6,
      duration: 2.4 + rand(i + 3) * 2.2,
      delay: rand(i + 4) * 0.8,
      drift: (rand(i + 5) - 0.5) * 160,
      rotate: (rand(i + 6) - 0.5) * 540,
    }))
  }, [])

  if (reduce) return null

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-[-10vh] select-none"
          style={{ left: `${p.left}vw`, fontSize: `${p.size}rem` }}
          initial={{ y: 0, x: 0, opacity: 0, rotate: 0 }}
          animate={{ y: '115vh', x: p.drift, opacity: [0, 1, 1, 0.9], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  )
}
