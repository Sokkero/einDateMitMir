import { motion } from 'framer-motion'

interface Props {
  /** Excitement level, 0–100. */
  value: number
  /** Called with the new level as the slider moves. */
  onChange: (value: number) => void
}

/**
 * Excitement heart-meter body — a heart grows as the slider moves right; all
 * the way left it shrinks and turns into a broken heart. The heart is centred
 * in the free space and the slider sits below it (lifted off the letter's
 * bottom edge). Always passable (any value is valid), so DatePage gates it with
 * `canContinue: () => true`. Title and nav live in DatePage's headline and
 * footer. See docs/MVP.md §6.2 / §7.
 */
export default function StepExcitement({ value, onChange }: Props) {
  const broken = value === 0
  // 0–100 → scale 0.8–3.4. Capped so the largest heart still fits the letter's
  // narrow paper area without clipping or spilling off the page.
  const scale = 0.8 + (value / 100) * 2.6

  return (
    <div className="flex w-full flex-1 flex-col items-center pt-8">
      <div className="flex flex-1 items-center justify-center">
        <motion.span
          aria-hidden="true"
          animate={{ scale }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="pointer-events-none select-none text-7xl leading-none"
          style={{ transformOrigin: 'center' }}
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
        aria-label="Wie aufgeregt bist du?"
        className="mt-6 mb-20 w-full max-w-sm accent-blush-500"
      />
    </div>
  )
}
