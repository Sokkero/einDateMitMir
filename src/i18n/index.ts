import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import de from './locales/de.json'
import en from './locales/en.json'

// German is the default; English is available via the language toggle.
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: de },
      en: { translation: en },
    },
    fallbackLng: 'de',
    supportedLngs: ['de', 'en'],
    interpolation: { escapeValue: false },
    detection: {
      // Remember the user's choice; otherwise fall back to German.
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
