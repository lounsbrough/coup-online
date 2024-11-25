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
    name: 'English'
  },
  {
    code: AvailableLanguageCode["pt-BR"],
    flag: '🇧🇷',
    name: 'Português'
  }
]

export default availableLanguages
