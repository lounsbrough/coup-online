import { Actions, EventMessages, Influences } from '@shared'
import { AvailableLanguageCode } from './availableLanguages'

type ActionMessages = {
  [Actions.Assassinate]: string
  [Actions.Coup]: string
  [Actions.Exchange]: string
  [Actions.ForeignAid]: string
  [Actions.Income]: string
  [Actions.Steal]: string
  [Actions.Tax]: string
}

export type Translations = ActionMessages & {
  anyone: string
  [EventMessages.ActionConfirm]: ActionMessages
  [EventMessages.ActionPending]: ActionMessages
  [EventMessages.ActionProcessed]: ActionMessages
  [EventMessages.BlockFailed]: string
  [EventMessages.BlockPending]: string
  [EventMessages.BlockSuccessful]: string
  [EventMessages.ChallengeFailed]: string
  [EventMessages.ChallengePending]: string
  [EventMessages.ChallengeSuccessful]: string
  [EventMessages.GameStarted]: string
  [EventMessages.PlayerDied]: string
  [EventMessages.PlayerLostInfluence]: string
  [EventMessages.PlayerReplacedInfluence]: string
  briefDescriptionOfCoup: string
  cheatSheet: string
  collectCoins: string
  createNewGame: string
  fullRules: string
  [Influences.Ambassador]: string
  [Influences.Assassin]: string
  [Influences.Captain]: string
  [Influences.Contessa]: string
  [Influences.Duke]: string
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
    [Actions.Assassinate]: 'Assassinate',
    [Actions.Coup]: 'Coup',
    [Actions.Exchange]: 'Exchange',
    [Actions.ForeignAid]: 'Foreign Aid',
    [Actions.Income]: 'Income',
    [Actions.Steal]: 'Steal',
    [Actions.Tax]: 'Tax',
    anyone: 'Anyone',
    [EventMessages.ActionConfirm]: {
      [Actions.Assassinate]: '{{primaryPlayer}} está tentando {{action:Assassinar}} {{secondaryPlayer}}',
      [Actions.Coup]: '',
      [Actions.Exchange]: '',
      [Actions.ForeignAid]: '',
      [Actions.Income]: '',
      [Actions.Steal]: '{{action:Steal}} from {{secondaryPlayer}}',
      [Actions.Tax]: 'Collect {{action}}',
    },
    [EventMessages.ActionPending]: {
      [Actions.Assassinate]: '{{primaryPlayer}} is trying to {{action}} {{secondaryPlayer}}',
      [Actions.Coup]: '',
      [Actions.Exchange]: '',
      [Actions.ForeignAid]: '',
      [Actions.Income]: '',
      [Actions.Steal]: '',
      [Actions.Tax]: '{{primaryPlayer}} is trying to collect {{action}}',
    },
    [EventMessages.ActionProcessed]: {
      [Actions.Assassinate]: '{{primaryPlayer}} {{action:Assassinated}} {{secondaryPlayer}}',
      [Actions.Coup]: '',
      [Actions.Exchange]: '',
      [Actions.ForeignAid]: '',
      [Actions.Income]: '',
      [Actions.Steal]: '',
      [Actions.Tax]: '',
    },
    [EventMessages.BlockFailed]: '',
    [EventMessages.BlockPending]: '{{primaryPlayer}} is trying to block {{secondaryPlayer}} as {{influence}}',
    [EventMessages.BlockSuccessful]: '',
    [EventMessages.ChallengeFailed]: '',
    [EventMessages.ChallengePending]: '{{primaryPlayer}} is challenging {{secondaryPlayer}}',
    [EventMessages.ChallengeSuccessful]: '',
    [EventMessages.GameStarted]: '',
    [EventMessages.PlayerDied]: '',
    [EventMessages.PlayerLostInfluence]: '',
    [EventMessages.PlayerReplacedInfluence]: '',
    briefDescriptionOfCoup: 'The game of deception, deduction, and luck.',
    cheatSheet: 'Cheat Sheet',
    collectCoins: 'Collect {{count}} coin{{plural:s}}',
    createNewGame: 'Create New Game',
    fullRules: 'Complete Rules',
    joinExistingGame: 'Join Existing Game',
    [Influences.Ambassador]: 'Ambassador',
    [Influences.Assassin]: 'Assassin',
    [Influences.Captain]: 'Captain',
    [Influences.Contessa]: 'Contessa',
    [Influences.Duke]: 'Duke',
    language: 'Language',
    none: 'None',
    rules: 'Rules',
    settings: 'Settings',
    title: 'Coup',
    welcomeToCoup: 'Welcome To Coup!'
  },
  'pt-BR': {
    [Actions.Assassinate]: 'Assassino',
    [Actions.Coup]: 'Golpe',
    [Actions.Exchange]: 'Troca',
    [Actions.ForeignAid]: 'Ajuda Externa',
    [Actions.Income]: 'Renda',
    [Actions.Steal]: 'Roubo',
    [Actions.Tax]: 'Imposto',
    anyone: 'Todos',
    [EventMessages.ActionConfirm]: {
      [Actions.Assassinate]: '{{primaryPlayer}} está tentando {{action:Assassinar}} {{secondaryPlayer}}',
      [Actions.Coup]: '',
      [Actions.Exchange]: '',
      [Actions.ForeignAid]: '',
      [Actions.Income]: '',
      [Actions.Steal]: '{{action:Roubar}} de {{secondaryPlayer}}',
      [Actions.Tax]: 'Coleter {{action}}',
    },
    [EventMessages.ActionPending]: {
      [Actions.Assassinate]: '{{primaryPlayer}} está tentando {{action:Assassinar}} {{secondaryPlayer}}',
      [Actions.Coup]: '',
      [Actions.Exchange]: '',
      [Actions.ForeignAid]: '',
      [Actions.Income]: '',
      [Actions.Steal]: '{{primaryPlayer}} está tentando {{action:Roubar}} de {{secondaryPlayer}}',
      [Actions.Tax]: '{{primaryPlayer}} está tentando coleter {{action}}',
    },
    [EventMessages.ActionProcessed]: {
      [Actions.Assassinate]: '{{primaryPlayer}} {{action:Assassinou}} {{secondaryPlayer}}',
      [Actions.Coup]: '',
      [Actions.Exchange]: '',
      [Actions.ForeignAid]: '',
      [Actions.Income]: '{{primaryPlayer}} coletou {{action}}',
      [Actions.Steal]: '',
      [Actions.Tax]: '',
    },
    [EventMessages.BlockFailed]: '',
    [EventMessages.BlockPending]: '{{primaryPlayer}} está tentando bloquear {{secondaryPlayer}} como {{influence}}',
    [EventMessages.BlockSuccessful]: '',
    [EventMessages.ChallengeFailed]: '',
    [EventMessages.ChallengePending]: '{{primaryPlayer}} está desafiando {{secondaryPlayer}}',
    [EventMessages.ChallengeSuccessful]: '',
    [EventMessages.GameStarted]: '',
    [EventMessages.PlayerDied]: '',
    [EventMessages.PlayerLostInfluence]: '',
    [EventMessages.PlayerReplacedInfluence]: '',
    briefDescriptionOfCoup: 'O jogo de engano, dedução e sorte.',
    cheatSheet: 'Folha de dicas',
    collectCoins: 'Colete {{count}} moeda{{plural:s}}',
    createNewGame: 'Crie um jogo',
    fullRules: 'Regras completas',
    joinExistingGame: 'Participe de um jogo',
    [Influences.Ambassador]: 'Embaixador',
    [Influences.Assassin]: 'Assassino',
    [Influences.Captain]: 'Capitão',
    [Influences.Contessa]: 'Contessa',
    [Influences.Duke]: 'Duque',
    language: 'Idioma',
    none: 'Nenhum',
    rules: 'Regras',
    settings: 'Configurações',
    title: 'Golpe',
    welcomeToCoup: 'Bem vindo ao Golpe!'
  }
}

export default translations
