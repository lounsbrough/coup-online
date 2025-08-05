import { AvailableLanguageCode } from '../../../shared/i18n/availableLanguages'

type TranslationsForString = { [key in AvailableLanguageCode]: string }

type Translations = {
  roomIsFull: TranslationsForString;
  roomNotFound: TranslationsForString;
  joinAsPlayerName: TranslationsForString;
  unableToFindItem: TranslationsForString;
}

type Variables = {
  count?: number
} & {
  [key: string]: string
}

export const translate = ({ key, language, variables }: {
  key: keyof Translations,
  language: AvailableLanguageCode,
  variables?: Variables
}): string => {
  const translations: Translations = {
    roomIsFull: {
      'de-DE': 'Der Raum {{roomId}} ist voll',
      'en-US': 'Room {{roomId}} is full',
      'es-MX': 'La sala {{roomId}} está llena',
      'fr-FR': 'La chambre {{roomId}} est pleine',
      'it-IT': 'La stanza {{roomId}} è piena',
      'pt-BR': 'A sala {{roomId}} está cheia'
    },
    roomNotFound: {
      'de-DE': "Raum nicht gefunden",
      'en-US': "Room not found",
      'es-MX': "Sala no encontrada",
      'fr-FR': "Chambre non trouvée",
      'it-IT': "Stanza non trovata",
      'pt-BR': "Sala não encontrada"
    },
    joinAsPlayerName: {
      'de-DE': 'Du kannst dem Spiel als "{{playerName}}" beitreten',
      'en-US': 'You can join the game as "{{playerName}}"',
      'es-MX': 'Puedes unirte al juego como "{{playerName}}"',
      'fr-FR': 'Vous pouvez rejoindre le jeu en tant que "{{playerName}}"',
      'it-IT': 'Puoi unirti al gioco come "{{playerName}}"',
      'pt-BR': 'Você pode entrar no jogo como "{{playerName}}"'
    },
    unableToFindItem: {
      'de-DE': 'Element {{item}} nicht gefunden',
      'en-US': 'Unable to find {{item}}',
      'es-MX': 'No se pudo encontrar {{item}}',
      'fr-FR': 'Impossible de trouver {{item}}',
      'it-IT': 'Impossibile trovare {{item}}',
      'pt-BR': 'Não foi possível encontrar {{item}}'
    }
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
  delete variables.count

  Object.entries(variables).forEach(([key, value]) => {
    template = template.replaceAll(`{{${key}}}`, value.toString())
  })

  return template
}
