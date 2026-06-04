import { motion } from 'framer-motion'
import activities from '../../config/activities.json'

interface StepActivitiesProps {
  inviterName: string
  selected: string[]
  onToggle: (id: string) => void
}

/** Step 3 — multi-select activity tiles (at least one required). */
export default function StepActivities({ inviterName, selected, onToggle }: StepActivitiesProps) {
  return (
    <div>
      <h2 className="mb-5 text-center font-display text-xl font-bold text-blush-600 sm:text-2xl">
        Was hättest du Lust mit {inviterName} zu unternehmen?
      </h2>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
        {activities.map((a) => {
          const active = selected.includes(a.id)
          return (
            <motion.button
              key={a.id}
              type="button"
              aria-pressed={active}
              aria-label={a.label}
              onClick={() => onToggle(a.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              animate={active ? { scale: [1, 1.12, 1] } : { scale: 1 }}
              transition={{ duration: 0.25 }}
              className={
                'relative flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border p-2 transition ' +
                (active
                  ? 'border-blush-400 bg-blush-500/90 text-white shadow-lg shadow-blush-300/60'
                  : 'border-white/70 bg-white/60 text-blush-700 hover:bg-white')
              }
            >
              {active && (
                <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs text-blush-500 shadow">
                  ✓
                </span>
              )}
              <span className="text-3xl leading-none sm:text-4xl">{a.icon}</span>
              <span className="flex min-h-8 items-center text-center text-xs font-semibold leading-tight">
                {a.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
