import { useTranslation } from 'react-i18next'
import Calendar from './Calendar'
import type { TimeOfDay } from '../../lib/dateForm'

interface Props {
  date: string | null
  timeOfDay: TimeOfDay | null
  onDateChange: (iso: string) => void
  onTimeOfDayChange: (t: TimeOfDay) => void
  onNext: () => void
}

const TIMES: TimeOfDay[] = ['morning', 'afternoon', 'evening']

/**
 * Page 2 — pick a day (single, future only) and a time of day
 * (morning / afternoon / evening). See docs/MVP.md §6.2.
 */
export default function StepDay({
  date,
  timeOfDay,
  onDateChange,
  onTimeOfDayChange,
  onNext,
}: Props) {
  const { t } = useTranslation()
  const canContinue = date !== null && timeOfDay !== null

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <h2 className="text-2xl font-bold text-blush-600">{t('date.day.title')}</h2>

      <Calendar selected={date} onSelect={onDateChange} />

      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-semibold text-blush-400">{t('date.day.timeOfDay')}</span>
        <div className="flex gap-2">
          {TIMES.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => onTimeOfDayChange(time)}
              className={
                'rounded-2xl px-4 py-2 text-sm font-semibold transition-colors ' +
                (timeOfDay === time
                  ? 'bg-blush-500 text-white shadow-md'
                  : 'border border-blush-200 bg-white/70 text-blush-500 hover:bg-blush-100')
              }
            >
              {t(`date.day.${time}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-4">
        <button
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          className="rounded-2xl bg-blush-500 px-8 py-3 font-bold text-white shadow-md transition-transform enabled:hover:scale-105 enabled:active:scale-95 disabled:opacity-40"
        >
          {t('date.nav.next')}
        </button>
      </div>
    </div>
  )
}
