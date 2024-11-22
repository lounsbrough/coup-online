import { Actions, EventMessages, Influences, Responses } from '@shared'
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
  [EventMessages.ActionPending]: Partial<ActionMessages>
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
  blockAsInfluence: string
  briefDescriptionOfCoup: string
  cancel: string
  cardCountInDeck: string
  cheatSheet: string
  chooseATarget: string
  chooseAnAction: string
  chooseInfluencesToKeep: string
  chooseInfluenceToLose: string
  chooseInfluenceToReveal: string
  claimAnInfluence: string
  close: string
  collectCoins: string
  confirm: string
  createNewGame: string
  eventLog: string
  fullRules: string
  [Influences.Ambassador]: string
  [Influences.Assassin]: string
  [Influences.Captain]: string
  [Influences.Contessa]: string
  [Influences.Duke]: string
  influenceWasClaimed: string
  joinExistingGame: string
  keepInfluences: string
  language: string
  none: string
  notEnoughCoins: string
  playAgain: string
  playerTurn: string
  playerWantToReset: string
  playerWins: string
  reportBug: string
  requestFeature: string
  resetGame: string
  [Responses.Block]: string
  [Responses.Challenge]: string
  [Responses.Pass]: string
  rules: string
  settings: string
  title: string
  waitingOnOtherPlayers: string
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
      [Actions.Assassinate]: '{{action[[Assassinate]]}} {{secondaryPlayer}}',
      [Actions.Coup]: '{{action[[Coup]]}} {{secondaryPlayer}}',
      [Actions.Exchange]: '{{action[[Exchange]]}} influences',
      [Actions.ForeignAid]: 'Collect {{action[[Foreign Aid]]}}',
      [Actions.Income]: 'Collect {{action[[Income]]}}',
      [Actions.Steal]: '{{action[[Steal]]}} from {{secondaryPlayer}}',
      [Actions.Tax]: 'Collect {{action}}',
    },
    [EventMessages.ActionPending]: {
      [Actions.Assassinate]: '{{primaryPlayer}} is trying to {{action[[Assassinate]]}} {{secondaryPlayer}}',
      [Actions.Exchange]: '{{primaryPlayer}} is trying to {{action[[Exchange]]}} influences',
      [Actions.ForeignAid]: '{{primaryPlayer}} is trying to receive {{action[[Foreign Aid]]}}',
      [Actions.Steal]: '{{primaryPlayer}} is trying to {{action[[Steal]]}} from {{secondaryPlayer}}',
      [Actions.Tax]: '{{primaryPlayer}} is trying to collect {{action[[Tax]]}}',
    },
    [EventMessages.ActionProcessed]: {
      [Actions.Assassinate]: '{{primaryPlayer}} {{action[[Assassinated]]}} {{secondaryPlayer}}',
      [Actions.Coup]: '{{primaryPlayer}} {{action[[Couped]]}} {{secondaryPlayer}}',
      [Actions.Exchange]: '{{primaryPlayer}} {{action[[Exchanged]]}} influences',
      [Actions.ForeignAid]: '{{primaryPlayer}} received {{action[[Foreign Aid]]}}',
      [Actions.Income]: '{{primaryPlayer}} collected {{action[[Income]]}}',
      [Actions.Steal]: '{{primaryPlayer}} {{action[[Stole]]}} from {{secondaryPlayer}}',
      [Actions.Tax]: '{{primaryPlayer}} collected {{action[[Tax]]}}',
    },
    [EventMessages.BlockFailed]: '',
    [EventMessages.BlockPending]: '{{primaryPlayer}} is trying to block {{secondaryPlayer}} as {{primaryInfluence}}',
    [EventMessages.BlockSuccessful]: '',
    [EventMessages.ChallengeFailed]: '',
    [EventMessages.ChallengePending]: '{{primaryPlayer}} is challenging {{secondaryPlayer}}',
    [EventMessages.ChallengeSuccessful]: '',
    [EventMessages.GameStarted]: '',
    [EventMessages.PlayerDied]: '',
    [EventMessages.PlayerLostInfluence]: '',
    [EventMessages.PlayerReplacedInfluence]: '',
    blockAsInfluence: 'Block as {{primaryInfluence}}',
    briefDescriptionOfCoup: 'The game of deception, deduction, and luck.',
    cancel: 'Cancel',
    cardCountInDeck: '{{count}} card{{plural[[s]]}} in the deck',
    cheatSheet: 'Cheat Sheet',
    chooseATarget: 'Choose a Target',
    chooseAnAction: 'Choose an Action',
    chooseInfluencesToKeep: 'Choose {{count}} Influence{{plural[[s]]}} to Keep',
    chooseInfluenceToLose: 'Choose an Influence to Lose',
    chooseInfluenceToReveal: 'Choose an Influence to Reveal',
    claimAnInfluence: 'Claim an influence',
    close: 'Close',
    collectCoins: 'Collect {{count}} coin{{plural[[s]]}}',
    confirm: 'Confirm',
    createNewGame: 'Create New Game',
    eventLog: 'Event Log',
    fullRules: 'Complete Rules',
    [Influences.Ambassador]: 'Ambassador',
    [Influences.Assassin]: 'Assassin',
    [Influences.Captain]: 'Captain',
    [Influences.Contessa]: 'Contessa',
    [Influences.Duke]: 'Duke',
    influenceWasClaimed: '{{primaryInfluence}} was claimed',
    joinExistingGame: 'Join Existing Game',
    keepInfluences: 'Keep {{primaryInfluence}}{{plural[[ and {{secondaryInfluence}}]]}}',
    language: 'Language',
    none: 'None',
    notEnoughCoins: 'Not enough coins',
    playAgain: 'Play Again',
    playerTurn: '{{primaryPlayer}}\'s Turn',
    playerWantToReset: '{{primaryPlayer}} wants to reset the game',
    playerWins: '{{primaryPlayer}} Wins!',
    reportBug: 'Report Bug',
    requestFeature: 'Request Feature',
    resetGame: 'Reset Game',
    [Responses.Block]: 'Block',
    [Responses.Challenge]: 'Challenge',
    [Responses.Pass]: 'Pass',
    rules: 'Rules',
    settings: 'Settings',
    title: 'Coup',
    waitingOnOtherPlayers: 'Waiting on Other Players',
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
      [Actions.Assassinate]: '{{action[[Assassinar]]}} {{secondaryPlayer}}',
      [Actions.Coup]: '{{action[[Golpear]]}} {{secondaryPlayer}}',
      [Actions.Exchange]: '{{action[[Trocar]]}} influências',
      [Actions.ForeignAid]: 'Receber {{action[[ajuda externa]]}}',
      [Actions.Income]: 'Coleter {{action[[renda]]}}',
      [Actions.Steal]: '{{action[[Roubar]]}} de {{secondaryPlayer}}',
      [Actions.Tax]: 'Cobrar {{action[[imposto]]}}',
    },
    [EventMessages.ActionPending]: {
      [Actions.Assassinate]: '{{primaryPlayer}} está tentando {{action[[assassinar]]}} {{secondaryPlayer}}',
      [Actions.Exchange]: '{{primaryPlayer}} está tentando {{action[[trocar]]}} influências',
      [Actions.ForeignAid]: '{{primaryPlayer}} está tentando receber {{action[[ajuda externa]]}}',
      [Actions.Steal]: '{{primaryPlayer}} está tentando {{action[[Roubar]]}} de {{secondaryPlayer}}',
      [Actions.Tax]: '{{primaryPlayer}} está tentando cobrar {{action}}',
    },
    [EventMessages.ActionProcessed]: {
      [Actions.Assassinate]: '{{primaryPlayer}} {{action[[Assassinou]]}} {{secondaryPlayer}}',
      [Actions.Coup]: '{{primaryPlayer}} {{action[[golpeou]]}} {{secondaryPlayer}}',
      [Actions.Exchange]: '{{primaryPlayer}} {{action[[trocou]]}} influências',
      [Actions.ForeignAid]: '{{primaryPlayer}} recebeu {{action[[ajuda externa]]}}',
      [Actions.Income]: '{{primaryPlayer}} coletou {{action[[renda]]}}',
      [Actions.Steal]: '{{primaryPlayer}} {{action[[roubou]]}} de {{secondaryPlayer}}',
      [Actions.Tax]: '{{primaryPlayer}} coubrou {{action[[imposto]]}}',
    },
    [EventMessages.BlockFailed]: '',
    [EventMessages.BlockPending]: '{{primaryPlayer}} está tentando bloquear {{secondaryPlayer}} como {{primaryInfluence}}',
    [EventMessages.BlockSuccessful]: '',
    [EventMessages.ChallengeFailed]: '',
    [EventMessages.ChallengePending]: '{{primaryPlayer}} está desafiando {{secondaryPlayer}}',
    [EventMessages.ChallengeSuccessful]: '',
    [EventMessages.GameStarted]: '',
    [EventMessages.PlayerDied]: '',
    [EventMessages.PlayerLostInfluence]: '',
    [EventMessages.PlayerReplacedInfluence]: '',
    blockAsInfluence: 'Bloquear como {{primaryInfluence}}',
    briefDescriptionOfCoup: 'O jogo de engano, dedução e sorte.',
    cancel: 'Cancelar',
    cardCountInDeck: '{{count}} carta{{plural[[s]]}} no baralho',
    cheatSheet: 'Folha de dicas',
    chooseATarget: 'Escolha um alvo',
    chooseAnAction: 'Escolha uma ação',
    chooseInfluencesToKeep: 'Escolha {{count}} influência{{plural[[s]]}} para manter',
    chooseInfluenceToLose: 'Escolha uma influência para perder',
    chooseInfluenceToReveal: 'Escolha uma influência para revelar',
    claimAnInfluence: 'Declare uma influência',
    close: 'Fechar',
    collectCoins: 'Colete {{count}} moeda{{plural[[s]]}}',
    confirm: 'Confirmar',
    createNewGame: 'Crie um jogo',
    eventLog: 'Registro de eventos',
    fullRules: 'Regras completas',
    [Influences.Ambassador]: 'Embaixador',
    [Influences.Assassin]: 'Assassino',
    [Influences.Captain]: 'Capitão',
    [Influences.Contessa]: 'Contessa',
    [Influences.Duke]: 'Duque',
    influenceWasClaimed: '{{primaryInfluence}} foi declarado',
    joinExistingGame: 'Participe de um jogo',
    keepInfluences: 'Manter {{primaryInfluence}}{{plural[[ e {{secondaryInfluence}}]]}}',
    language: 'Idioma',
    none: 'Nenhum',
    notEnoughCoins: 'Moedas insuficientes',
    playAgain: 'Jogar novamente',
    playerTurn: 'A vez de {{primaryPlayer}}',
    playerWantToReset: '{{primaryPlayer}} quer reiniciar o jogo',
    playerWins: '{{primaryPlayer}} vence!',
    reportBug: 'Reportar bug',
    requestFeature: 'Solicitar recurso',
    resetGame: 'Reiniciar jogo',
    [Responses.Block]: 'Bloquear',
    [Responses.Challenge]: 'Desafiar',
    [Responses.Pass]: 'Passar',
    rules: 'Regras',
    settings: 'Configurações',
    title: 'Golpe',
    waitingOnOtherPlayers: 'Esperando por outros jogadores',
    welcomeToCoup: 'Bem vindo ao Golpe!'
  }
}

export default translations
