import { createContext, useContext, ReactNode, useState, useCallback } from 'react'
import { Influences } from '@shared'
import { activeLanguageStorageKey } from '../helpers/localStorageKeys'
import { AvailableLanguageCode } from '../i18n/availableLanguages'
import translations, { Translations } from '../i18n/translations'

type TranslationSimpleReplacementVariables = {
  primaryPlayer?: string | undefined
  secondaryPlayer?: string | undefined
  influence?: Influences | undefined
}

type TranslationVariables = TranslationSimpleReplacementVariables & {
  count?: number | undefined
}

type TranslationContextType = {
  t: (key: keyof Translations, options?: TranslationVariables) => string
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

  const getTranslation = useCallback((key: keyof Translations, variables?: TranslationVariables) => {
    let text = translations[language][key]

    if (!variables) {
      return text
    }

    if (variables.count !== undefined) {
      text = text.replaceAll('{{count}}', variables.count.toString())
      const pluralRegex = /\{\{plural:(.*)\}\}/g
      text = text.replaceAll(pluralRegex, (replaceMatch) => {
        const plural = replaceMatch.matchAll(pluralRegex).next().value?.[1]
        return (variables.count !== 1 && plural) || ''
      })
    }

    const replacementKeys: (keyof TranslationSimpleReplacementVariables)[] = [
      'primaryPlayer',
      'secondaryPlayer',
      'influence'
    ]

    replacementKeys.forEach((thing) => {
      if (variables[thing] !== undefined) {
        text = text.replaceAll(`{{${thing}}}`, variables[thing] as string)
      }
    })

    return text
  }, [language])

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
