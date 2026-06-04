import { useState } from 'react'
import { motion } from 'framer-motion'
import { toIsoDate, fromIsoDate } from '../../lib/dateForm.ts'

interface CalendarProps {
  selected: string | null // local ISO yyyy-mm-dd
  onSelect: (iso: string) => void
}

const MONTH_FMT = new Intl.DateTimeFormat('de', { month: 'long', year: 'numeric' })
// Monday-first short weekday labels (Mo Di Mi Do Fr Sa So).
const WEEKDAY_FMT = new Intl.DateTimeFormat('de', { weekday: 'short' })

function weekdayLabels(): string[] {
  // 2024-01-01 is a Monday — walk seven days from it.
  const labels: string[] = []
  for (let i = 0; i < 7; i++) {
    labels.push(WEEKDAY_FMT.format(new Date(2024, 0, 1 + i)))
  }
  return labels
}

/** Day-of-week with Monday = 0 … Sunday = 6. */
function mondayIndex(d: Date): number {
  return (d.getDay() + 6) % 7
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/**
 * From-scratch month calendar: German locale, Monday-first, future days only
 * (today and past disabled), can't navigate before the current month.
 */
export default function Calendar({ selected, onSelect }: CalendarProps) {
  const today = startOfDay(new Date())
  const initial = selected ? fromIsoDate(selected) : today
  const [view, setView] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1))

  const year = view.getFullYear()
  const month = view.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leadingBlanks = mondayIndex(firstOfMonth)

  const atCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  const cells: (Date | null)[] = []
  for (let i = 0; i < leadingBlanks; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day))

  function go(delta: number) {
    setView(new Date(year, month + delta, 1))
  }

  const labels = weekdayLabels()

  return (
    <div className="rounded-2xl border border-white/70 bg-white/50 p-3 shadow-inner sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={atCurrentMonth}
          aria-label="Vorheriger Monat"
          className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-blush-600 transition hover:bg-blush-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ‹
        </button>
        <span className="font-display font-bold capitalize text-blush-700">
          {MONTH_FMT.format(firstOfMonth)}
        </span>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Nächster Monat"
          className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-blush-600 transition hover:bg-blush-100"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {labels.map((label) => (
          <div key={label} className="py-1 text-xs font-semibold capitalize text-blush-400">
            {label}
          </div>
        ))}

        {cells.map((date, i) => {
          if (!date) return <div key={`b${i}`} />
          const iso = toIsoDate(date)
          const isPast = date.getTime() <= today.getTime()
          const isSelected = iso === selected
          return (
            <motion.button
              key={iso}
              type="button"
              disabled={isPast}
              onClick={() => onSelect(iso)}
              whileHover={isPast ? undefined : { scale: 1.08 }}
              whileTap={isPast ? undefined : { scale: 0.92 }}
              className={
                'mx-auto flex aspect-square w-full max-w-11 min-h-11 items-center justify-center rounded-full text-sm font-semibold transition ' +
                (isSelected
                  ? 'bg-blush-500 text-white shadow-md shadow-blush-300/60'
                  : isPast
                    ? 'cursor-not-allowed text-blush-200'
                    : 'text-blush-700 hover:bg-blush-100')
              }
            >
              {date.getDate()}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
