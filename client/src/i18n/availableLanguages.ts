export enum AvailableLanguageCode {
  "de-DE" = "de-DE",
  "en-US" = "en-US",
  "es-MX" = "es-MX",
  "fr-FR" = "fr-FR",
  "it-IT" = "it-IT",
  "pt-BR" = "pt-BR",
}

export type AvailableLanguage = {
  code: AvailableLanguageCode
  flag: string
  name: string
}

const availableLanguages: AvailableLanguage[] = [
  {
    code: AvailableLanguageCode["de-DE"],
    flag: "🇩🇪",
    name: "Deutsch",
  },
  {
    code: AvailableLanguageCode["en-US"],
    flag: "🇺🇸",
    name: "English",
  },
  {
    code: AvailableLanguageCode["es-MX"],
    flag: "🇲🇽",
    name: "Español",
  },
  {
    code: AvailableLanguageCode["fr-FR"],
    flag: "🇫🇷",
    name: "Français",
  },
  {
    code: AvailableLanguageCode["it-IT"],
    flag: "🇮🇹",
    name: "Italiano",
  },
  {
    code: AvailableLanguageCode["pt-BR"],
    flag: "🇧🇷",
    name: "Português",
  },
]

export default availableLanguages
