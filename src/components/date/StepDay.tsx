import { useTranslation } from 'react-i18next'
import Calendar from './Calendar'
import type { TimeOfDay } from '../../lib/dateForm'

interface Props {
  date: string | null
  timeOfDay: TimeOfDay | null
  onDateChange: (iso: string) => void
  onTimeOfDayChange: (t: TimeOfDay) => void
}

const TIMES: TimeOfDay[] = ['morning', 'afternoon', 'evening']

/**
 * Page 2 body — pick a day (single, future only) and a time of day
 * (morning / afternoon / evening). Title and nav live in DatePage's headline
 * and footer; this component is just the form. See docs/MVP.md §6.2.
 */
export default function StepDay({ date, timeOfDay, onDateChange, onTimeOfDayChange }: Props) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center gap-6 text-center">
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
    </div>
  )
}
