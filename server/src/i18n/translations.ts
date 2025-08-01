import { AvailableLanguageCode } from '../../../shared/i18n/availableLanguages'

type TranslationsForString = { [key in AvailableLanguageCode]: string }

type Translations = {
  roomNotFound: TranslationsForString;
}

type Variables = {
  count?: number
}

export const translate = ({ key, language, variables }: {
  key: keyof Translations,
  language: AvailableLanguageCode,
  variables?: Variables
}): string => {
  const translations: Translations = {
    roomNotFound: {
      'de-DE': "Raum nicht gefunden",
      'en-US': "Room not found",
      'es-MX': "Sala no encontrada",
      'fr-FR': "Chambre non trouvée",
      'it-IT': "Stanza non trovata",
      'pt-BR': "Sala não encontrada"
    },
  }

  let template = translations[key][language]

  if (!variables) return template

  if (variables.count !== undefined) {
    template = template.replaceAll('{{count}}', variables.count.toString())
    const pluralRegex = /\{\{plural\[\[(.+?)\]\]\}\}/g
    template = template.replaceAll(pluralRegex, (replaceMatch) => {
      const plural = replaceMatch.matchAll(pluralRegex).next().value?.[1]
      return (variables.count !== 1 && plural) || ''
    })
  }

  return template
}
