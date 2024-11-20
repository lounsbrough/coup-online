import { AvailableLanguageCode } from './availableLanguages'

export type Translations = {
  title: string
}

const translations: { [key in AvailableLanguageCode]: Translations } = {
  'en-US': {
    title: 'Coup'
  },
  'pt-BR': {
    title: 'Golpe'
  }
}

export default translations
