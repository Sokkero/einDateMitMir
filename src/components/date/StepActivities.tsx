import { useTranslation } from 'react-i18next'

interface Props {
  onBack: () => void
}

/**
 * Page 3 — activity tiles (multi-select, fixed list from
 * src/config/activities.json). Skeleton for now. See docs/MVP.md §6.2.
 */
export default function StepActivities({ onBack }: Props) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <h2 className="text-2xl font-bold text-blush-600">{t('date.activities.title')}</h2>
      <div className="rounded-2xl bg-white/70 px-8 py-10 text-blush-400 shadow-sm">
        🎬 ☕ 🍝 — coming next
      </div>
      <button type="button" onClick={onBack} className="text-sm font-semibold text-blush-500 underline">
        {t('date.nav.back')}
      </button>
    </div>
  )
}
