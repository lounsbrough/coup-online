import { AvailableLanguageCode } from './availableLanguages'

export type Translations = {
  briefDescriptionOfCoup: string
  cheatSheet: string
  createNewGame: string
  fullRules: string
  joinExistingGame: string
  language: string
  rules: string
  settings: string
  title: string
  welcomeToCoup: string
}

const translations: { [key in AvailableLanguageCode]: Translations } = {
  'en-US': {
    briefDescriptionOfCoup: 'The game of deception, deduction, and luck.',
    cheatSheet: 'Cheat Sheet',
    createNewGame: 'Create New Game',
    fullRules: 'Complete Rules',
    joinExistingGame: 'Join Existing Game',
    language: 'Language',
    rules: 'Rules',
    settings: 'Settings',
    title: 'Coup',
    welcomeToCoup: 'Welcome To Coup!'
  },
  'pt-BR': {
    briefDescriptionOfCoup: 'O jogo de engano, dedução e sorte.',
    cheatSheet: 'Folha de dicas',
    createNewGame: 'Crie um jogo',
    fullRules: 'Regras completas',
    joinExistingGame: 'Participe de um jogo',
    language: 'Idioma',
    rules: 'Regras',
    settings: 'Configurações',
    title: 'Golpe',
    welcomeToCoup: 'Bem vindo ao Golpe!'
  }
}

export default translations
