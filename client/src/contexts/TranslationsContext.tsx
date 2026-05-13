import { createContext, ReactNode, useContext } from 'react'
import { Actions, Influences, PublicGameState, AvailableLanguageCode } from '@shared'
import { Translations } from '../i18n/translations'

type PlayerVariables = {
  primaryPlayer: string | undefined
  secondaryPlayer: string | undefined
}

type InfluenceVariables = {
  primaryInfluence: Influences | undefined
  secondaryInfluence: Influences | undefined
}

type TextVariables = Record<string, string | number>

export type TranslationVariables = PlayerVariables & InfluenceVariables & {
  gameState: PublicGameState | undefined
  count: number | undefined
  action: Actions | undefined
  textVars: TextVariables | undefined
}

type TranslationContextType = {
  t: (key: keyof Translations, variables?: Partial<TranslationVariables>) => ReactNode
  language: AvailableLanguageCode
  setLanguage: (key: AvailableLanguageCode) => void
}

export const TranslationContext = createContext<TranslationContextType>({
  t: () => null,
  language: AvailableLanguageCode['en-US'],
  setLanguage: () => { },
})

export const useTranslationContext = () => useContext(TranslationContext)
