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
  challenge: string
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
  contents: string
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
  goal: string
  honesty: string
  influence: string
  influences: string
  [Influences.Ambassador]: string
  [Influences.Assassin]: string
  [Influences.Captain]: string
  [Influences.Contessa]: string
  [Influences.Duke]: string
  influenceWasClaimed: string
  inviteLinkCopied: string
  joinExistingGame: string
  joinGame: string
  keepInfluences: string
  killAnInfluence: string
  language: string
  light: string
  loseInfluence: string
  losingAChallenge: string
  losingInfluence: string
  none: string
  notEnoughCoins: string
  numberOfPlayers: string
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
  rulesBlock: string
  rulesChallenge: string
  rulesLosingAChallenge: string
  rulesLosingInfluence: string
  settings: string
  setup: string
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
    challenge: 'Challenge',
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
    contents: 'Contents',
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
    goal: 'Goal',
    honesty: 'Honesty',
    influence: 'Influence',
    influences: 'Influences',
    [Influences.Ambassador]: 'Ambassador',
    [Influences.Assassin]: 'Assassin',
    [Influences.Captain]: 'Captain',
    [Influences.Contessa]: 'Contessa',
    [Influences.Duke]: 'Duke',
    influenceWasClaimed: '{{primaryInfluence}} was claimed',
    inviteLinkCopied: 'Invite Link Copied',
    joinExistingGame: 'Join Existing Game',
    joinGame: 'Join Game',
    keepInfluences: 'Keep {{primaryInfluence}}{{plural[[ and {{secondaryInfluence}}]]}}',
    killAnInfluence: 'Kill an influence',
    language: 'Language',
    light: 'Light',
    loseInfluence: 'Lose {{primaryInfluence}}',
    losingAChallenge: 'Losing a Challenge',
    losingInfluence: 'Losing Influence',
    none: 'None',
    notEnoughCoins: 'Not enough coins',
    numberOfPlayers: 'Number of Players',
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
    rulesBlock: 'If another player takes an action that can be Blocked, the targeted player, or anyone in the case of Foreign Aid, may Block it by claiming to have the proper character on one of their Influence cards. The acting player cannot perform the action and takes no other action this turn. Any player may choose to Challenge the Blocking player. If they win the Challenge, the action goes through as normal.',
    rulesChallenge: 'When the acting player declares their action, any other player may Challenge their right to take the action. They are saying "I don\'t believe you have the proper character to do that." The acting player now must prove they have the power to take the action or lose the Challenge. If they have the right character, they reveal it and place the revealed card back in the deck. They then shuffle the deck and draw a new card. The Challenging player has lost the Challenge. If they do not have the proper character, they lose the Challenge.',
    rulesLosingAChallenge: 'Any player who loses a Challenge must turn one of their Influence cards face up for all to see. If that is their last Influence card, they are out of the game.',
    rulesLosingInfluence: 'Any time a player loses an Influence card, they choose which of their cards to reveal.',
    settings: 'Settings',
    setup: 'Setup',
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
    challenge: 'Desafio',
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
    contents: 'Conteúdo',
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
    goal: 'Meta',
    honesty: 'Honestidade',
    influence: 'Influência',
    influences: 'Influências',
    [Influences.Ambassador]: 'Embaixador',
    [Influences.Assassin]: 'Assassino',
    [Influences.Captain]: 'Capitão',
    [Influences.Contessa]: 'Contessa',
    [Influences.Duke]: 'Duque',
    influenceWasClaimed: '{{primaryInfluence}} foi declarado',
    inviteLinkCopied: 'Link de convite copiado',
    joinExistingGame: 'Participe de um jogo',
    joinGame: 'Entre no jogo',
    keepInfluences: 'Manter {{primaryInfluence}}{{plural[[ e {{secondaryInfluence}}]]}}',
    killAnInfluence: 'Mate uma influência',
    language: 'Idioma',
    light: 'Claro',
    loseInfluence: 'Perder {{primaryInfluence}}',
    losingAChallenge: 'Perdendo um desafio',
    losingInfluence: 'Perdendo influência',
    none: 'Nenhum',
    notEnoughCoins: 'Moedas insuficientes',
    numberOfPlayers: 'Número de jogadores',
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
    rulesBlock: 'Se outro jogador realizar uma ação que possa ser Bloqueada, o jogador alvo, ou qualquer pessoa no caso de Ajuda Externa, poderá Bloqueá-la alegando ter o personagem adequado em uma de suas cartas de Influência. O jogador agente não pode realizar a ação e não realiza nenhuma outra ação neste turno. Qualquer jogador pode escolher desafiar o jogador bloqueador. Se vencerem o Desafio, a ação prosseguirá normalmente.',
    rulesChallenge: 'Quando o jogador agente declara sua ação, qualquer outro jogador pode contestar seu direito de realizar a ação. Eles estão dizendo: “Não acredito que você tenha o caráter adequado para fazer isso”. O jogador atuante agora deve provar que tem o poder de realizar a ação ou perderá o Desafio. Se tiverem o personagem certo, eles o revelam e colocam a carta revelada de volta no baralho. Eles então embaralham o baralho e compram uma nova carta. O jogador Desafiador perdeu o Desafio. Se não tiverem o caráter adequado, perdem o Desafio.',
    rulesLosingAChallenge: 'Qualquer jogador que perder um Desafio deve virar uma de suas cartas de Influência para que todos possam ver. Se esta for a última carta de Influência, eles estão fora do jogo.',
    rulesLosingInfluence: 'Sempre que um jogador perde uma carta de Influência, ele escolhe qual das suas cartas revelar.',
    settings: 'Configurações',
    setup: 'Configurar',
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
