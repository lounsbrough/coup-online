import { createContext, useContext, ReactNode, useState, useCallback } from 'react'
import { Typography, useTheme } from '@mui/material'
import { Actions, EventMessages, Influences, PublicGameState } from '@shared'
import { activeLanguageStorageKey } from '../helpers/localStorageKeys'
import { AvailableLanguageCode } from '../i18n/availableLanguages'
import translations, { Translations } from '../i18n/translations'

type PlayerVariables = {
  primaryPlayer: string | undefined
  secondaryPlayer: string | undefined
}

type TranslationVariables = PlayerVariables & {
  gameState: PublicGameState | undefined
  count: number | undefined
  action: Actions | undefined
  influence: Influences | undefined
}

type TranslationContextType = {
  t: (key: keyof Translations, variables?: Partial<TranslationVariables>) => ReactNode
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
  const { influenceColors, actionColors } = useTheme()

  const getTranslation = useCallback((key: keyof Translations, variables?: Partial<TranslationVariables>): ReactNode => {
    const effectiveTranslations = translations[language]

    const hasActionsKey =
      key === EventMessages.ActionConfirm
      || key === EventMessages.ActionPending
      || key === EventMessages.ActionProcessed

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

    const segments: (ReactNode)[] = [template]

    if (variables.influence) {
      segments.forEach((segment, i) => {
        if (typeof segment === 'string') {
          const matches = [...segment.matchAll(/(.*)\{\{influence\}\}(.*)/g)][0]
          if (matches) {
            segments.splice(i, 1,
              matches[1],
              <Typography
                key={variables.influence}
                component='span'
                fontWeight='inherit'
                fontSize='inherit'
                sx={{ color: influenceColors?.[variables.influence!] }}
              >
                {effectiveTranslations[variables.influence!]}
              </Typography>,
              matches[2]
            )
          }
        }
      })
    }

    if (variables.action) {
      segments.forEach((segment, i) => {
        if (typeof segment === 'string') {
          const matches = [...segment.matchAll(/(.*)\{\{action(:?.*?)\}\}(.*)/g)][0]
          if (matches) {
            const effectiveAction = matches[2]?.slice(1) || effectiveTranslations[variables.action!]
            segments.splice(i, 1,
              matches[1],
              <Typography
                key={variables.action}
                component='span'
                fontWeight='inherit'
                fontSize='inherit'
                sx={{ color: actionColors?.[variables.action!] }}
              >
                {effectiveAction}
              </Typography>,
              matches[3]
            )
          }
        }
      })
    }

    const playerKeys: (keyof PlayerVariables)[] = [
      'primaryPlayer',
      'secondaryPlayer'
    ]

    playerKeys.forEach((playerKey) => {
      if (variables[playerKey] !== undefined) {
        segments.forEach((segment, i) => {
          if (typeof segment === 'string') {
            const matches = [...segment.matchAll(new RegExp(`(.*){{${playerKey}}}(.*)`, 'g'))][0]
            if (matches) {
              segments.splice(i, 1,
                matches[1],
                <Typography
                  key={playerKey}
                  component='span'
                  fontWeight='inherit'
                  fontSize='inherit'
                  sx={{ color: variables.gameState?.players.find(({ name }) => name === variables[playerKey])?.color }}
                >
                  {variables[playerKey]}
                </Typography>,
                matches[2]
              )
            }
          }
        })
      }
    })

    return segments
  }, [language, influenceColors, actionColors])

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
