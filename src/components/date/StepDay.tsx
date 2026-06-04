import { motion } from 'framer-motion'
import Calendar from './Calendar.tsx'
import type { TimeOfDay } from '../../lib/dateForm.ts'

interface StepDayProps {
  date: string | null
  timeOfDay: TimeOfDay | null
  onDateChange: (iso: string) => void
  onTimeChange: (t: TimeOfDay) => void
}

const TIMES: { id: TimeOfDay; label: string; icon: string }[] = [
  { id: 'morning', label: 'Morgens', icon: '🌅' },
  { id: 'afternoon', label: 'Nachmittags', icon: '☀️' },
  { id: 'evening', label: 'Abends', icon: '🌙' },
]

/** Step 2 — pick a day (calendar) and a time of day. */
export default function StepDay({ date, timeOfDay, onDateChange, onTimeChange }: StepDayProps) {
  return (
    <div>
      <h2 className="mb-4 text-center font-display text-xl font-bold text-blush-600 sm:text-2xl">
        Welcher Tag passt dir am besten?
      </h2>

      <Calendar selected={date} onSelect={onDateChange} />

      <p className="mt-5 mb-2 text-center font-display font-semibold text-blush-600">
        Und zu welcher Tageszeit?
      </p>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {TIMES.map((t) => {
          const active = timeOfDay === t.id
          return (
            <motion.button
              key={t.id}
              type="button"
              aria-pressed={active}
              onClick={() => onTimeChange(t.id)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              className={
                'flex min-h-11 flex-col items-center gap-1 rounded-2xl border px-2 py-3 font-display font-semibold transition ' +
                (active
                  ? 'border-blush-400 bg-blush-500 text-white shadow-md shadow-blush-300/60'
                  : 'border-white/70 bg-white/60 text-blush-600 hover:bg-white')
              }
            >
              <span className="text-2xl">{t.icon}</span>
              <span className="text-sm">{t.label}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
