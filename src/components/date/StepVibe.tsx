import { motion } from 'framer-motion'
import vibes from '../../config/vibes.json'

interface StepVibeProps {
  selected: string | null
  onSelect: (id: string) => void
}

/** Step 4 — single-select vibe tiles (exactly one required). */
export default function StepVibe({ selected, onSelect }: StepVibeProps) {
  return (
    <div>
      <h2 className="mb-5 text-center font-display text-xl font-bold text-blush-600 sm:text-2xl">
        Welche Stimmung soll es sein?
      </h2>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {vibes.map((v) => {
          const active = selected === v.id
          return (
            <motion.button
              key={v.id}
              type="button"
              aria-pressed={active}
              aria-label={v.label}
              onClick={() => onSelect(v.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              animate={active ? { scale: [1, 1.12, 1] } : { scale: 1 }}
              transition={{ duration: 0.25 }}
              className={
                'flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border p-2 transition ' +
                (active
                  ? 'border-blush-400 bg-blush-500/90 text-white shadow-lg shadow-blush-300/60'
                  : 'border-white/70 bg-white/60 text-blush-700 hover:bg-white')
              }
            >
              <span className="text-3xl leading-none sm:text-4xl">{v.icon}</span>
              <span className="flex min-h-8 items-center text-center text-xs font-semibold leading-tight">
                {v.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
