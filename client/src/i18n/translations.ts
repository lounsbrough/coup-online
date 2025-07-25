import { Actions, EventMessages, Influences, Responses } from "@shared"
import { AvailableLanguageCode } from "./availableLanguages"

type TranslationsForString = { [key in AvailableLanguageCode]: string }

type ActionMessages = {
  [Actions.Assassinate]: TranslationsForString;
  [Actions.Coup]: TranslationsForString;
  [Actions.Exchange]: TranslationsForString;
  [Actions.ForeignAid]: TranslationsForString;
  [Actions.Income]: TranslationsForString;
  [Actions.Revive]: TranslationsForString;
  [Actions.Steal]: TranslationsForString;
  [Actions.Tax]: TranslationsForString;
}

export type Translations = ActionMessages & {
  action: TranslationsForString;
  actions: TranslationsForString;
  add: TranslationsForString;
  addAiPlayer: TranslationsForString;
  addPlayersToStartGame: TranslationsForString;
  allowRevive: TranslationsForString;
  anyone: TranslationsForString;
  block: TranslationsForString;
  blockAsInfluence: TranslationsForString;
  briefDescriptionOfCoup: TranslationsForString;
  cancel: TranslationsForString;
  cardCountInDeck: TranslationsForString;
  challenge: TranslationsForString;
  chat: TranslationsForString;
  cheatSheet: TranslationsForString;
  chooseATarget: TranslationsForString;
  chooseAnAction: TranslationsForString;
  chooseInfluenceToLose: TranslationsForString;
  chooseInfluenceToReveal: TranslationsForString;
  chooseInfluencesToKeep: TranslationsForString;
  choosePersonality: TranslationsForString;
  claimAnInfluence: TranslationsForString;
  close: TranslationsForString;
  collectCoins: TranslationsForString;
  colorMode: TranslationsForString;
  confirm: TranslationsForString;
  confirmActions: TranslationsForString;
  contents: TranslationsForString;
  copyInviteLink: TranslationsForString;
  createGame: TranslationsForString;
  createNewGame: TranslationsForString;
  draw2InfluencesAndDiscard2: TranslationsForString;
  dark: TranslationsForString;
  effect: TranslationsForString;
  eventLog: TranslationsForString;
  eventLogRetentionTurns: TranslationsForString;
  [EventMessages.ActionConfirm]: ActionMessages;
  [EventMessages.ActionPending]: Partial<ActionMessages>;
  [EventMessages.ActionProcessed]: ActionMessages;
  [EventMessages.BlockFailed]: TranslationsForString;
  [EventMessages.BlockPending]: TranslationsForString;
  [EventMessages.BlockSuccessful]: TranslationsForString;
  [EventMessages.ChallengeFailed]: TranslationsForString;
  [EventMessages.ChallengePending]: TranslationsForString;
  [EventMessages.ChallengeSuccessful]: TranslationsForString;
  [EventMessages.GameStarted]: TranslationsForString;
  [EventMessages.PlayerDied]: TranslationsForString;
  [EventMessages.PlayerForfeited]: TranslationsForString;
  [EventMessages.PlayerLostInfluence]: TranslationsForString;
  [EventMessages.PlayerReplacedInfluence]: TranslationsForString;
  [EventMessages.PlayerReplacedWithAi]: TranslationsForString;
  forfeit: TranslationsForString;
  forfeitConfirmationMessage: TranslationsForString;
  forfeitConfirmationTitle: TranslationsForString;
  forfeitKillInfluences: TranslationsForString;
  forfeitNotPossible: TranslationsForString;
  forfeitReplaceWithAi: TranslationsForString;
  fullRules: TranslationsForString;
  gameNotFound: TranslationsForString;
  goal: TranslationsForString;
  home: TranslationsForString;
  honesty: TranslationsForString;
  influence: TranslationsForString;
  influenceWasClaimed: TranslationsForString;
  influences: TranslationsForString;
  [Influences.Ambassador]: TranslationsForString;
  [Influences.Assassin]: TranslationsForString;
  [Influences.Captain]: TranslationsForString;
  [Influences.Contessa]: TranslationsForString;
  [Influences.Duke]: TranslationsForString;
  inviteLinkCopied: TranslationsForString;
  joinExistingGame: TranslationsForString;
  joinGame: TranslationsForString;
  keepInfluences: TranslationsForString;
  killAnInfluence: TranslationsForString;
  language: TranslationsForString;
  light: TranslationsForString;
  loseInfluence: TranslationsForString;
  losingAChallenge: TranslationsForString;
  losingInfluence: TranslationsForString;
  messageWasDeleted: TranslationsForString;
  noChatMessages: TranslationsForString;
  noDeadInfluences: TranslationsForString;
  notEnoughCoins: TranslationsForString;
  numberOfPlayers: TranslationsForString;
  pageNotFound: TranslationsForString;
  payCoins: TranslationsForString;
  personalityIsHidden: TranslationsForString;
  playAgain: TranslationsForString;
  playerTurn: TranslationsForString;
  playerWantToReset: TranslationsForString;
  playerWins: TranslationsForString;
  random: TranslationsForString;
  reportBug: TranslationsForString;
  requestFeature: TranslationsForString;
  resetGame: TranslationsForString;
  [Responses.Block]: TranslationsForString;
  [Responses.Challenge]: TranslationsForString;
  [Responses.Pass]: TranslationsForString;
  revealInfluence: TranslationsForString;
  reviveAnInfluence: TranslationsForString;
  room: TranslationsForString;
  rules: TranslationsForString;
  rulesActions: TranslationsForString;
  rulesAmbassador: TranslationsForString;
  rulesAssassin: TranslationsForString;
  rulesAssassinate: TranslationsForString;
  rulesBlock: TranslationsForString;
  rulesCaptain: TranslationsForString;
  rulesChallenge: TranslationsForString;
  rulesContents: TranslationsForString;
  rulesContessa: TranslationsForString;
  rulesCoup: TranslationsForString;
  rulesDuke: TranslationsForString;
  rulesExchange: TranslationsForString;
  rulesForeignAid: TranslationsForString;
  rulesGoal: TranslationsForString;
  rulesIncome: TranslationsForString;
  rulesInfluences: TranslationsForString;
  rulesLosingAChallenge: TranslationsForString;
  rulesLosingInfluence: TranslationsForString;
  rulesRevive: TranslationsForString
  rulesSetup: TranslationsForString;
  rulesSteal: TranslationsForString;
  rulesTax: TranslationsForString;
  send: TranslationsForString;
  settings: TranslationsForString;
  setup: TranslationsForString;
  showChickens: TranslationsForString;
  skepticism: TranslationsForString;
  spectateGame: TranslationsForString;
  startGame: TranslationsForString;
  startingPlayerBeginsWith1Coin: TranslationsForString;
  steal2CoinsFromSomeone: TranslationsForString;
  system: TranslationsForString;
  title: TranslationsForString;
  vengefulness: TranslationsForString;
  waitingOnOtherPlayers: TranslationsForString;
  websocketsConnection: TranslationsForString;
  welcomeToCoup: TranslationsForString;
  whatIsBotsName: TranslationsForString;
  whatIsYourName: TranslationsForString;
  writeNewMessage: TranslationsForString;
  youAreSpectating: TranslationsForString;
};

const translations: Translations = {
  action: {
    "de-DE": "Aktion",
    "en-US": "Action",
    "es-MX": "Acción",
    "fr-FR": "Action",
    "it-IT": "Azione",
    "pt-BR": "Ação",
  },
  actions: {
    "de-DE": "Aktionen",
    "en-US": "Actions",
    "es-MX": "Acciones",
    "fr-FR": "Actions",
    "it-IT": "Azioni",
    "pt-BR": "Ações",
  },
  [Actions.Assassinate]: {
    "de-DE": "Attentat",
    "en-US": "Assassinate",
    "es-MX": "Asesinar",
    "fr-FR": "Assassiner",
    "it-IT": "Assassinare",
    "pt-BR": "Assassinar",
  },
  [Actions.Coup]: {
    "de-DE": "Putsch",
    "en-US": "Coup",
    "es-MX": "Golpe de Estado",
    "fr-FR": "Coup d'État",
    "it-IT": "Colpo di Stato",
    "pt-BR": "Golpe de Estado",
  },
  [Actions.Exchange]: {
    "de-DE": "Austausch",
    "en-US": "Exchange",
    "es-MX": "Intercambiar",
    "fr-FR": "Échanger",
    "it-IT": "Scambiare",
    "pt-BR": "Trocar",
  },
  [Actions.ForeignAid]: {
    "de-DE": "Auslandshilfe",
    "en-US": "Foreign Aid",
    "es-MX": "Ayuda Extranjera",
    "fr-FR": "Aide Étrangère",
    "it-IT": "Aiuto Estero",
    "pt-BR": "Ajuda Estrangeira",
  },
  [Actions.Income]: {
    "de-DE": "Einkommen",
    "en-US": "Income",
    "es-MX": "Ingreso",
    "fr-FR": "Revenu",
    "it-IT": "Reddito",
    "pt-BR": "Renda",
  },
  [Actions.Revive]: {
    "de-DE": "Wiederbeleben",
    "en-US": "Revive",
    "es-MX": "Revivir",
    "fr-FR": "Réanimer",
    "it-IT": "Rivivere",
    "pt-BR": "Reviver",
  },
  [Actions.Steal]: {
    "de-DE": "Stehlen",
    "en-US": "Steal",
    "es-MX": "Robar",
    "fr-FR": "Voler",
    "it-IT": "Rubare",
    "pt-BR": "Roubar",
  },
  [Actions.Tax]: {
    "de-DE": "Steuern",
    "en-US": "Tax",
    "es-MX": "Impuesto",
    "fr-FR": "Impôt",
    "it-IT": "Tassa",
    "pt-BR": "Imposto",
  },
  add: {
    "de-DE": "Hinzufügen",
    "en-US": "Add",
    "es-MX": "Agregar",
    "fr-FR": "Ajouter",
    "it-IT": "Aggiungi",
    "pt-BR": "Adicionar",
  },
  addAiPlayer: {
    "de-DE": "KI-Spieler hinzufügen",
    "en-US": "Add AI Player",
    "es-MX": "Agregar Jugador IA",
    "fr-FR": "Ajouter un Joueur IA",
    "it-IT": "Aggiungi Giocatore IA",
    "pt-BR": "Adicionar Jogador IA",
  },
  addPlayersToStartGame: {
    "de-DE": "Füge mindestens einen weiteren Spieler hinzu, um das Spiel zu starten",
    "en-US": "Add at least one more player to start game",
    "es-MX": "Agrega al menos un jugador más para iniciar el juego",
    "fr-FR": "Ajoutez au moins un joueur pour commencer le jeu",
    "it-IT": "Aggiungi almeno un altro giocatore per iniziare il gioco",
    "pt-BR": "Adicione pelo menos mais um jogador para iniciar o jogo",
  },
  allowRevive: {
    "de-DE": "Wiederbeleben erlauben",
    "en-US": "Allow Revive",
    "es-MX": "Permitir Revivir",
    "fr-FR": "Autoriser la Réanimation",
    "it-IT": "Permetti Rivivere",
    "pt-BR": "Permitir Reviver",
  },
  anyone: {
    "de-DE": "Jeder",
    "en-US": "Anyone",
    "es-MX": "Cualquiera",
    "fr-FR": "N'importe qui",
    "it-IT": "Chiunque",
    "pt-BR": "Qualquer um",
  },
  block: {
    "de-DE": "Blocken",
    "en-US": "Block",
    "es-MX": "Bloquear",
    "fr-FR": "Bloquer",
    "it-IT": "Bloccare",
    "pt-BR": "Bloquear",
  },
  blockAsInfluence: {
    "de-DE": "Blocken als {{primaryInfluence}}",
    "en-US": "Block as {{primaryInfluence}}",
    "es-MX": "Bloquear como {{primaryInfluence}}",
    "fr-FR": "Bloquer en tant que {{primaryInfluence}}",
    "it-IT": "Blocca come {{primaryInfluence}}",
    "pt-BR": "Bloquear como {{primaryInfluence}}",
  },
  briefDescriptionOfCoup: {
    "de-DE": "Das Spiel der Täuschung, Deduktion und des Glücks.",
    "en-US": "The game of deception, deduction, and luck.",
    "es-MX": "El juego de engaño, deducción y suerte.",
    "fr-FR": "Le jeu de la tromperie, de la déduction et de la chance.",
    "it-IT": "Il gioco dell'inganno, della deduzione e della fortuna.",
    "pt-BR": "O jogo de engano, dedução e sorte.",
  },
  cancel: {
    "de-DE": "Abbrechen",
    "en-US": "Cancel",
    "es-MX": "Cancelar",
    "fr-FR": "Annuler",
    "it-IT": "Annulla",
    "pt-BR": "Cancelar",
  },
  cardCountInDeck: {
    "de-DE": "{{count}} Karte{{plural[[n]]}} im Deck",
    "en-US": "{{count}} card{{plural[[s]]}} in the deck",
    "es-MX": "{{count}} carta{{plural[[s]]}} en el mazo",
    "fr-FR": "{{count}} carte{{plural[[s]]}} dans le paquet",
    "it-IT": "{{count}} carta{{plural[[e]]}} nel mazzo",
    "pt-BR": "{{count}} carta{{plural[[s]]}} no baralho",
  },
  challenge: {
    "de-DE": "Herausfordern",
    "en-US": "Challenge",
    "es-MX": "Desafiar",
    "fr-FR": "Défier",
    "it-IT": "Sfida",
    "pt-BR": "Desafiar",
  },
  chat: {
    "de-DE": "Chat",
    "en-US": "Chat",
    "es-MX": "Chat",
    "fr-FR": "Chat",
    "it-IT": "Chat",
    "pt-BR": "Bate-papo",
  },
  cheatSheet: {
    "de-DE": "Spickzettel",
    "en-US": "Cheat Sheet",
    "es-MX": "Hoja de Trucos",
    "fr-FR": "Feuille de Triche",
    "it-IT": "Foglio di Trucchi",
    "pt-BR": "Folha de Dicas",
  },
  chooseATarget: {
    "de-DE": "Wähle ein Ziel",
    "en-US": "Choose a Target",
    "es-MX": "Elegir un Objetivo",
    "fr-FR": "Choisir une Cible",
    "it-IT": "Scegli un Obiettivo",
    "pt-BR": "Escolher um Alvo",
  },
  chooseAnAction: {
    "de-DE": "Wähle eine Aktion",
    "en-US": "Choose an Action",
    "es-MX": "Elegir una Acción",
    "fr-FR": "Choisir une Action",
    "it-IT": "Scegli un'Azione",
    "pt-BR": "Escolher uma Ação",
  },
  chooseInfluenceToLose: {
    "de-DE": "Wähle eine Einflusskarte, die du verlieren möchtest",
    "en-US": "Choose an influence to lose",
    "es-MX": "Elegir una influencia para perder",
    "fr-FR": "Choisir une influence à perdre",
    "it-IT": "Scegli un'influenza da perdere",
    "pt-BR": "Escolher uma influência para perder",
  },
  chooseInfluenceToReveal: {
    "de-DE": "Wähle eine Einflusskarte, die du aufdecken möchtest",
    "en-US": "Choose an influence to reveal",
    "es-MX": "Elegir una influencia para revelar",
    "fr-FR": "Choisir une influence à révéler",
    "it-IT": "Scegli un'influenza da rivelare",
    "pt-BR": "Escolher uma influência para revelar",
  },
  chooseInfluencesToKeep: {
    "de-DE": "Wähle {{count}} Einflusskarte{{plural[[n]]}}, die du behalten möchtest",
    "en-US": "Choose {{count}} influence{{plural[[s]]}} to keep",
    "es-MX": "Elegir {{count}} influencia{{plural[[s]]}} para conservar",
    "fr-FR": "Choisir {{count}} influence{{plural[[s]]}} à conserver",
    "it-IT": "Scegli {{count}} influenza{{plural[[e]]}} da mantenere",
    "pt-BR": "Escolher {{count}} influência{{plural[[s]]}} para manter",
  },
  choosePersonality: {
    "de-DE": "Wähle eine Persönlichkeit",
    "en-US": "Choose a Personality",
    "es-MX": "Elegir una Personalidad",
    "fr-FR": "Choisir une Personnalité",
    "it-IT": "Scegli una Personalità",
    "pt-BR": "Escolher uma Personalidade",
  },
  claimAnInfluence: {
    "de-DE": "Beanspruche eine Einflusskarte",
    "en-US": "Claim an Influence",
    "es-MX": "Reclamar una Influencia",
    "fr-FR": "Revendiquer une Influence",
    "it-IT": "Rivendicare un'Influenza",
    "pt-BR": "Reivindicar uma Influência",
  },
  close: {
    "de-DE": "Schließen",
    "en-US": "Close",
    "es-MX": "Cerrar",
    "fr-FR": "Fermer",
    "it-IT": "Chiudere",
    "pt-BR": "Fechar",
  },
  collectCoins: {
    "de-DE": "Sammle {{count}} Münze{{plural[[n]]}}",
    "en-US": "Collect {{count}} coin{{plural[[s]]}}",
    "es-MX": "Recoger {{count}} moneda{{plural[[s]]}}",
    "fr-FR": "Collecter {{count}} pièce{{plural[[s]]}}",
    "it-IT": "Raccogli {{count}} moneta{{plural[[e]]}}",
    "pt-BR": "Coletar {{count}} moeda{{plural[[s]]}}",
  },
  colorMode: {
    "de-DE": "Farbmodus",
    "en-US": "Color Mode",
    "es-MX": "Modo de Color",
    "fr-FR": "Mode Couleur",
    "it-IT": "Modalità Colore",
    "pt-BR": "Modo de Cor",
  },
  confirm: {
    "de-DE": "Bestätigen",
    "en-US": "Confirm",
    "es-MX": "Confirmar",
    "fr-FR": "Confirmer",
    "it-IT": "Conferma",
    "pt-BR": "Confirmar",
  },
  confirmActions: {
    "de-DE": "Aktionen bestätigen",
    "en-US": "Confirm Actions",
    "es-MX": "Confirmar Acciones",
    "fr-FR": "Confirmer les Actions",
    "it-IT": "Conferma Azioni",
    "pt-BR": "Confirmar Ações",
  },
  contents: {
    "de-DE": "Inhalt",
    "en-US": "Contents",
    "es-MX": "Contenido",
    "fr-FR": "Contenu",
    "it-IT": "Contenuti",
    "pt-BR": "Conteúdo",
  },
  copyInviteLink: {
    "de-DE": "Einladungslink kopieren",
    "en-US": "Copy Invite Link",
    "es-MX": "Copiar Enlace de Invitación",
    "fr-FR": "Copier le Lien d'Invitation",
    "it-IT": "Copia Link di Invito",
    "pt-BR": "Copiar Link de Convite",
  },
  createGame: {
    "de-DE": "Spiel erstellen",
    "en-US": "Create Game",
    "es-MX": "Crear Juego",
    "fr-FR": "Créer un Jeu",
    "it-IT": "Crea Gioco",
    "pt-BR": "Criar Jogo",
  },
  createNewGame: {
    "de-DE": "Neues Spiel erstellen",
    "en-US": "Create New Game",
    "es-MX": "Crear Nuevo Juego",
    "fr-FR": "Créer un Nouveau Jeu",
    "it-IT": "Crea Nuovo Gioco",
    "pt-BR": "Criar Novo Jogo",
  },
  dark: {
    "de-DE": "Dunkel",
    "en-US": "Dark",
    "es-MX": "Oscuro",
    "fr-FR": "Sombre",
    "it-IT": "Scuro",
    "pt-BR": "Escuro",
  },
  draw2InfluencesAndDiscard2: {
    "de-DE": "Ziehe 2 Einflusskarten & lege 2 ab",
    "en-US": "Draw 2 influences and discard 2",
    "es-MX": "Robar 2 influencias y descartar 2",
    "fr-FR": "Piocher 2 influences et en défausser 2",
    "it-IT": "Pesca 2 influenze e scarta 2",
    "pt-BR": "Comprar 2 influências e descartar 2",
  },
  effect: {
    "de-DE": "Effekt",
    "en-US": "Effect",
    "es-MX": "Efecto",
    "fr-FR": "Effet",
    "it-IT": "Effetto",
    "pt-BR": "Efeito",
  },
  eventLog: {
    "de-DE": "Ereignisprotokoll",
    "en-US": "Event Log",
    "es-MX": "Registro de Eventos",
    "fr-FR": "Journal des Événements",
    "it-IT": "Registro Eventi",
    "pt-BR": "Registro de Eventos",
  },
  eventLogRetentionTurns: {
    "de-DE": "Aufbewahrungsdauer der Ereignisprotokolle (Züge)",
    "en-US": "Event log retention (turns)",
    "es-MX": "Retención del registro de eventos (turnos)",
    "fr-FR": "Conservation du journal des événements (tours)",
    "it-IT": "Conservazione del registro eventi (turni)",
    "pt-BR": "Retenção do registro de eventos (turnos)",
  },
  [EventMessages.ActionConfirm]: {
    [Actions.Assassinate]: {
      "de-DE": "{{action[[Attentat]]}} {{secondaryPlayer}}",
      "en-US": "{{action[[Assassinate]]}} {{secondaryPlayer}}",
      "es-MX": "{{action[[Asesinar]]}} {{secondaryPlayer}}",
      "fr-FR": "{{action[[Assassiner]]}} {{secondaryPlayer}}",
      "it-IT": "{{action[[Assassinare]]}} {{secondaryPlayer}}",
      "pt-BR": "{{action[[Assassinar]]}} {{secondaryPlayer}}",
    },
    [Actions.Coup]: {
      "de-DE": "{{action[[Putsch]]}} {{secondaryPlayer}}",
      "en-US": "{{action[[Coup]]}} {{secondaryPlayer}}",
      "es-MX": "{{action[[Golpe de Estado]]}} {{secondaryPlayer}}",
      "fr-FR": "{{action[[Coup d'État]]}} {{secondaryPlayer}}",
      "it-IT": "{{action[[Colpo di Stato]]}} {{secondaryPlayer}}",
      "pt-BR": "{{action[[Golpear]]}} {{secondaryPlayer}}",
    },
    [Actions.Exchange]: {
      "de-DE": "{{action[[Austausch]]}} von Einflusskarten",
      "en-US": "{{action[[Exchange]]}} influences",
      "es-MX": "{{action[[Intercambiar]]}} influencias",
      "fr-FR": "{{action[[Échanger]]}} des influences",
      "it-IT": "{{action[[Scambiare]]}} influenze",
      "pt-BR": "{{action[[Trocar]]}} influências",
    },
    [Actions.ForeignAid]: {
      "de-DE": "Sammle {{action[[Auslandshilfe]]}}",
      "en-US": "Collect {{action[[Foreign Aid]]}}",
      "es-MX": "Recoger {{action[[Ayuda Extranjera]]}}",
      "fr-FR": "Collecter {{action[[Aide Étrangère]]}}",
      "it-IT": "Raccogli {{action[[Aiuto Estero]]}}",
      "pt-BR": "Coletar {{action[[Ajuda Estrangeira]]}}",
    },
    [Actions.Income]: {
      "de-DE": "Sammle {{action[[Einkommen]]}}",
      "en-US": "Collect {{action[[Income]]}}",
      "es-MX": "Recoger {{action[[Ingreso]]}}",
      "fr-FR": "Collecter {{action[[Revenu]]}}",
      "it-IT": "Raccogli {{action[[Reddito]]}}",
      "pt-BR": "Coletar {{action[[Renda]]}}",
    },
    [Actions.Revive]: {
      "de-DE": "{{action[[Wiederbeleben]]}} einer Einflusskarte",
      "en-US": "{{action[[Revive]]}} an influence",
      "es-MX": "{{action[[Revivir]]}} una influencia",
      "fr-FR": "{{action[[Réanimer]]}} une influence",
      "it-IT": "{{action[[Rivivere]]}} un'influenza",
      "pt-BR": "{{action[[Reviver]]}} uma influência",
    },
    [Actions.Steal]: {
      "de-DE": "{{action[[Stehlen]]}} von {{secondaryPlayer}}",
      "en-US": "{{action[[Steal]]}} from {{secondaryPlayer}}",
      "es-MX": "{{action[[Robar]]}} de {{secondaryPlayer}}",
      "fr-FR": "{{action[[Voler]]}} à {{secondaryPlayer}}",
      "it-IT": "{{action[[Rubare]]}} da {{secondaryPlayer}}",
      "pt-BR": "{{action[[Roubar]]}} de {{secondaryPlayer}}",
    },
    [Actions.Tax]: {
      "de-DE": "Sammle {{action[[Steuern]]}}",
      "en-US": "Collect {{action[[Tax]]}}",
      "es-MX": "Recoger {{action[[Impuesto]]}}",
      "fr-FR": "Collecter {{action[[Impôt]]}}",
      "it-IT": "Raccogli {{action[[Tassa]]}}",
      "pt-BR": "Coletar {{action[[Imposto]]}}",
    },
  },
  [EventMessages.ActionPending]: {
    [Actions.Assassinate]: {
      "de-DE": "{{primaryPlayer}} versucht, {{secondaryPlayer}} zu {{action[[Attentat]]}}",
      "en-US": "{{primaryPlayer}} is trying to {{action[[Assassinate]]}} {{secondaryPlayer}}",
      "es-MX": "{{primaryPlayer}} está intentando {{action[[Asesinar]]}} a {{secondaryPlayer}}",
      "fr-FR": "{{primaryPlayer}} essaie de {{action[[Assassiner]]}} {{secondaryPlayer}}",
      "it-IT": "{{primaryPlayer}} sta cercando di {{action[[Assassinare]]}} {{secondaryPlayer}}",
      "pt-BR": "{{primaryPlayer}} está tentando {{action[[Assassinar]]}} {{secondaryPlayer}}",
    },
    [Actions.Exchange]: {
      "de-DE": "{{primaryPlayer}} versucht, Einflusskarten {{action[[Austausch]]}}",
      "en-US": "{{primaryPlayer}} is trying to {{action[[Exchange]]}} influences",
      "es-MX": "{{primaryPlayer}} está intentando {{action[[Intercambiar]]}} influencias",
      "fr-FR": "{{primaryPlayer}} essaie de {{action[[Échanger]]}} des influences",
      "it-IT": "{{primaryPlayer}} sta cercando di {{action[[Scambiare]]}} influenze",
      "pt-BR": "{{primaryPlayer}} está tentando {{action[[Trocar]]}} influências",
    },
    [Actions.ForeignAid]: {
      "de-DE": "{{primaryPlayer}} versucht, {{action[[Auslandshilfe]]}} zu erhalten",
      "en-US": "{{primaryPlayer}} is trying to collect {{action[[Foreign Aid]]}}",
      "es-MX": "{{primaryPlayer}} está intentando recoger {{action[[Ayuda Extranjera]]}}",
      "fr-FR": "{{primaryPlayer}} essaie de collecter {{action[[Aide Étrangère]]}}",
      "it-IT": "{{primaryPlayer}} sta cercando di raccogliere {{action[[Aiuto Estero]]}}",
      "pt-BR": "{{primaryPlayer}} está tentando coletar {{action[[Ajuda Estrangeira]]}}",
    },
    [Actions.Steal]: {
      "de-DE": "{{primaryPlayer}} versucht, von {{secondaryPlayer}} zu {{action[[Stehlen]]}}",
      "en-US": "{{primaryPlayer}} is trying to {{action[[Steal]]}} from {{secondaryPlayer}}",
      "es-MX": "{{primaryPlayer}} está intentando {{action[[Robar]]}} de {{secondaryPlayer}}",
      "fr-FR": "{{primaryPlayer}} essaie de {{action[[Voler]]}} à {{secondaryPlayer}}",
      "it-IT": "{{primaryPlayer}} sta cercando di {{action[[Rubare]]}} da {{secondaryPlayer}}",
      "pt-BR": "{{primaryPlayer}} está tentando {{action[[Roubar]]}} de {{secondaryPlayer}}",
    },
    [Actions.Tax]: {
      "de-DE": "{{primaryPlayer}} versucht, {{action[[Steuern]]}} zu erhalten",
      "en-US": "{{primaryPlayer}} is trying to collect {{action[[Tax]]}}",
      "es-MX": "{{primaryPlayer}} está intentando recoger {{action[[Impuesto]]}}",
      "fr-FR": "{{primaryPlayer}} essaie de collecter {{action[[Impôt]]}}",
      "it-IT": "{{primaryPlayer}} sta cercando di raccogliere {{action[[Tassa]]}}",
      "pt-BR": "{{primaryPlayer}} está tentando coletar {{action[[Imposto]]}}",
    },
  },
  [EventMessages.ActionProcessed]: {
    [Actions.Assassinate]: {
      "de-DE": "{{primaryPlayer}} hat {{secondaryPlayer}} {{action[[Attentat]]}}",
      "en-US": "{{primaryPlayer}} {{action[[Assassinated]]}} {{secondaryPlayer}}",
      "es-MX": "{{primaryPlayer}} ha {{action[[Asesinado]]}} {{secondaryPlayer}}",
      "fr-FR": "{{primaryPlayer}} a {{action[[Assassiné]]}} {{secondaryPlayer}}",
      "it-IT": "{{primaryPlayer}} ha {{action[[Assassinato]]}} {{secondaryPlayer}}",
      "pt-BR": "{{primaryPlayer}} {{action[[Assassinou]]}} {{secondaryPlayer}}",
    },
    [Actions.Coup]: {
      "de-DE": "{{primaryPlayer}} hat {{secondaryPlayer}} {{action[[Geputscht]]}}",
      "en-US": "{{primaryPlayer}} {{action[[Couped]]}} {{secondaryPlayer}}",
      "es-MX": "{{primaryPlayer}} ha {{action[[Golpeado]]}} a {{secondaryPlayer}}",
      "fr-FR": "{{primaryPlayer}} a {{action[[Coupé]]}} {{secondaryPlayer}}",
      "it-IT": "{{primaryPlayer}} ha {{action[[Colpito]]}} {{secondaryPlayer}}",
      "pt-BR": "{{primaryPlayer}} {{action[[Golpeou]]}} {{secondaryPlayer}}",
    },
    [Actions.Exchange]: {
      "de-DE": "{{primaryPlayer}} hat Einflusskarten {{action[[Ausgetauscht]]}}",
      "en-US": "{{primaryPlayer}} {{action[[Exchanged]]}} influences",
      "es-MX": "{{primaryPlayer}} ha {{action[[Intercambiado]]}} influencias",
      "fr-FR": "{{primaryPlayer}} a {{action[[Échangées]]}} des influences",
      "it-IT": "{{primaryPlayer}} ha {{action[[Scambiato]]}} influenze",
      "pt-BR": "{{primaryPlayer}} {{action[[Trocou]]}} influências",
    },
    [Actions.ForeignAid]: {
      "de-DE": "{{primaryPlayer}} hat {{action[[Auslandshilfe]]}} erhalten",
      "en-US": "{{primaryPlayer}} collected {{action[[Foreign Aid]]}}",
      "es-MX": "{{primaryPlayer}} ha recogido {{action[[Ayuda Extranjera]]}}",
      "fr-FR": "{{primaryPlayer}} a collecté {{action[[Aide Étrangère]]}}",
      "it-IT": "{{primaryPlayer}} ha raccolto {{action[[Aiuto Estero]]}}",
      "pt-BR": "{{primaryPlayer}} coletou {{action[[Ajuda Estrangeira]]}}",
    },
    [Actions.Income]: {
      "de-DE": "{{primaryPlayer}} hat {{action[[Einkommen]]}} erhalten",
      "en-US": "{{primaryPlayer}} collected {{action[[Income]]}}",
      "es-MX": "{{primaryPlayer}} ha recogido {{action[[Ingreso]]}}",
      "fr-FR": "{{primaryPlayer}} a collecté {{action[[Revenu]]}}",
      "it-IT": "{{primaryPlayer}} ha raccolto {{action[[Reddito]]}}",
      "pt-BR": "{{primaryPlayer}} coletou {{action[[Renda]]}}",
    },
    [Actions.Revive]: {
      "de-DE": "{{primaryPlayer}} hat eine Einflusskarte {{action[[Wiederbelebt]]}}",
      "en-US": "{{primaryPlayer}} {{action[[Revived]]}} an influence",
      "es-MX": "{{primaryPlayer}} ha {{action[[Revivido]]}} una influencia",
      "fr-FR": "{{primaryPlayer}} a {{action[[Réanime]]}} une influence",
      "it-IT": "{{primaryPlayer}} ha {{action[[Rivissuto]]}} un'influenza",
      "pt-BR": "{{primaryPlayer}} {{action[[Revive]]}} uma influência",
    },
    [Actions.Steal]: {
      "de-DE": "{{primaryPlayer}} hat von {{secondaryPlayer}} {{action[[Gestohlen]]}}",
      "en-US": "{{primaryPlayer}} {{action[[Stole]]}} from {{secondaryPlayer}}",
      "es-MX": "{{primaryPlayer}} ha {{action[[Robado]]}} de {{secondaryPlayer}}",
      "fr-FR": "{{primaryPlayer}} a {{action[[Volé]]}} à {{secondaryPlayer}}",
      "it-IT": "{{primaryPlayer}} ha {{action[[Rubato]]}} da {{secondaryPlayer}}",
      "pt-BR": "{{primaryPlayer}} {{action[[Roubou]]}} de {{secondaryPlayer}}",
    },
    [Actions.Tax]: {
      "de-DE": "{{primaryPlayer}} hat {{action[[Steuern]]}} erhalten",
      "en-US": "{{primaryPlayer}} collected {{action[[Tax]]}}",
      "es-MX": "{{primaryPlayer}} ha recogido {{action[[Impuesto]]}}",
      "fr-FR": "{{primaryPlayer}} a collecté {{action[[Impôt]]}}",
      "it-IT": "{{primaryPlayer}} ha raccolto {{action[[Tassa]]}}",
      "pt-BR": "{{primaryPlayer}} coletou {{action[[Imposto]]}}",
    },
  },
  [EventMessages.BlockFailed]: {
    "de-DE": "{{primaryPlayer}} konnte {{secondaryPlayer}} nicht blocken",
    "en-US": "{{primaryPlayer}} failed to block {{secondaryPlayer}}",
    "es-MX": "{{primaryPlayer}} no pudo bloquear a {{secondaryPlayer}}",
    "fr-FR": "{{primaryPlayer}} n'a pas pu bloquer {{secondaryPlayer}}",
    "it-IT": "{{primaryPlayer}} non ha potuto bloccare {{secondaryPlayer}}",
    "pt-BR": "{{primaryPlayer}} não conseguiu bloquear {{secondaryPlayer}}",
  },
  [EventMessages.BlockPending]: {
    "de-DE": "{{primaryPlayer}} versucht, {{secondaryPlayer}} als {{primaryInfluence}} zu blocken",
    "en-US": "{{primaryPlayer}} is trying to block {{secondaryPlayer}} as {{primaryInfluence}}",
    "es-MX": "{{primaryPlayer}} está intentando bloquear a {{secondaryPlayer}} como {{primaryInfluence}}",
    "fr-FR": "{{primaryPlayer}} essaie de bloquer {{secondaryPlayer}} en tant que {{primaryInfluence}}",
    "it-IT": "{{primaryPlayer}} sta cercando di bloccare {{secondaryPlayer}} come {{primaryInfluence}}",
    "pt-BR": "{{primaryPlayer}} está tentando bloquear {{secondaryPlayer}} como {{primaryInfluence}}",
  },
  [EventMessages.BlockSuccessful]: {
    "de-DE": "{{primaryPlayer}} hat {{secondaryPlayer}} erfolgreich geblockt",
    "en-US": "{{primaryPlayer}} successfully blocked {{secondaryPlayer}}",
    "es-MX": "{{primaryPlayer}} bloqueó exitosamente a {{secondaryPlayer}}",
    "fr-FR": "{{primaryPlayer}} a réussi à bloquer {{secondaryPlayer}}",
    "it-IT": "{{primaryPlayer}} ha bloccato con successo {{secondaryPlayer}}",
    "pt-BR": "{{primaryPlayer}} bloqueou com sucesso {{secondaryPlayer}}",
  },
  [EventMessages.ChallengeFailed]: {
    "de-DE": "{{primaryPlayer}} konnte {{secondaryPlayer}} nicht herausfordern",
    "en-US": "{{primaryPlayer}} failed to challenge {{secondaryPlayer}}",
    "es-MX": "{{primaryPlayer}} no pudo desafiar a {{secondaryPlayer}}",
    "fr-FR": "{{primaryPlayer}} n'a pas pu défier {{secondaryPlayer}}",
    "it-IT": "{{primaryPlayer}} non ha potuto sfidare {{secondaryPlayer}}",
    "pt-BR": "{{primaryPlayer}} não conseguiu desafiar {{secondaryPlayer}}",
  },
  [EventMessages.ChallengePending]: {
    "de-DE": "{{primaryPlayer}} versucht, {{secondaryPlayer}} herauszufordern",
    "en-US": "{{primaryPlayer}} is trying to challenge {{secondaryPlayer}}",
    "es-MX": "{{primaryPlayer}} está intentando desafiar a {{secondaryPlayer}}",
    "fr-FR": "{{primaryPlayer}} essaie de défier {{secondaryPlayer}}",
    "it-IT": "{{primaryPlayer}} sta cercando di sfidare {{secondaryPlayer}}",
    "pt-BR": "{{primaryPlayer}} está tentando desafiar {{secondaryPlayer}}",
  },
  [EventMessages.ChallengeSuccessful]: {
    "de-DE": "{{primaryPlayer}} hat {{secondaryPlayer}} erfolgreich herausgefordert",
    "en-US": "{{primaryPlayer}} successfully challenged {{secondaryPlayer}}",
    "es-MX": "{{primaryPlayer}} desafió exitosamente a {{secondaryPlayer}}",
    "fr-FR": "{{primaryPlayer}} a réussi à défier {{secondaryPlayer}}",
    "it-IT": "{{primaryPlayer}} ha sfidato con successo {{secondaryPlayer}}",
    "pt-BR": "{{primaryPlayer}} desafiou com sucesso {{secondaryPlayer}}",
  },
  [EventMessages.GameStarted]: {
    "de-DE": "Das Spiel hat begonnen!",
    "en-US": "The game has started!",
    "es-MX": "¡El juego ha comenzado!",
    "fr-FR": "Le jeu a commencé !",
    "it-IT": "Il gioco è iniziato!",
    "pt-BR": "O jogo começou!",
  },
  [EventMessages.PlayerDied]: {
    "de-DE": "{{primaryPlayer}} ist gestorben!",
    "en-US": "{{primaryPlayer}} has died!",
    "es-MX": "{{primaryPlayer}} ha muerto!",
    "fr-FR": "{{primaryPlayer}} est mort !",
    "it-IT": "{{primaryPlayer}} è morto!",
    "pt-BR": "{{primaryPlayer}} morreu!",
  },
  [EventMessages.PlayerForfeited]: {
    "de-DE": "{{primaryPlayer}} hat aufgegeben",
    "en-US": "{{primaryPlayer}} has forfeited",
    "es-MX": "{{primaryPlayer}} ha renunciado",
    "fr-FR": "{{primaryPlayer}} a abandonné",
    "it-IT": "{{primaryPlayer}} ha rinunciato",
    "pt-BR": "{{primaryPlayer}} desistiu",
  },
  [EventMessages.PlayerLostInfluence]: {
    "de-DE": "{{primaryPlayer}} hat ihre {{primaryInfluence}} verloren",
    "en-US": "{{primaryPlayer}} lost their {{primaryInfluence}}",
    "es-MX": "{{primaryPlayer}} perdió su {{primaryInfluence}}",
    "fr-FR": "{{primaryPlayer}} a perdu son {{primaryInfluence}}",
    "it-IT": "{{primaryPlayer}} ha perso il suo {{primaryInfluence}}",
    "pt-BR": "{{primaryPlayer}} perdeu sua {{primaryInfluence}}",
  },
  [EventMessages.PlayerReplacedInfluence]: {
    "de-DE": "{{primaryPlayer}} hat ihre {{primaryInfluence}} aufgedeckt und ersetzt",
    "en-US": "{{primaryPlayer}} revealed and replaced their {{primaryInfluence}}",
    "es-MX": "{{primaryPlayer}} reveló y reemplazó su {{primaryInfluence}}",
    "fr-FR": "{{primaryPlayer}} a révélé et remplacé son {{primaryInfluence}}",
    "it-IT": "{{primaryPlayer}} ha rivelato e sostituito il suo {{primaryInfluence}}",
    "pt-BR": "{{primaryPlayer}} revelou e substituiu sua {{primaryInfluence}}",
  },
  [EventMessages.PlayerReplacedWithAi]: {
    "de-DE": "{{primaryPlayer}} wurde durch einen KI-Spieler ersetzt",
    "en-US": "{{primaryPlayer}} has been replaced by an AI player",
    "es-MX": "{{primaryPlayer}} ha sido reemplazado por un jugador de IA",
    "fr-FR": "{{primaryPlayer}} a été remplacé par un joueur IA",
    "it-IT": "{{primaryPlayer}} è stato sostituito da un giocatore IA",
    "pt-BR": "{{primaryPlayer}} foi substituído por um jogador de IA",
  },
  forfeit: {
    "de-DE": "Aufgeben",
    "en-US": "Forfeit",
    "es-MX": "Renunciar",
    "fr-FR": "Abandonner",
    "it-IT": "Rinuncia",
    "pt-BR": "Desistir",
  },
  forfeitConfirmationMessage: {
    "de-DE": "Möchtest du deine Einflüsse töten oder dich durch einen KI-Spieler ersetzen?",
    "en-US": "Do you want to kill your influences or replace yourself with an AI player?",
    "es-MX": "¿Quieres matar tus influencias o reemplazarte con un jugador de IA?",
    "fr-FR": "Voulez-vous tuer vos influences ou vous remplacer par un joueur IA ?",
    "it-IT": "Vuoi uccidere le tue influenze o sostituirti con un giocatore IA?",
    "pt-BR": "Você quer matar suas influências ou se substituir por um jogador de IA?",
  },
  forfeitConfirmationTitle: {
    "de-DE": "Spiel aufgeben",
    "en-US": 'Forfeit Game',
    "es-MX": "Renunciar al Juego",
    "fr-FR": "Abandonner le Jeu",
    "it-IT": "Rinunciare al Gioco",
    "pt-BR": "Desistir do Jogo",
  },
  forfeitKillInfluences: {
    "de-DE": "Einflüsse töten",
    "en-US": "Kill Influences",
    "es-MX": "Matar Influencias",
    "fr-FR": "Tuer les Influences",
    "it-IT": "Uccidere le Influenze",
    "pt-BR": "Matar Influências",
  },
  forfeitNotPossible: {
    "de-DE": "Du kannst das Spiel derzeit nicht aufgeben",
    "en-US": "You can't currently forfeit the game",
    "es-MX": "Actualmente no puedes renunciar al juego",
    "fr-FR": "Vous ne pouvez pas actuellement abandonner le jeu",
    "it-IT": "Non puoi attualmente rinunciare al gioco",
    "pt-BR": "Você não pode desistir do jogo no momento",
  },
  forfeitReplaceWithAi: {
    "de-DE": "Durch KI ersetzen",
    "en-US": "Replace with AI",
    "es-MX": "Reemplazar con IA",
    "fr-FR": "Remplacer par IA",
    "it-IT": "Sostituire con IA",
    "pt-BR": "Substituir por IA",
  },
  fullRules: {
    "de-DE": "Vollständige Regeln",
    "en-US": "Full Rules",
    "es-MX": "Reglas Completas",
    "fr-FR": "Règles Complètes",
    "it-IT": "Regole Complete",
    "pt-BR": "Regras Completas",
  },
  gameNotFound: {
    "de-DE": "Spiel nicht gefunden",
    "en-US": "Game not found",
    "es-MX": "Juego no encontrado",
    "fr-FR": "Jeu non trouvé",
    "it-IT": "Gioco non trovato",
    "pt-BR": "Jogo não encontrado",
  },
  goal: {
    "de-DE": "Ziel",
    "en-US": "Goal",
    "es-MX": "Objetivo",
    "fr-FR": "Objectif",
    "it-IT": "Obiettivo",
    "pt-BR": "Objetivo",
  },
  home: {
    "de-DE": "Startseite",
    "en-US": "Home",
    "es-MX": "Inicio",
    "fr-FR": "Accueil",
    "it-IT": "Home",
    "pt-BR": "Início",
  },
  honesty: {
    "de-DE": "Ehrlichkeit",
    "en-US": "Honesty",
    "es-MX": "Honestidad",
    "fr-FR": "Honnêteté",
    "it-IT": "Onestà",
    "pt-BR": "Honestidade",
  },
  influence: {
    "de-DE": "Einfluss",
    "en-US": "Influence",
    "es-MX": "Influencia",
    "fr-FR": "Influence",
    "it-IT": "Influenza",
    "pt-BR": "Influência",
  },
  influenceWasClaimed: {
    "de-DE": "{{primaryInfluence}} wurde beansprucht",
    "en-US": "{{primaryInfluence}} was claimed",
    "es-MX": "{{primaryInfluence}} fue reclamado",
    "fr-FR": "{{primaryInfluence}} a été revendiqué",
    "it-IT": "{{primaryInfluence}} è stato rivendicato",
    "pt-BR": "{{primaryInfluence}} foi reivindicado",
  },
  influences: {
    "de-DE": "Einflüsse",
    "en-US": "Influences",
    "es-MX": "Influencias",
    "fr-FR": "Influences",
    "it-IT": "Influenze",
    "pt-BR": "Influências",
  },
  [Influences.Ambassador]: {
    "de-DE": "Botschafter",
    "en-US": "Ambassador",
    "es-MX": "Embajador",
    "fr-FR": "Ambassadeur",
    "it-IT": "Ambasciatore",
    "pt-BR": "Embaixador",
  },
  [Influences.Assassin]: {
    "de-DE": "Attentäter",
    "en-US": "Assassin",
    "es-MX": "Asesino",
    "fr-FR": "Assassin",
    "it-IT": "Assassino",
    "pt-BR": "Assassino",
  },
  [Influences.Captain]: {
    "de-DE": "Kapitän",
    "en-US": "Captain",
    "es-MX": "Capitán",
    "fr-FR": "Capitaine",
    "it-IT": "Capitano",
    "pt-BR": "Capitão",
  },
  [Influences.Contessa]: {
    "de-DE": "Contessa",
    "en-US": "Contessa",
    "es-MX": "Condesa",
    "fr-FR": "Comtesse",
    "it-IT": "Contessa",
    "pt-BR": "Condessa",
  },
  [Influences.Duke]: {
    "de-DE": "Herzog",
    "en-US": "Duke",
    "es-MX": "Duque",
    "fr-FR": "Duc",
    "it-IT": "Duca",
    "pt-BR": "Duque",
  },
  inviteLinkCopied: {
    "de-DE": "Einladungslink kopiert",
    "en-US": "Invite link copied",
    "es-MX": "Enlace de invitación copiado",
    "fr-FR": "Lien d'invitation copié",
    "it-IT": "Link di invito copiato",
    "pt-BR": "Link de convite copiado",
  },
  joinExistingGame: {
    "de-DE": "Bestehendes Spiel beitreten",
    "en-US": "Join Existing Game",
    "es-MX": "Unirse a un Juego Existente",
    "fr-FR": "Rejoindre un Jeu Existant",
    "it-IT": "Unisciti a un Gioco Esistente",
    "pt-BR": "Entrar em um Jogo Existente",
  },
  joinGame: {
    "de-DE": "Spiel beitreten",
    "en-US": "Join Game",
    "es-MX": "Unirse al Juego",
    "fr-FR": "Rejoindre le Jeu",
    "it-IT": "Unisciti al Gioco",
    "pt-BR": "Entrar no Jogo",
  },
  keepInfluences: {
    "de-DE": "Behalte {{primaryInfluence}}{{plural[[ und {{secondaryInfluence}}]]}}",
    "en-US": "Keep {{primaryInfluence}}{{plural[[ and {{secondaryInfluence}}]]}}",
    "es-MX": "Mantén {{primaryInfluence}}{{plural[[ y {{secondaryInfluence}}]]}}",
    "fr-FR": "Conserver {{primaryInfluence}}{{plural[[ et {{secondaryInfluence}}]]}}",
    "it-IT": "Mantieni {{primaryInfluence}}{{plural[[ e {{secondaryInfluence}}]]}}",
    "pt-BR": "Manter {{primaryInfluence}}{{plural[[ e {{secondaryInfluence}}]]}}",
  },
  killAnInfluence: {
    "de-DE": "Töte einen Einfluss",
    "en-US": "Kill an Influence",
    "es-MX": "Matar una Influencia",
    "fr-FR": "Tuer une Influence",
    "it-IT": "Uccidere un'Influenza",
    "pt-BR": "Matar uma Influência",
  },
  language: {
    "de-DE": "Sprache",
    "en-US": "Language",
    "es-MX": "Idioma",
    "fr-FR": "Langue",
    "it-IT": "Lingua",
    "pt-BR": "Idioma",
  },
  light: {
    "de-DE": "Hell",
    "en-US": "Light",
    "es-MX": "Claro",
    "fr-FR": "Clair",
    "it-IT": "Chiaro",
    "pt-BR": "Claro",
  },
  loseInfluence: {
    "de-DE": "Verliere {{primaryInfluence}}",
    "en-US": "Lose {{primaryInfluence}}",
    "es-MX": "Perder {{primaryInfluence}}",
    "fr-FR": "Perdre {{primaryInfluence}}",
    "it-IT": "Perdere {{primaryInfluence}}",
    "pt-BR": "Perder {{primaryInfluence}}",
  },
  losingAChallenge: {
    "de-DE": "Herausforderung verlieren",
    "en-US": "Losing a Challenge",
    "es-MX": "Perder un Desafío",
    "fr-FR": "Perdre un Défi",
    "it-IT": "Perdere una Sfida",
    "pt-BR": "Perder um Desafio",
  },
  losingInfluence: {
    "de-DE": "Einfluss verlieren",
    "en-US": "Losing Influence",
    "es-MX": "Perder Influencia",
    "fr-FR": "Perdre de l'Influence",
    "it-IT": "Perdere Influenza",
    "pt-BR": "Perder Influência",
  },
  messageWasDeleted: {
    "de-DE": "Nachricht wurde gelöscht",
    "en-US": "Message was deleted",
    "es-MX": "Mensaje eliminado",
    "fr-FR": "Le message a été supprimé",
    "it-IT": "Il messaggio è stato eliminato",
    "pt-BR": "Mensagem foi excluída",
  },
  noChatMessages: {
    "de-DE": "Keine Chat-Nachrichten",
    "en-US": "No chat messages",
    "es-MX": "No hay mensajes de chat",
    "fr-FR": "Aucun message de chat",
    "it-IT": "Nessun messaggio di chat",
    "pt-BR": "Sem mensagens de chat",
  },
  noDeadInfluences: {
    "de-DE": "Keine toten Einflüsse",
    "en-US": "No dead influences",
    "es-MX": "No hay influencias muertas",
    "fr-FR": "Aucune influence morte",
    "it-IT": "Nessuna influenza morta",
    "pt-BR": "Sem influências mortas",
  },
  notEnoughCoins: {
    "de-DE": "Nicht genug Münzen ({{count}})",
    "en-US": "Not enough coins ({{count}})",
    "es-MX": "No hay suficientes monedas ({{count}})",
    "fr-FR": "Pas assez de pièces ({{count}})",
    "it-IT": "Non ci sono abbastanza monete ({{count}})",
    "pt-BR": "Moedas insuficientes ({{count}})",
  },
  numberOfPlayers: {
    "de-DE": "Anzahl der Spieler",
    "en-US": "Number of Players",
    "es-MX": "Número de Jugadores",
    "fr-FR": "Nombre de Joueurs",
    "it-IT": "Numero di Giocatori",
    "pt-BR": "Número de Jogadores",
  },
  pageNotFound: {
    "de-DE": "Seite nicht gefunden",
    "en-US": "Page not found",
    "es-MX": "Página no encontrada",
    "fr-FR": "Page non trouvée",
    "it-IT": "Pagina non trovata",
    "pt-BR": "Página não encontrada",
  },
  payCoins: {
    "de-DE": "Zahle {{count}} Münze{{plural[[n]]}}",
    "en-US": "Pay {{count}} coin{{plural[[s]]}}",
    "es-MX": "Pagar {{count}} moneda{{plural[[s]]}}",
    "fr-FR": "Payer {{count}} pièce{{plural[[s]]}}",
    "it-IT": "Paga {{count}} moneta{{plural[[e]]}}",
    "pt-BR": "Pagar {{count}} moeda{{plural[[s]]}}",
  },
  personalityIsHidden: {
    "de-DE": "Persönlichkeit ist versteckt",
    "en-US": "Personality is hidden",
    "es-MX": "La personalidad está oculta",
    "fr-FR": "La personnalité est cachée",
    "it-IT": "La personalità è nascosta",
    "pt-BR": "Personalidade está oculta",
  },
  playAgain: {
    "de-DE": "Nochmal spielen",
    "en-US": "Play Again",
    "es-MX": "Jugar de Nuevo",
    "fr-FR": "Jouer à Nouveau",
    "it-IT": "Gioca di Nuovo",
    "pt-BR": "Jogar Novamente",
  },
  playerTurn: {
    "de-DE": "{{primaryPlayer}}'s Zug",
    "en-US": "{{primaryPlayer}}'s Turn",
    "es-MX": "Turno de {{primaryPlayer}}",
    "fr-FR": "Tour de {{primaryPlayer}}",
    "it-IT": "Turno di {{primaryPlayer}}",
    "pt-BR": "Vez de {{primaryPlayer}}",
  },
  playerWantToReset: {
    "de-DE": "{{primaryPlayer}} möchte das Spiel zurücksetzen",
    "en-US": "{{primaryPlayer}} wants to reset the game",
    "es-MX": "{{primaryPlayer}} quiere reiniciar el juego",
    "fr-FR": "{{primaryPlayer}} veut réinitialiser le jeu",
    "it-IT": "{{primaryPlayer}} vuole resettare il gioco",
    "pt-BR": "{{primaryPlayer}} quer reiniciar o jogo",
  },
  playerWins: {
    "de-DE": "{{primaryPlayer}} gewinnt!",
    "en-US": "{{primaryPlayer}} Wins!",
    "es-MX": "{{primaryPlayer}} ¡Gana!",
    "fr-FR": "{{primaryPlayer}} Gagne !",
    "it-IT": "{{primaryPlayer}} Vince!",
    "pt-BR": "{{primaryPlayer}} Vence!",
  },
  random: {
    "de-DE": "Zufällig",
    "en-US": "Random",
    "es-MX": "Aleatorio",
    "fr-FR": "Aléatoire",
    "it-IT": "Casuale",
    "pt-BR": "Aleatório",
  },
  reportBug: {
    "de-DE": "Fehler melden",
    "en-US": "Report Bug",
    "es-MX": "Reportar Error",
    "fr-FR": "Signaler un Bug",
    "it-IT": "Segnala Bug",
    "pt-BR": "Reportar Bug",
  },
  requestFeature: {
    "de-DE": "Funktion anfordern",
    "en-US": "Request Feature",
    "es-MX": "Solicitar Función",
    "fr-FR": "Demander une Fonctionnalité",
    "it-IT": "Richiedi Funzionalità",
    "pt-BR": "Solicitar Funcionalidade",
  },
  resetGame: {
    "de-DE": "Spiel zurücksetzen",
    "en-US": "Reset Game",
    "es-MX": "Reiniciar Juego",
    "fr-FR": "Réinitialiser le Jeu",
    "it-IT": "Reimpostare il Gioco",
    "pt-BR": "Reiniciar Jogo",
  },
  [Responses.Block]: {
    "de-DE": "Blockieren",
    "en-US": "Block",
    "es-MX": "Bloquear",
    "fr-FR": "Bloquer",
    "it-IT": "Blocca",
    "pt-BR": "Bloquear",
  },
  [Responses.Challenge]: {
    "de-DE": "Herausforderung",
    "en-US": "Challenge",
    "es-MX": "Desafío",
    "fr-FR": "Défi",
    "it-IT": "Sfida",
    "pt-BR": "Desafio",
  },
  [Responses.Pass]: {
    "de-DE": "Passieren",
    "en-US": "Pass",
    "es-MX": "Pasar",
    "fr-FR": "Passer",
    "it-IT": "Passa",
    "pt-BR": "Passar",
  },
  revealInfluence: {
    "de-DE": "Enthülle {{primaryInfluence}}",
    "en-US": "Reveal {{primaryInfluence}}",
    "es-MX": "Revelar {{primaryInfluence}}",
    "fr-FR": "Révéler {{primaryInfluence}}",
    "it-IT": "Rivelare {{primaryInfluence}}",
    "pt-BR": "Revelar {{primaryInfluence}}",
  },
  reviveAnInfluence: {
    "de-DE": "Belebe einen Einfluss wieder",
    "en-US": "Revive an influence",
    "es-MX": "Revivir una influencia",
    "fr-FR": "Réanimer une influence",
    "it-IT": "Rivivere un'influenza",
    "pt-BR": "Reviver uma influência",
  },
  room: {
    "de-DE": "Raum",
    "en-US": "Room",
    "es-MX": "Sala",
    "fr-FR": "Salle",
    "it-IT": "Stanza",
    "pt-BR": "Sala",
  },
  rules: {
    "de-DE": "Regeln",
    "en-US": "Rules",
    "es-MX": "Reglas",
    "fr-FR": "Règles",
    "it-IT": "Regole",
    "pt-BR": "Regras",
  },
  rulesActions: {
    "de-DE": "Die Spieler führen abwechselnd eine der folgenden verfügbaren Aktionen aus:",
    "en-US": "Players take turns performing one of these available actions:",
    "es-MX": "Los jugadores se turnan para realizar una de estas acciones disponibles:",
    "fr-FR": "Les joueurs jouent à tour de rôle en effectuant l'une des actions disponibles suivantes :",
    "it-IT": "I giocatori si alternano nell'eseguire una delle seguenti azioni disponibili:",
    "pt-BR": "Os jogadores se revezam realizando uma das seguintes ações disponíveis:",
  },
  rulesAmbassador: {
    "de-DE": "Kann zwei Münzen von einem anderen Spieler stehlen und Blockieren von Diebstahlversuchen.",
    "en-US": "Can Exchange your Influence cards with new ones from the deck and Block stealing attempts.",
    "es-MX": "Puede intercambiar sus cartas de influencia por nuevas del mazo y bloquear intentos de robo.",
    "fr-FR": "Peut échanger vos cartes d'influence avec de nouvelles du paquet et bloquer les tentatives de vol.",
    "it-IT": "Può scambiare le tue carte di influenza con nuove dal mazzo e bloccare i tentativi di furto.",
    "pt-BR": "Pode trocar suas cartas de influência por novas do baralho e bloquear tentativas de roubo."
  },
  rulesAssassin: {
    "de-DE": "Kann einen Spieler zwingen, eine Einflusskarte aufzugeben.",
    "en-US": "Can Force one player to give up an Influence card.",
    "es-MX": "Puede forzar a un jugador a renunciar a una carta de influencia.",
    "fr-FR": "Peut forcer un joueur à renoncer à une carte d'influence.",
    "it-IT": "Può costringere un giocatore a rinunciare a una carta di influenza.",
    "pt-BR": "Pode forçar um jogador a desistir de uma carta de influência."
  },
  rulesAssassinate: {
    "de-DE": "Kostet drei Münzen. Zwingt einen Spieler, eine Einflusskarte ihrer Wahl aufzugeben. Kann herausgefordert werden. Kann von der Contessa blockiert werden.",
    "en-US": "Costs three coins. Force one player to give up an Influence card of their choice. Can be Challenged. Can be Blocked by the Contessa.",
    "es-MX": "Cuesta tres monedas. Obliga a un jugador a renunciar a una carta de influencia de su elección. Puede ser desafiado. Puede ser bloqueado por la Condesa.",
    "fr-FR": "Coûte trois pièces. Force un joueur à renoncer à une carte d'influence de son choix. Peut être contesté. Peut être bloqué par la Comtesse.",
    "it-IT": "Costa tre monete. Costringe un giocatore a rinunciare a una carta di influenza a sua scelta. Può essere sfidato. Può essere bloccato dalla Contessa.",
    "pt-BR": "Custa três moedas. Força um jogador a desistir de uma carta de influência de sua escolha. Pode ser desafiado. Pode ser bloqueado pela Condessa."
  },
  rulesBlock: {
    "de-DE": "Wenn ein anderer Spieler eine Aktion ausführt, die blockiert werden kann, kann der betroffene Spieler oder jeder im Falle von Auswärtshilfe es blockieren, indem er vorgibt, die richtige Figur auf einer seiner Einflusskarten zu haben. Der ausführende Spieler kann die Aktion nicht ausführen und unternimmt in dieser Runde keine weiteren Aktionen. Jeder Spieler kann sich entscheiden, den blockierenden Spieler herauszufordern. Wenn sie die Herausforderung gewinnen, wird die Aktion wie gewohnt durchgeführt.",
    "en-US": "If another player takes an action that can be Blocked, the targeted player, or anyone in the case of Foreign Aid, may Block it by claiming to have the proper character on one of their Influence cards. The acting player cannot perform the action and takes no other action this turn. Any player may choose to Challenge the Blocking player. If they win the Challenge, the action goes through as normal.",
    "es-MX": "Si otro jugador realiza una acción que puede ser bloqueada, el jugador objetivo, o cualquier jugador en el caso de Ayuda Extranjera, puede bloquearla afirmando tener el personaje adecuado en una de sus cartas de influencia. El jugador que actúa no puede realizar la acción y no realiza ninguna otra acción en este turno. Cualquier jugador puede optar por desafiar al jugador que bloquea. Si ganan el desafío, la acción se lleva a cabo como de costumbre.",
    "fr-FR": "Si un autre joueur effectue une action qui peut être bloquée, le joueur ciblé, ou n'importe qui dans le cas de l'Aide Étrangère, peut la bloquer en prétendant avoir le personnage approprié sur l'une de ses cartes d'influence. Le joueur agissant ne peut pas effectuer l'action et ne prend aucune autre action ce tour-ci. Tout joueur peut choisir de défier le joueur qui bloque. S'ils gagnent le défi, l'action se déroule normalement.",
    "it-IT": "Se un altro giocatore compie un'azione che può essere bloccata, il giocatore bersaglio, o chiunque nel caso dell'Aiuto Estero, può bloccarla affermando di avere il personaggio corretto su una delle loro carte di influenza. Il giocatore attivo non può eseguire l'azione e non compie altre azioni in questo turno. Qualsiasi giocatore può scegliere di sfidare il giocatore che blocca. Se vincono la sfida, l'azione procede come al solito.",
    "pt-BR": "Se outro jogador realizar uma ação que pode ser bloqueada, o jogador alvo, ou qualquer um no caso de Ajuda Estrangeira, pode bloqueá-la afirmando ter o personagem adequado em uma de suas cartas de influência. O jogador atuante não pode realizar a ação e não realiza nenhuma outra ação neste turno. Qualquer jogador pode optar por desafiar o jogador que bloqueia. Se vencerm o desafio, a ação prossegue normalmente."
  },
  rulesCaptain: {
    "de-DE": "Kann zwei Münzen von einem anderen Spieler stehlen und Blockieren von Diebstahlversuchen.",
    "en-US": "Can Steal two coins from another player and Block stealing attempts.",
    "es-MX": "Puede robar dos monedas de otro jugador y bloquear intentos de robo.",
    "fr-FR": "Peut voler deux pièces à un autre joueur et bloquer les tentatives de vol.",
    "it-IT": "Può rubare due monete da un altro giocatore e bloccare i tentativi di furto.",
    "pt-BR": "Pode roubar duas moedas de outro jogador e bloquear tentativas de roubo."
  },
  rulesChallenge: {
    "de-DE": "Wenn der ausführende Spieler seine Aktion erklärt, kann jeder andere Spieler die Herausforderung annehmen, indem er sagt: \"Ich glaube nicht, dass du die richtige Figur dafür hast.\" Der ausführende Spieler muss nun beweisen, dass er die Macht hat, die Aktion auszuführen, oder die Herausforderung verlieren. Wenn sie die richtige Figur haben, decken sie sie auf und legen die aufgedeckte Karte zurück in den Stapel. Sie mischen dann den Stapel und ziehen eine neue Karte. Der herausfordernde Spieler hat die Herausforderung verloren. Wenn sie nicht die richtige Figur haben, verlieren sie die Herausforderung.",
    "en-US": 'When the acting player declares their action, any other player may Challenge their right to take the action. They are saying "I don\'t believe you have the proper character to do that." The acting player now must prove they have the power to take the action or lose the Challenge. If they have the right character, they reveal it and place the revealed card back in the deck. They then shuffle the deck and draw a new card. The Challenging player has lost the Challenge. If they do not have the proper character, they lose the Challenge.',
    "es-MX": "Cuando el jugador que actúa declara su acción, cualquier otro jugador puede desafiar su derecho a realizar la acción. Están diciendo \"No creo que tengas el personaje adecuado para hacer eso.\" El jugador que actúa ahora debe demostrar que tiene el poder para realizar la acción o perder el desafío. Si tienen el personaje correcto, lo revelan y colocan la carta revelada de vuelta en el mazo. Luego barajan el mazo y roban una nueva carta. El jugador que desafía ha perdido el desafío. Si no tienen el personaje adecuado, pierden el desafío.",
    "fr-FR": "Lorsque le joueur agissant déclare son action, tout autre joueur peut contester son droit à cette action. Ils disent \"Je ne crois pas que vous ayez le personnage approprié pour faire cela.\" Le joueur agissant doit maintenant prouver qu'il a le pouvoir de réaliser l'action ou perdre le défi. S'ils ont le bon personnage, ils le révèlent et placent la carte révélée dans le paquet. Ils mélangent ensuite le paquet et piochent une nouvelle carte. Le joueur qui conteste a perdu le défi. S'ils n'ont pas le personnage approprié, ils perdent le défi.",
    "it-IT": "Quando il giocatore attivo dichiara la sua azione, qualsiasi altro giocatore può sfidare il suo diritto a compiere l'azione. Stanno dicendo \"Non credo che tu abbia il personaggio giusto per farlo.\" Il giocatore attivo ora deve dimostrare di avere il potere di compiere l'azione o perdere la sfida. Se hanno il personaggio giusto, lo rivelano e pongono la carta rivelata di nuovo nel mazzo. Poi mescolano il mazzo e pescano una nuova carta. Il giocatore che sfida ha perso la sfida. Se non hanno il personaggio giusto, perdono la sfida.",
    "pt-BR": "Quando o jogador atuante declara sua ação, qualquer outro jogador pode desafiar seu direito de realizar a ação. Eles estão dizendo \"Eu não acredito que você tenha o personagem adequado para fazer isso.\" O jogador atuante agora deve provar que tem o poder de realizar a ação ou perder o desafio. Se eles tiverem o personagem certo, eles o revelam e colocam a carta revelada de volta no baralho. Em seguida, eles embaralham o baralho e compram uma nova carta. O jogador desafiador perdeu o desafio. Se eles não tiverem o personagem adequado, eles perdem o desafio."
  },
  rulesContents: {
    "de-DE": "Deck von Einflusskarten, Bank von Münzen.",
    "en-US": "Deck of influence cards, bank of coins.",
    "es-MX": "Mazo de cartas de influencia, banco de monedas.",
    "fr-FR": "Paquet de cartes d'influence, banque de pièces.",
    "it-IT": "Mazzo di carte d'influenza, banca di monete.",
    "pt-BR": "Baralho de cartas de influência, banco de moedas."
  },
  rulesContessa: {
    "de-DE": "Kann Attentate blockieren.",
    "en-US": "Can Block assassination attempts.",
    "es-MX": "Puede bloquear intentos de asesinato.",
    "fr-FR": "Peut bloquer les tentatives d'assassinat.",
    "it-IT": "Può bloccare i tentativi di assassinio.",
    "pt-BR": "Pode bloquear tentativas de assassinato."
  },
  rulesCoup: {
    "de-DE": "Kostet sieben Münzen. Zwingt einen Spieler, eine Einflusskarte aufzugeben. Kann nicht herausgefordert oder blockiert werden. Wenn du deinen Zug mit zehn oder mehr Münzen beginnst, musst du einen Putsch durchführen (oder wiederbeleben, wenn aktiviert).",
    "en-US": "Costs seven coins. Cause a player to give up an Influence card. Cannot be Challenged or Blocked. If you start your turn with ten or more coins, you must Coup (or Revive if enabled).",
    "es-MX": "Cuesta siete monedas. Obliga a un jugador a renunciar a una carta de influencia. No puede ser desafiado ni bloqueado. Si comienzas tu turno con diez o más monedas, debes realizar un golpe (o revivir si está habilitado).",
    "fr-FR": "Coûte sept pièces. Force un joueur à renoncer à une carte d'influence. Ne peut pas être contesté ni bloqué. Si vous commencez votre tour avec dix pièces ou plus, vous devez effectuer un coup (ou réanimer si activé).",
    "it-IT": "Costa sette monete. Costringe un giocatore a rinunciare a una carta di influenza. Non può essere sfidato o bloccato. Se inizi il tuo turno con dieci o più monete, devi effettuare un colpo di stato (o rivivere se abilitato).",
    "pt-BR": "Custa sete moedas. Faz com que um jogador desista de uma carta de influência. Não pode ser desafiado ou bloqueado. Se você começar seu turno com dez ou mais moedas, deve realizar um golpe (ou reviver se ativado)."
  },
  rulesDuke: {
    "de-DE": "Kann Steuern erheben und Auswärtshilfe blockieren.",
    "en-US": "Can Tax and Block Foreign Aid.",
    "es-MX": "Puede cobrar impuestos y bloquear Ayuda Extranjera.",
    "fr-FR": "Peut taxer et bloquer l'Aide Étrangère.",
    "it-IT": "Può tassare e bloccare l'Aiuto Estero.",
    "pt-BR": "Pode cobrar impostos e bloquear Ajuda Estrangeira."
  },
  rulesExchange: {
    "de-DE": "Ziehe zwei Karten vom Deck, schaue sie dir an und mische sie mit deinen aktuellen Einflusskarten. Lege zwei Karten zurück in den Stapel und mische den Stapel. Kann herausgefordert werden. Kann nicht blockiert werden.",
    "en-US": "Draw two Influence cards from the deck, look at them and mix them with your current Influence cards. Place two cards back in the deck and shuffle the deck. Can be Challenged. Cannot be Blocked.",
    "es-MX": "Robar dos cartas de influencia del mazo, mirarlas y mezclarlas con tus cartas de influencia actuales. Coloca dos cartas de vuelta en el mazo y baraja el mazo. Puede ser desafiado. No puede ser bloqueado.",
    "fr-FR": "Piochez deux cartes d'influence du paquet, regardez-les et mélangez-les avec vos cartes d'influence actuelles. Placez deux cartes dans le paquet et mélangez le paquet. Peut être contesté. Ne peut pas être bloqué.",
    "it-IT": "Pesca due carte di influenza dal mazzo, guardale e mischiale con le tue carte di influenza attuali. Rimetti due carte nel mazzo e mescola il mazzo. Può essere sfidato. Non può essere bloccato.",
    "pt-BR": "Puxe duas cartas de influência do baralho, olhe para elas e misture-as com suas cartas de influência atuais. Coloque duas cartas de volta no baralho e embaralhe o baralho. Pode ser desafiado. Não pode ser bloqueado."
  },
  rulesForeignAid: {
    "de-DE": "Nimm zwei Münzen aus der Bank. Kann nicht herausgefordert werden. Kann vom Herzog blockiert werden.",
    "en-US": "Take two coins from the bank. Cannot be Challenged. Can be Blocked by the Duke.",
    "es-MX": "Toma dos monedas del banco. No puede ser desafiado. Puede ser bloqueado por el Duque.",
    "fr-FR": "Prenez deux pièces de la banque. Ne peut pas être contesté. Peut être bloqué par le Duc.",
    "it-IT": "Prendi due monete dalla banca. Non può essere sfidato. Può essere bloccato dal Duca.",
    "pt-BR": "Pegue duas moedas do banco. Não pode ser desafiado. Pode ser bloqueado pelo Duque."
  },
  rulesGoal: {
    "de-DE": "Der einzige Spieler zu sein, der noch Einflusskarten hat.",
    "en-US": "To be the only player with any influence cards left.",
    "es-MX": "Ser el único jugador con cartas de influencia restantes.",
    "fr-FR": "Être le seul joueur avec des cartes d'influence restantes.",
    "it-IT": "Essere l'unico giocatore con carte di influenza rimaste.",
    "pt-BR": "Ser o único jogador com cartas de influência restantes."
  },
  rulesIncome: {
    "de-DE": "Nimm eine Münze aus der Bank. Kann nicht herausgefordert oder blockiert werden.",
    "en-US": "Take one coin from the bank. Cannot be Challenged or Blocked.",
    "es-MX": "Toma una moneda del banco. No puede ser desafiado ni bloqueado.",
    "fr-FR": "Prenez une pièce de la banque. Ne peut pas être contesté ni bloqué.",
    "it-IT": "Prendi una moneta dalla banca. Non può essere sfidato o bloccato.",
    "pt-BR": "Pegue uma moeda do banco. Não pode ser desafiado ou bloqueado."
  },
  rulesInfluences: {
    "de-DE": "Es gibt fünf verschiedene Charaktere im Einflussdeck.",
    "en-US": "There are five different characters in the influence deck.",
    "es-MX": "Hay cinco personajes diferentes en el mazo de influencia.",
    "fr-FR": "Il y a cinq personnages différents dans le paquet d'influence.",
    "it-IT": "Ci sono cinque personaggi diversi nel mazzo di influenza.",
    "pt-BR": "Existem cinco personagens diferentes no baralho de influência."
  },
  rulesLosingAChallenge: {
    "de-DE": "Jeder Spieler, der eine Herausforderung verliert, muss eine ihrer Einflusskarten aufdecken, damit alle sie sehen können. Wenn das ihre letzte Einflusskarte ist, scheiden sie aus dem Spiel aus.",
    "en-US": "Any player who loses a Challenge must turn one of their Influence cards face up for all to see. If that is their last Influence card, they are out of the game.",
    "es-MX": "Cualquier jugador que pierda un desafío debe voltear una de sus cartas de influencia boca arriba para que todos la vean. Si esa es su última carta de influencia, queda fuera del juego.",
    "fr-FR": "Tout joueur qui perd un défi doit retourner une de ses cartes d'influence face visible pour que tout le monde puisse la voir. Si c'est sa dernière carte d'influence, il est éliminé du jeu.",
    "it-IT": "Qualsiasi giocatore che perde una sfida deve girare una delle sue carte di influenza a faccia in su per farla vedere a tutti. Se quella è la sua ultima carta di influenza, è fuori dal gioco.",
    "pt-BR": "Qualquer jogador que perder um desafio deve virar uma de suas cartas de influência virada para cima para que todos vejam. Se essa for sua última carta de influência, ele está fora do jogo."
  },
  rulesLosingInfluence: {
    "de-DE": "Jedes Mal, wenn ein Spieler eine Einflusskarte verliert, wählt er aus, welche seiner Karten aufgedeckt wird.",
    "en-US": "Any time a player loses an Influence card, they choose which of their cards to reveal.",
    "es-MX": "Cada vez que un jugador pierde una carta de influencia, elige cuál de sus cartas revelar.",
    "fr-FR": "Chaque fois qu'un joueur perd une carte d'influence, il choisit quelle carte révéler.",
    "it-IT": "Ogni volta che un giocatore perde una carta di influenza, sceglie quale delle sue carte rivelare.",
    "pt-BR": "Sempre que um jogador perder uma carta de influência, ele escolhe qual de suas cartas revelar."
  },
  rulesRevive: {
    "de-DE": "Nicht im Standardspiel verfügbar, kann aber beim Erstellen eines neuen Spiels aktiviert werden. Kostet zehn Münzen. Belebt eine Einflusskarte aus dem Ablagestapel wieder. Kann nicht herausgefordert oder blockiert werden.",
    "en-US": "Not available in the standard game but can be enabled when creating a new game. Costs ten coins. Revive an Influence card from the discard pile. Cannot be Challenged or Blocked.",
    "es-MX": "No está disponible en el juego estándar, pero se puede habilitar al crear un nuevo juego. Cuesta diez monedas. Revive una carta de influencia del montón de descarte. No puede ser desafiado ni bloqueado.",
    "fr-FR": "Non disponible dans le jeu standard mais peut être activé lors de la création d'un nouveau jeu. Coûte dix pièces. Réanime une carte d'influence de la pile de défausse. Ne peut pas être contesté ni bloqué.",
    "it-IT": "Non disponibile nel gioco standard ma può essere abilitato durante la creazione di un nuovo gioco. Costa dieci monete. Rivive una carta di influenza dalla pila degli scarti. Non può essere sfidato o bloccato.",
    "pt-BR": "Não disponível no jogo padrão, mas pode ser ativado ao criar um novo jogo. Custa dez moedas. Revive uma carta de influência da pilha de descarte. Não pode ser desafiado ou bloqueado."
  },
  rulesSetup: {
    "de-DE": "Mische die Karten und verteile zwei an jeden Spieler. Die Spieler sollten ihre Karten ansehen, aber sie vor allen anderen verstecken. Jeder Spieler nimmt zwei Münzen aus der Bank als Startvermögen. In einem Spiel mit nur zwei Spielern beginnt der Startspieler mit einer Münze anstelle von zwei.",
    "en-US": "Shuffle the cards and deal two to each player. Players should look at their cards but keep them hidden from everyone else. Each player takes two coins from the bank as their starting wealth. In a game with only two players, the starting player begins the game with one coin instead of two.",
    "es-MX": "Baraja las cartas y reparte dos a cada jugador. Los jugadores deben mirar sus cartas pero mantenerlas ocultas de los demás. Cada jugador toma dos monedas del banco como su riqueza inicial. En un juego con solo dos jugadores, el jugador inicial comienza el juego con una moneda en lugar de dos.",
    "fr-FR": "Mélangez les cartes et distribuez-en deux à chaque joueur. Les joueurs doivent regarder leurs cartes mais les garder cachées des autres. Chaque joueur prend deux pièces de la banque comme richesse de départ. Dans un jeu à deux joueurs, le joueur de départ commence avec une pièce au lieu de deux.",
    "it-IT": "Mescola le carte e distribuiscine due a ciascun giocatore. I giocatori dovrebbero guardare le loro carte ma tenerle nascoste agli altri. Ogni giocatore prende due monete dalla banca come ricchezza iniziale. In una partita con solo due giocatori, il giocatore iniziale inizia il gioco con una moneta invece di due.",
    "pt-BR": "Embaralhe as cartas e distribua duas para cada jogador. Os jogadores devem olhar suas cartas, mas mantê-las escondidas dos outros. Cada jogador pega duas moedas do banco como sua riqueza inicial. Em um jogo com apenas dois jogadores, o jogador inicial começa o jogo com uma moeda em vez de duas."
  },
  rulesSteal: {
    "de-DE": "Nimm zwei Münzen von einem anderen Spieler. Kann herausgefordert werden. Kann von Kapitän oder Botschafter blockiert werden.",
    "en-US": "Take two coins from another player. Can be Challenged. Can be Blocked by Captain or Ambassador.",
    "es-MX": "Toma dos monedas de otro jugador. Puede ser desafiado. Puede ser bloqueado por el Capitán o el Embajador.",
    "fr-FR": "Prenez deux pièces à un autre joueur. Peut être contesté. Peut être bloqué par le Capitaine ou l'Ambassadeur.",
    "it-IT": "Prendi due monete da un altro giocatore. Può essere sfidato. Può essere bloccato da Capitano o Ambasciatore.",
    "pt-BR": "Pegue duas moedas de outro jogador. Pode ser desafiado. Pode ser bloqueado pelo Capitão ou pelo Embaixador."
  },
  rulesTax: {
    "de-DE": "Nimm drei Münzen aus der Bank. Kann herausgefordert werden. Kann nicht blockiert werden.",
    "en-US": "Take three coins from the bank. Can be Challenged. Cannot be Blocked.",
    "es-MX": "Toma tres monedas del banco. Puede ser desafiado. No puede ser bloqueado.",
    "fr-FR": "Prenez trois pièces de la banque. Peut être contesté. Ne peut pas être bloqué.",
    "it-IT": "Prendi tre monete dalla banca. Può essere sfidato. Non può essere bloccato.",
    "pt-BR": "Pegue três moedas do banco. Pode ser desafiado. Não pode ser bloqueado."
  },
  send: {
    "de-DE": "Senden",
    "en-US": "Send",
    "es-MX": "Enviar",
    "fr-FR": "Envoyer",
    "it-IT": "Invia",
    "pt-BR": "Enviar"
  },
  settings: {
    "de-DE": "Einstellungen",
    "en-US": "Settings",
    "es-MX": "Configuraciones",
    "fr-FR": "Paramètres",
    "it-IT": "Impostazioni",
    "pt-BR": "Configurações"
  },
  setup: {
    "de-DE": "Einrichten",
    "en-US": "Setup",
    "es-MX": "Configuración",
    "fr-FR": "Configuration",
    "it-IT": "Impostazione",
    "pt-BR": "Configuração"
  },
  showChickens: {
    "de-DE": "Hühner anzeigen",
    "en-US": "Show Chickens",
    "es-MX": "Mostrar Pollos",
    "fr-FR": "Afficher les Poules",
    "it-IT": "Mostra Polli",
    "pt-BR": "Mostrar Galinhas"
  },
  skepticism: {
    "de-DE": "Skepsis",
    "en-US": "Skepticism",
    "es-MX": "Escepticismo",
    "fr-FR": "Scepticisme",
    "it-IT": "Scetticismo",
    "pt-BR": "Ceticismo"
  },
  spectateGame: {
    "de-DE": "Spiel beobachten",
    "en-US": "Spectate Game",
    "es-MX": "Observar Juego",
    "fr-FR": "Regarder le Jeu",
    "it-IT": "Osserva il Gioco",
    "pt-BR": "Assistir Jogo"
  },
  startGame: {
    "de-DE": "Spiel starten",
    "en-US": "Start Game",
    "es-MX": "Iniciar Juego",
    "fr-FR": "Démarrer le Jeu",
    "it-IT": "Inizia Gioco",
    "pt-BR": "Iniciar Jogo"
  },
  startingPlayerBeginsWith1Coin: {
    "de-DE": "2-Spieler-Spiel, der Startspieler beginnt mit 1 Münze",
    "en-US": "2 player game, starting player will begin with 1 coin",
    "es-MX": "Juego de 2 jugadores, el jugador inicial comenzará con 1 moneda",
    "fr-FR": "Jeu à 2 joueurs, le joueur de départ commencera avec 1 pièce",
    "it-IT": "Partita a 2 giocatori, il giocatore iniziale inizierà con 1 moneta",
    "pt-BR": "Jogo de 2 jogadores, o jogador inicial começará com 1 moeda"
  },
  steal2CoinsFromSomeone: {
    "de-DE": "Stehle 2 Münzen von jemandem",
    "en-US": "Steal 2 coins from someone",
    "es-MX": "Robar 2 monedas de alguien",
    "fr-FR": "Voler 2 pièces à quelqu'un",
    "it-IT": "Ruba 2 monete a qualcuno",
    "pt-BR": "Roubar 2 moedas de alguém"
  },
  system: {
    "de-DE": "System",
    "en-US": "System",
    "es-MX": "Sistema",
    "fr-FR": "Système",
    "it-IT": "Sistema",
    "pt-BR": "Sistema"
  },
  title: {
    "de-DE": "Coup",
    "en-US": "Coup",
    "es-MX": "Coup",
    "fr-FR": "Coup",
    "it-IT": "Coup",
    "pt-BR": "Coup"
  },
  vengefulness: {
    "de-DE": "Rachsucht",
    "en-US": "Vengefulness",
    "es-MX": "Venganza",
    "fr-FR": "Vengeance",
    "it-IT": "Vendetta",
    "pt-BR": "Vingança"
  },
  waitingOnOtherPlayers: {
    "de-DE": "Warte auf andere Spieler",
    "en-US": "Waiting on Other Players",
    "es-MX": "Esperando a otros jugadores",
    "fr-FR": "En attente des autres joueurs",
    "it-IT": "In attesa di altri giocatori",
    "pt-BR": "Aguardando outros jogadores"
  },
  websocketsConnection: {
    "de-DE": "WebSockets-Verbindung",
    "en-US": "WebSockets Connection",
    "es-MX": "Conexión WebSockets",
    "fr-FR": "Connexion WebSockets",
    "it-IT": "Connessione WebSockets",
    "pt-BR": "Conexão WebSockets"
  },
  welcomeToCoup: {
    "de-DE": "Willkommen zu Coup!",
    "en-US": "Welcome To Coup!",
    "es-MX": "¡Bienvenido a Coup!",
    "fr-FR": "Bienvenue dans Coup !",
    "it-IT": "Benvenuto in Coup!",
    "pt-BR": "Bem-vindo ao Coup!"
  },
  whatIsBotsName: {
    "de-DE": "Wie heißt der Bot?",
    "en-US": "What is its name?",
    "es-MX": "¿Cuál es su nombre?",
    "fr-FR": "Quel est son nom ?",
    "it-IT": "Qual è il suo nome?",
    "pt-BR": "Qual é o nome dele?"
  },
  whatIsYourName: {
    "de-DE": "Wie heißt du?",
    "en-US": "What is your name?",
    "es-MX": "¿Cuál es tu nombre?",
    "fr-FR": "Quel est votre nom ?",
    "it-IT": "Qual è il tuo nome?",
    "pt-BR": "Qual é o seu nome?"
  },
  writeNewMessage: {
    "de-DE": "Neue Nachricht schreiben",
    "en-US": "Write New Message",
    "es-MX": "Escribir nuevo mensaje",
    "fr-FR": "Écrire un nouveau message",
    "it-IT": "Scrivi Nuovo Messaggio",
    "pt-BR": "Escrever nova mensagem"
  },
  youAreSpectating: {
    "de-DE": "Du beobachtest das Spiel",
    "en-US": "You are Spectating",
    "es-MX": "Estás observando el juego",
    "fr-FR": "Vous êtes en train de regarder",
    "it-IT": "Stai assistendo",
    "pt-BR": "Você está assistindo",
  },
}

export default translations
