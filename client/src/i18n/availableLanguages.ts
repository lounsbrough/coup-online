export enum AvailableLanguageCode {
  'en-US' = 'en-US',
  'pt-BR' = 'pt-BR'
}

export type AvailableLanguage = {
  code: AvailableLanguageCode
  flag: string
  name: string
}

const availableLanguages: AvailableLanguage[] = [
  {
    code: AvailableLanguageCode["en-US"],
    flag: '🇺🇸',
    name: 'United States'
  },
  {
    code: AvailableLanguageCode["pt-BR"],
    flag: '🇧🇷',
    name: 'Brazil'
  }
]

export default availableLanguages
