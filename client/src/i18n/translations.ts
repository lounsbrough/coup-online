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
  action: string
  add: string
  addAiPlayer: string
  addPlayersToStartGame: string
  anyone: string
  block: string
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
  colorMode: string
  confirm: string
  confirmActions: string
  copyInviteLink: string
  createGame: string
  createNewGame: string
  draw2InfluencesAndDiscard2: string
  dark: string
  effect: string
  eventLog: string
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
  fullRules: string
  honesty: string
  influence: string
  [Influences.Ambassador]: string
  [Influences.Assassin]: string
  [Influences.Captain]: string
  [Influences.Contessa]: string
  [Influences.Duke]: string
  influenceWasClaimed: string
  inviteLinkCopied: string
  joinExistingGame: string
  keepInfluences: string
  killAnInfluence: string
  language: string
  light: string
  loseInfluence: string
  none: string
  notEnoughCoins: string
  payCoins: string
  playAgain: string
  playerTurn: string
  playerWantToReset: string
  playerWins: string
  random: string
  reportBug: string
  requestFeature: string
  resetGame: string
  [Responses.Block]: string
  [Responses.Challenge]: string
  [Responses.Pass]: string
  room: string
  rules: string
  settings: string
  skepticism: string
  startGame: string
  startingPlayerBeginsWith1Coin: string
  steal2CoinsFromSomeone: string
  system: string
  title: string
  vengefulness: string
  waitingOnOtherPlayers: string
  websocketsConnection: string
  welcomeToCoup: string
  whatIsYourName: string
  whatIsBotsName: string
}

const translations: { [key in AvailableLanguageCode]: Translations } = {
  'en-US': {
    action: 'Action',
    [Actions.Assassinate]: 'Assassinate',
    [Actions.Coup]: 'Coup',
    [Actions.Exchange]: 'Exchange',
    [Actions.ForeignAid]: 'Foreign Aid',
    [Actions.Income]: 'Income',
    [Actions.Steal]: 'Steal',
    [Actions.Tax]: 'Tax',
    add: 'Add',
    addAiPlayer: 'Add AI Player',
    addPlayersToStartGame: 'Add at least one more player to start game',
    anyone: 'Anyone',
    block: 'Block',
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
    colorMode: 'Color Mode',
    confirm: 'Confirm',
    confirmActions: 'Confirm Actions',
    copyInviteLink: 'Copy Invite Link',
    createGame: 'Create Game',
    createNewGame: 'Create New Game',
    dark: 'Dark',
    draw2InfluencesAndDiscard2: 'Draw 2 influences & Discard 2',
    effect: 'Effect',
    eventLog: 'Event Log',
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
    [EventMessages.BlockFailed]: '{{primaryPlayer}} failed to block {{secondaryPlayer}}',
    [EventMessages.BlockPending]: '{{primaryPlayer}} is trying to block {{secondaryPlayer}} as {{primaryInfluence}}',
    [EventMessages.BlockSuccessful]: '{{primaryPlayer}} successfully blocked {{secondaryPlayer}}',
    [EventMessages.ChallengeFailed]: '{{primaryPlayer}} failed to challenge {{secondaryPlayer}}',
    [EventMessages.ChallengePending]: '{{primaryPlayer}} is challenging {{secondaryPlayer}}',
    [EventMessages.ChallengeSuccessful]: '{{primaryPlayer}} succesfully challenged {{secondaryPlayer}}',
    [EventMessages.GameStarted]: 'Game has started',
    [EventMessages.PlayerDied]: '{{primaryPlayer}} is out!',
    [EventMessages.PlayerLostInfluence]: '{{primaryPlayer}} lost their {{primaryInfluence}}',
    [EventMessages.PlayerReplacedInfluence]: '{{primaryPlayer}} revealed and replaced {{primaryInfluence}}',
    fullRules: 'Complete Rules',
    honesty: 'Honesty',
    influence: 'Influence',
    [Influences.Ambassador]: 'Ambassador',
    [Influences.Assassin]: 'Assassin',
    [Influences.Captain]: 'Captain',
    [Influences.Contessa]: 'Contessa',
    [Influences.Duke]: 'Duke',
    influenceWasClaimed: '{{primaryInfluence}} was claimed',
    inviteLinkCopied: 'Invite Link Copied',
    joinExistingGame: 'Join Existing Game',
    keepInfluences: 'Keep {{primaryInfluence}}{{plural[[ and {{secondaryInfluence}}]]}}',
    killAnInfluence: 'Kill an influence',
    language: 'Language',
    light: 'Light',
    loseInfluence: 'Lose {{primaryInfluence}}',
    none: 'None',
    notEnoughCoins: 'Not enough coins',
    payCoins: 'Pay {{count}} coin{{plural[[s]]}}',
    playAgain: 'Play Again',
    playerTurn: '{{primaryPlayer}}\'s Turn',
    playerWantToReset: '{{primaryPlayer}} wants to reset the game',
    playerWins: '{{primaryPlayer}} Wins!',
    random: 'Random',
    reportBug: 'Report Bug',
    requestFeature: 'Request Feature',
    resetGame: 'Reset Game',
    [Responses.Block]: 'Block',
    [Responses.Challenge]: 'Challenge',
    [Responses.Pass]: 'Pass',
    room: 'Room',
    rules: 'Rules',
    settings: 'Settings',
    skepticism: 'Skepticism',
    startGame: 'Start Game',
    startingPlayerBeginsWith1Coin: '2 player game, starting player will begin with 1 coin',
    steal2CoinsFromSomeone: 'Steal 2 coins from someone',
    system: 'System',
    title: 'Coup',
    vengefulness: 'Vengefulness',
    waitingOnOtherPlayers: 'Waiting on Other Players',
    websocketsConnection: 'WebSockets Connection',
    welcomeToCoup: 'Welcome To Coup!',
    whatIsYourName: 'What is your name?',
    whatIsBotsName: 'What is its name?'
  },
  'pt-BR': {
    action: 'Ação',
    [Actions.Assassinate]: 'Assassinar',
    [Actions.Coup]: 'Golpe',
    [Actions.Exchange]: 'Trocar',
    [Actions.ForeignAid]: 'Ajuda Externa',
    [Actions.Income]: 'Renda',
    [Actions.Steal]: 'Roubar',
    [Actions.Tax]: 'Imposto',
    add: 'Adicionar',
    addAiPlayer: 'Adicionar jogador AI',
    addPlayersToStartGame: 'Adicione pelo menos mais um jogador para iniciar o jogo',
    anyone: 'Todos',
    block: 'Bloque',
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
    colorMode: 'Modo de cor',
    confirm: 'Confirmar',
    confirmActions: 'Confirmar ações',
    copyInviteLink: 'Copiar link de convite',
    createGame: 'Crie jogo',
    createNewGame: 'Crie um jogo',
    draw2InfluencesAndDiscard2: 'Ganhe 2 influências e descarte 2',
    dark: 'Escuro',
    effect: 'Efeito',
    eventLog: 'Registro de eventos',
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
      [Actions.Tax]: '{{primaryPlayer}} está tentando cobrar {{action[[imposto]]}}',
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
    [EventMessages.BlockFailed]: '{{primaryPlayer}} não conseguiu bloquear {{secondaryPlayer}}',
    [EventMessages.BlockPending]: '{{primaryPlayer}} está tentando bloquear {{secondaryPlayer}} como {{primaryInfluence}}',
    [EventMessages.BlockSuccessful]: '{{primaryPlayer}} bloqueou {{secondaryPlayer}} com sucesso',
    [EventMessages.ChallengeFailed]: '{{primaryPlayer}} não conseguiu desafiar {{secondaryPlayer}}',
    [EventMessages.ChallengePending]: '{{primaryPlayer}} está desafiando {{secondaryPlayer}}',
    [EventMessages.ChallengeSuccessful]: '{{primaryPlayer}} desafiou {{secondaryPlayer}} com sucesso',
    [EventMessages.GameStarted]: 'O jogo começou',
    [EventMessages.PlayerDied]: '{{primaryPlayer}} está fora!',
    [EventMessages.PlayerLostInfluence]: '{{primaryPlayer}} perdeu seu {{primaryInfluence}}',
    [EventMessages.PlayerReplacedInfluence]: '{{primaryPlayer}} revelou e substituiu {{primaryInfluence}}',
    fullRules: 'Regras completas',
    honesty: 'Honestidade',
    influence: 'Influência',
    [Influences.Ambassador]: 'Embaixador',
    [Influences.Assassin]: 'Assassino',
    [Influences.Captain]: 'Capitão',
    [Influences.Contessa]: 'Contessa',
    [Influences.Duke]: 'Duque',
    influenceWasClaimed: '{{primaryInfluence}} foi declarado',
    inviteLinkCopied: 'Link de convite copiado',
    joinExistingGame: 'Participe de um jogo',
    keepInfluences: 'Manter {{primaryInfluence}}{{plural[[ e {{secondaryInfluence}}]]}}',
    killAnInfluence: 'Mate uma influência',
    language: 'Idioma',
    light: 'Claro',
    loseInfluence: 'Perder {{primaryInfluence}}',
    none: 'Nenhum',
    notEnoughCoins: 'Moedas insuficientes',
    payCoins: 'Pague {{count}} moeda{{plural[[s]]}}',
    playAgain: 'Jogar novamente',
    playerTurn: 'A vez de {{primaryPlayer}}',
    playerWantToReset: '{{primaryPlayer}} quer reiniciar o jogo',
    playerWins: '{{primaryPlayer}} vence!',
    random: 'Aleatório',
    reportBug: 'Reportar bug',
    requestFeature: 'Solicitar recurso',
    resetGame: 'Reiniciar jogo',
    [Responses.Block]: 'Bloquear',
    [Responses.Challenge]: 'Desafiar',
    [Responses.Pass]: 'Passar',
    room: 'Sala',
    rules: 'Regras',
    settings: 'Configurações',
    skepticism: 'Ceticismo',
    startGame: 'Iniciar jogo',
    startingPlayerBeginsWith1Coin: '2 jogadores, o jogador inicial começará com 1 moeda',
    steal2CoinsFromSomeone: 'Rouba 2 moedas de alguém',
    system: 'Sistema',
    title: 'Golpe',
    vengefulness: 'Vingança',
    waitingOnOtherPlayers: 'Esperando por outros jogadores',
    websocketsConnection: 'Conexão WebSockets',
    welcomeToCoup: 'Bem vindo ao Golpe!',
    whatIsYourName: 'Qual o seu nome?',
    whatIsBotsName: 'Qual é seu nome?'
  }
}

export default translations
