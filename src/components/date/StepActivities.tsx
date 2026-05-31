import { useTranslation } from 'react-i18next'
import activities from '../../config/activities.json'

interface Props {
  selected: string[]
  onToggle: (id: string) => void
  onBack: () => void
  onNext: () => void
}

// Resolve every icon in src/assets/activities/ to a hashed URL at build time.
// Keyed by bare filename (e.g. "cinema.svg") so activities.json's `icon` field
// maps straight through — swap an SVG for a PNG by dropping the file and
// changing the extension in activities.json, nothing here needs to change.
const iconUrls = import.meta.glob('../../assets/activities/*', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const icons: Record<string, string> = {}
for (const [path, url] of Object.entries(iconUrls)) {
  const file = path.split('/').pop()
  if (file) icons[file] = url
}

/**
 * Page 3 — activity tiles (multi-select, fixed list from
 * src/config/activities.json). Big square tiles in a grid: 1 column on phones,
 * 2 on small screens, 3 on large. See docs/MVP.md §6.2.
 */
export default function StepActivities({ selected, onToggle, onBack, onNext }: Props) {
  const { t } = useTranslation()
  const canContinue = selected.length > 0

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <h2 className="text-2xl font-bold text-blush-600">{t('date.activities.title')}</h2>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activities.map((activity) => {
          const isSelected = selected.includes(activity.id)
          return (
            <button
              key={activity.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(activity.id)}
              className={
                'relative flex aspect-square flex-col items-center justify-center gap-3 rounded-3xl border-2 p-4 transition-all ' +
                (isSelected
                  ? 'border-blush-500 bg-blush-100 shadow-md'
                  : 'border-blush-200 bg-white/70 hover:border-blush-300 hover:bg-blush-50')
              }
            >
              {isSelected && (
                <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-blush-500 text-sm font-bold text-white shadow">
                  ✓
                </span>
              )}
              <img
                src={icons[activity.icon]}
                alt=""
                aria-hidden="true"
                className="h-16 w-16 sm:h-20 sm:w-20"
              />
              <span className="text-sm font-semibold text-blush-600 sm:text-base">
                {t(activity.labelKey)}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-2 flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-blush-500 underline"
        >
          {t('date.nav.back')}
        </button>
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
