import { useTranslation } from 'react-i18next'
import vibes from '../../config/vibes.json'

interface Props {
  /** Currently chosen vibe id, or null. */
  selected: string | null
  /** Called with the picked vibe id (single-select). */
  onSelect: (id: string) => void
}

/**
 * Vibe page body — the same tile pattern as StepActivities, but single-select
 * (picking one clears the rest). Fixed list from src/config/vibes.json, whose
 * `icon` field is an emoji rendered as text (no image assets). A 2-column grid
 * of equal squares; title and nav live in DatePage's headline and footer.
 * See docs/MVP.md §6.2.
 */
export default function StepVibe({ selected, onSelect }: Props) {
  const { t } = useTranslation()

  return (
    <div className="flex w-full justify-center">
      <div className="flex w-full max-w-sm flex-wrap justify-center gap-3">
        {vibes.map((vibe) => {
          const isSelected = selected === vibe.id
          return (
            <button
              key={vibe.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(vibe.id)}
              className={
                'relative flex aspect-square w-[calc((100%-0.9rem)/2)] flex-col items-center justify-center gap-1.5 rounded-3xl border-2 p-2 transition-all ' +
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
              <span aria-hidden="true" className="text-4xl sm:text-5xl">
                {vibe.icon}
              </span>
              <span className="flex min-h-[2.5rem] items-center justify-center text-center text-xs font-semibold leading-tight text-blush-600 sm:text-sm">
                {t(vibe.labelKey)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
