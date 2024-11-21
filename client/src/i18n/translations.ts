import { AvailableLanguageCode } from './availableLanguages'

export type Translations = {
  anyone: string
  blockPending: string
  briefDescriptionOfCoup: string
  cheatSheet: string
  collectCoins: string
  createNewGame: string
  fullRules: string
  joinExistingGame: string
  language: string
  none: string
  rules: string
  settings: string
  title: string
  welcomeToCoup: string
}

const translations: { [key in AvailableLanguageCode]: Translations } = {
  'en-US': {
    anyone: 'Anyone',
    blockPending: '{{primaryPlayer}} is trying to block {{secondaryPlayer}} as {{influence}}',
    briefDescriptionOfCoup: 'The game of deception, deduction, and luck.',
    cheatSheet: 'Cheat Sheet',
    collectCoins: 'Collect {{count}} coin{{plural:s}}',
    createNewGame: 'Create New Game',
    fullRules: 'Complete Rules',
    joinExistingGame: 'Join Existing Game',
    language: 'Language',
    none: 'None',
    rules: 'Rules',
    settings: 'Settings',
    title: 'Coup',
    welcomeToCoup: 'Welcome To Coup!'
  },
  'pt-BR': {
    anyone: 'Todos',
    blockPending: '{{primaryPlayer}} está tentando bloquear {{secondaryPlayer}} como {{influence}}',
    briefDescriptionOfCoup: 'O jogo de engano, dedução e sorte.',
    cheatSheet: 'Folha de dicas',
    collectCoins: 'Colete {{count}} moeda{{plural:s}}',
    createNewGame: 'Crie um jogo',
    fullRules: 'Regras completas',
    joinExistingGame: 'Participe de um jogo',
    language: 'Idioma',
    none: 'Nenhum',
    rules: 'Regras',
    settings: 'Configurações',
    title: 'Golpe',
    welcomeToCoup: 'Bem vindo ao Golpe!'
  }
}

export default translations
