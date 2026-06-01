import { useTranslation } from 'react-i18next'
import activities from '../../config/activities.json'

interface Props {
  selected: string[]
  onToggle: (id: string) => void
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
 * Page 3 body — activity tiles (multi-select, fixed list from
 * src/config/activities.json). A fixed 3-column grid of equal squares in a
 * width-capped container (kept slimmer than the letter so the tiles don't
 * sprawl). Each tile reserves two lines for its label so wrapping never
 * changes a tile's size. Title and nav live in DatePage's headline and
 * footer. See docs/MVP.md §6.2.
 */
export default function StepActivities({ selected, onToggle }: Props) {
  const { t } = useTranslation()

  return (
    <div className="flex w-full justify-center">
      <div className="grid w-full max-w-sm grid-cols-3 gap-3">
        {activities.map((activity) => {
          const isSelected = selected.includes(activity.id)
          return (
            <button
              key={activity.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(activity.id)}
              className={
                'relative flex aspect-square flex-col items-center justify-center gap-1.5 rounded-3xl border-2 p-2 transition-all ' +
                (isSelected
                  ? 'border-blush-500 bg-blush-100 shadow-md'
                  : 'border-blush-200 bg-white/70 hover:border-blush-300 hover:bg-blush-50')
              }
            >
              {isSelected && (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blush-500 text-xs font-bold text-white shadow">
                  ✓
                </span>
              )}
              <img
                src={icons[activity.icon]}
                alt=""
                aria-hidden="true"
                className="h-10 w-10 sm:h-12 sm:w-12"
              />
              <span className="flex min-h-[2.5rem] items-center justify-center text-center text-xs font-semibold leading-tight text-blush-600 sm:text-sm">
                {t(activity.labelKey)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
