import { AvailableLanguageCode } from '@shared/dist'
import translations from '../i18n/translations'

const isNovember = new Date().getMonth() === 10
const isDecember = new Date().getMonth() === 11

export const getBackgroundImage = () => {
  if (isNovember) return 'url(/turkeys.jpeg)'
  if (isDecember) return 'url(/snowmen.jpeg)'
  return 'url(/chickens.jpeg)'
}

export const getShowImageLabel = (language: AvailableLanguageCode) => {
  if (isNovember) return `${translations.showTurkeys[language]} 🦃`
  if (isDecember) return `${translations.showSnowmen[language]} ⛄️`
  return `${translations.showChickens[language]} 🐓`
}
