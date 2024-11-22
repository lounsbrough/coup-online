import { createContext, useContext, ReactNode, useState, useCallback } from 'react'
import { Actions, EventMessages, Influences } from '@shared'
import { activeLanguageStorageKey } from '../helpers/localStorageKeys'
import { AvailableLanguageCode } from '../i18n/availableLanguages'
import translations, { Translations } from '../i18n/translations'

type TranslationSimpleReplacementVariables = {
  primaryPlayer?: string | undefined
  secondaryPlayer?: string | undefined
}

type TranslationVariables = TranslationSimpleReplacementVariables & {
  count?: number | undefined
  action?: Actions | undefined
  influence?: Influences | undefined
}

type TranslationContextType = {
  t: (key: keyof Translations, options?: TranslationVariables) => ReactNode
  language: AvailableLanguageCode
  setLanguage: (key: AvailableLanguageCode) => void
}

export const TranslationContext = createContext<TranslationContextType>({ t: () => null, language: AvailableLanguageCode['en-US'], setLanguage: () => { } })

const availableCodes = new Set<string>(Object.values(AvailableLanguageCode))
const defaultLanguage = localStorage.getItem(activeLanguageStorageKey) as AvailableLanguageCode
  ?? navigator.languages.find((preferred) => availableCodes.has(preferred))
  ?? AvailableLanguageCode['en-US']

export function TranslationContextProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<AvailableLanguageCode>(defaultLanguage)

  const getTranslation = useCallback((key: keyof Translations, variables?: TranslationVariables): ReactNode => {
    const effectiveTranslations = translations[language]

    const hasActionsKey = key === EventMessages.ActionPending || key === EventMessages.ActionProcessed

    let template = hasActionsKey
      ? effectiveTranslations[key][variables!.action!]
      : effectiveTranslations[key]

    if (!variables) {
      return template
    }

    if (variables.count !== undefined) {
      template = template.replaceAll('{{count}}', variables.count.toString())
      const pluralRegex = /\{\{plural:(.*?)\}\}/g
      template = template.replaceAll(pluralRegex, (replaceMatch) => {
        const plural = replaceMatch.matchAll(pluralRegex).next().value?.[1]
        return (variables.count !== 1 && plural) || ''
      })
    }

    if (variables.influence) {
      template = template.replaceAll(`{{influence}}`, effectiveTranslations[variables.influence])
    }

    if (variables.action) {
      const actionRegex = /\{\{action(:?.*?)\}\}/g
      template = template.replaceAll(actionRegex, (replaceMatch) => {
        const actionOverride = replaceMatch.matchAll(actionRegex).next().value?.[1]
        console.log(actionOverride)
        return actionOverride
          ? actionOverride.slice(1)
          : effectiveTranslations[variables.action!]
      })
    }

    const replacementKeys: (keyof TranslationSimpleReplacementVariables)[] = [
      'primaryPlayer',
      'secondaryPlayer'
    ]

    replacementKeys.forEach((thing) => {
      if (variables[thing] !== undefined) {
        template = template.replaceAll(`{{${thing}}}`, variables[thing] as string)
      }
    })

    return template
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
