import { useTranslation } from 'react-i18next'

const LANGS = ['de', 'en'] as const

export default function LanguageToggle() {
  const { i18n } = useTranslation()
  const current = i18n.resolvedLanguage ?? 'de'

  return (
    <div className="flex overflow-hidden rounded-full border border-blush-300 bg-white/70 text-sm shadow-sm backdrop-blur">
      {LANGS.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => i18n.changeLanguage(lng)}
          className={
            'px-3 py-1 font-semibold transition-colors ' +
            (current === lng
              ? 'bg-blush-500 text-white'
              : 'text-blush-600 hover:bg-blush-100')
          }
          aria-pressed={current === lng}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
