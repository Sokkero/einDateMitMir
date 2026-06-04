import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useMemo } from 'react'

interface StepExcitementProps {
  value: number // 0–100
  onChange: (v: number) => void
}

/**
 * Step 5 — excitement heart-meter. A big heart grows with the slider and beats
 * faster as excitement rises; at 0 it becomes a broken heart. Always valid.
 */
export default function StepExcitement({ value, onChange }: StepExcitementProps) {
  const reduce = useReducedMotion()
  const broken = value === 0
  // Scale heart from ~0.7 at low end to ~1.8 at the top.
  const scale = 0.7 + (value / 100) * 1.1
  // Beat faster as excitement climbs (1.4s → 0.4s).
  const beat = 1.4 - (value / 100) * 1.0

  const floaters = useMemo(
    () => Array.from({ length: 6 }, (_, i) => ({ id: i, left: 12 + i * 14, delay: i * 0.18 })),
    [],
  )

  return (
    <div className="text-center">
      <h2 className="mb-6 font-display text-xl font-bold text-blush-600 sm:text-2xl">
        Wie aufgeregt bist du?
      </h2>

      <div className="relative mx-auto flex h-40 w-full max-w-sm items-center justify-center">
        {/* Floating hearts at high excitement */}
        <AnimatePresence>
          {!reduce &&
            value >= 70 &&
            floaters.map((f) => (
              <motion.span
                key={f.id}
                className="pointer-events-none absolute bottom-10 select-none text-xl"
                style={{ left: `${f.left}%` }}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 0.9, 0], y: -90 }}
                transition={{ duration: 2, delay: f.delay, repeat: Infinity }}
              >
                💕
              </motion.span>
            ))}
        </AnimatePresence>

        <motion.span
          className="select-none text-7xl"
          animate={
            reduce
              ? { scale }
              : { scale: broken ? scale : [scale, scale * 1.12, scale] }
          }
          transition={
            reduce
              ? { type: 'spring', stiffness: 200, damping: 15 }
              : broken
                ? { type: 'spring', stiffness: 200, damping: 15 }
                : { duration: beat, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          {broken ? '💔' : '❤️'}
        </motion.span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Aufregung"
        className="mt-4 h-2 w-full max-w-sm cursor-pointer appearance-none rounded-full bg-blush-200 accent-blush-500"
      />
      <p className="mt-3 font-display text-lg font-bold text-blush-600">{value}%</p>
    </div>
  )
}
