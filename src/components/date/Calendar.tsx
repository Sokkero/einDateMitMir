import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toIsoDate } from '../../lib/dateForm'

interface Props {
  /** Currently selected day (yyyy-mm-dd) or null. */
  selected: string | null
  /** Called with the chosen day (yyyy-mm-dd). */
  onSelect: (iso: string) => void
}

/** Midnight today, used to disable today + past days (future only). */
function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/** A reference Monday, used to render localized weekday labels Mon–Sun. */
const REF_MONDAY = new Date(2024, 0, 1) // Jan 1 2024 was a Monday.

export default function Calendar({ selected, onSelect }: Props) {
  const { i18n } = useTranslation()
  const lang = i18n.resolvedLanguage ?? 'de'
  const today = useMemo(startOfToday, [])

  // The month currently displayed; starts on the current month.
  const [view, setView] = useState(() => ({ year: today.getFullYear(), month: today.getMonth() }))

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' }).format(
        new Date(view.year, view.month, 1),
      ),
    [lang, view],
  )

  const weekdayLabels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(lang, { weekday: 'short' })
    return Array.from({ length: 7 }, (_, i) =>
      fmt.format(new Date(REF_MONDAY.getFullYear(), REF_MONDAY.getMonth(), REF_MONDAY.getDate() + i)),
    )
  }, [lang])

  // Leading blanks (Monday-first) + the days of the month.
  const cells = useMemo(() => {
    const first = new Date(view.year, view.month, 1)
    const lead = (first.getDay() + 6) % 7 // 0 = Monday
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
    const out: (Date | null)[] = Array.from({ length: lead }, () => null)
    for (let d = 1; d <= daysInMonth; d++) out.push(new Date(view.year, view.month, d))
    return out
  }, [view])

  // Disable navigating to a month before the current one.
  const atCurrentMonth = view.year === today.getFullYear() && view.month === today.getMonth()

  const shift = (delta: number) =>
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })

  return (
    <div className="w-full max-w-sm rounded-2xl bg-white/80 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={atCurrentMonth}
          className="rounded-full px-3 py-1 text-blush-500 enabled:hover:bg-blush-100 disabled:opacity-30"
          aria-label="previous month"
        >
          ‹
        </button>
        <span className="font-semibold capitalize text-blush-600">{monthLabel}</span>
        <button
          type="button"
          onClick={() => shift(1)}
          className="rounded-full px-3 py-1 text-blush-500 hover:bg-blush-100"
          aria-label="next month"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-blush-300">
        {weekdayLabels.map((w, i) => (
          <div key={i} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />
          const iso = toIsoDate(date)
          const disabled = date <= today
          const isSelected = iso === selected
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(iso)}
              className={
                'aspect-square rounded-full text-sm transition-colors ' +
                (isSelected
                  ? 'bg-blush-500 font-bold text-white'
                  : disabled
                    ? 'text-blush-200'
                    : 'text-blush-600 hover:bg-blush-100')
              }
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
