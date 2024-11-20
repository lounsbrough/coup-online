import { createContext, useContext, ReactNode, useState, useCallback } from 'react'
import { activeLanguageStorageKey } from '../helpers/localStorageKeys'
import { AvailableLanguageCode } from '../i18n/availableLanguages'
import translations, { Translations } from '../i18n/translations'

type TranslationContextType = {
  t: (key: keyof Translations) => string
  language: AvailableLanguageCode
  setLanguage: (key: AvailableLanguageCode) => void
}

export const TranslationContext = createContext<TranslationContextType>({ t: () => '', language: AvailableLanguageCode['en-US'], setLanguage: () => { } })

const availableCodes = new Set<string>(Object.values(AvailableLanguageCode))
const defaultLanguage = localStorage.getItem(activeLanguageStorageKey) as AvailableLanguageCode
  ?? navigator.languages.find((preferred) => availableCodes.has(preferred))
  ?? AvailableLanguageCode['en-US']

export function TranslationContextProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<AvailableLanguageCode>(defaultLanguage)

  const getTranslation = useCallback((key: keyof Translations) =>
    translations[language][key], [language])

  return (
    <TranslationContext.Provider value={{
      t: getTranslation,
      language,
      setLanguage: useCallback((l: AvailableLanguageCode) => {
        setLanguage(l)
        localStorage.setItem(activeLanguageStorageKey, l)
      }, [setLanguage])
    }}
    >
      {children}
    </TranslationContext.Provider>
  )
}

export const useTranslationContext = () => useContext(TranslationContext)
