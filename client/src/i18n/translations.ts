import { Actions, EventMessages, Influences, Responses } from "@shared"
import { AvailableLanguageCode } from "./availableLanguages"

type ActionMessages = {
  [Actions.Assassinate]: string;
  [Actions.Coup]: string;
  [Actions.Exchange]: string;
  [Actions.ForeignAid]: string;
  [Actions.Income]: string;
  [Actions.Steal]: string;
  [Actions.Tax]: string;
};

export type Translations = ActionMessages & {
  action: string;
  actions: string;
  add: string;
  addAiPlayer: string;
  addPlayersToStartGame: string;
  anyone: string;
  block: string;
  blockAsInfluence: string;
  briefDescriptionOfCoup: string;
  cancel: string;
  cardCountInDeck: string;
  challenge: string;
  chat: string;
  cheatSheet: string;
  chooseATarget: string;
  chooseAnAction: string;
  chooseInfluenceToLose: string;
  chooseInfluenceToReveal: string;
  chooseInfluencesToKeep: string;
  choosePersonality: string;
  claimAnInfluence: string;
  close: string;
  collectCoins: string;
  colorMode: string;
  confirm: string;
  confirmActions: string;
  contents: string;
  copyInviteLink: string;
  createGame: string;
  createNewGame: string;
  draw2InfluencesAndDiscard2: string;
  dark: string;
  effect: string;
  eventLog: string;
  eventLogRetentionTurns: string;
  [EventMessages.ActionConfirm]: ActionMessages;
  [EventMessages.ActionPending]: Partial<ActionMessages>;
  [EventMessages.ActionProcessed]: ActionMessages;
  [EventMessages.BlockFailed]: string;
  [EventMessages.BlockPending]: string;
  [EventMessages.BlockSuccessful]: string;
  [EventMessages.ChallengeFailed]: string;
  [EventMessages.ChallengePending]: string;
  [EventMessages.ChallengeSuccessful]: string;
  [EventMessages.GameStarted]: string;
  [EventMessages.PlayerDied]: string;
  [EventMessages.PlayerForfeited]: string;
  [EventMessages.PlayerLostInfluence]: string;
  [EventMessages.PlayerReplacedInfluence]: string;
  [EventMessages.PlayerReplacedWithAi]: string;
  forfeit: string;
  forfeitConfirmationMessage: string;
  forfeitConfirmationTitle: string;
  forfeitKillInfluences: string;
  forfeitNotPossible: string;
  forfeitReplaceWithAi: string;
  fullRules: string;
  gameNotFound: string;
  goal: string;
  home: string;
  honesty: string;
  influence: string;
  influenceWasClaimed: string;
  influences: string;
  [Influences.Ambassador]: string;
  [Influences.Assassin]: string;
  [Influences.Captain]: string;
  [Influences.Contessa]: string;
  [Influences.Duke]: string;
  inviteLinkCopied: string;
  joinExistingGame: string;
  joinGame: string;
  keepInfluences: string;
  killAnInfluence: string;
  language: string;
  light: string;
  loseInfluence: string;
  losingAChallenge: string;
  losingInfluence: string;
  messageWasDeleted: string;
  noChatMessages: string;
  notEnoughCoins: string;
  numberOfPlayers: string;
  pageNotFound: string;
  payCoins: string;
  personalityIsHidden: string;
  playAgain: string;
  playerTurn: string;
  playerWantToReset: string;
  playerWins: string;
  random: string;
  reportBug: string;
  requestFeature: string;
  resetGame: string;
  [Responses.Block]: string;
  [Responses.Challenge]: string;
  [Responses.Pass]: string;
  revealInfluence: string;
  room: string;
  rules: string;
  rulesActions: string;
  rulesAmbassador: string;
  rulesAssassin: string;
  rulesAssassinate: string;
  rulesBlock: string;
  rulesCaptain: string;
  rulesChallenge: string;
  rulesContents: string;
  rulesContessa: string;
  rulesCoup: string;
  rulesDuke: string;
  rulesExchange: string;
  rulesForeignAid: string;
  rulesGoal: string;
  rulesIncome: string;
  rulesInfluences: string;
  rulesLosingAChallenge: string;
  rulesLosingInfluence: string;
  rulesSetup: string;
  rulesSteal: string;
  rulesTax: string;
  send: string;
  settings: string;
  setup: string;
  skepticism: string;
  startGame: string;
  startingPlayerBeginsWith1Coin: string;
  steal2CoinsFromSomeone: string;
  system: string;
  title: string;
  vengefulness: string;
  waitingOnOtherPlayers: string;
  websocketsConnection: string;
  welcomeToCoup: string;
  whatIsBotsName: string;
  whatIsYourName: string;
  writeNewMessage: string;
  youAreSpectating: string;
};

const translations: { [key in AvailableLanguageCode]: Translations } = {
  "de-DE": {
    action: "Aktion",
    actions: "Aktionen",
    [Actions.Assassinate]: "Attentat",
    [Actions.Coup]: "Putsch",
    [Actions.Exchange]: "Austausch",
    [Actions.ForeignAid]: "Auslandshilfe",
    [Actions.Income]: "Einkommen",
    [Actions.Steal]: "Stehlen",
    [Actions.Tax]: "Steuern",
    add: "Hinzufügen",
    addAiPlayer: "KI-Spieler hinzufügen",
    addPlayersToStartGame:
      "Füge mindestens einen weiteren Spieler hinzu, um das Spiel zu starten",
    anyone: "Jeder",
    block: "Blocken",
    blockAsInfluence: "Blocken als {{primaryInfluence}}",
    briefDescriptionOfCoup:
      "Das Spiel der Täuschung, Deduktion und des Glücks.",
    cancel: "Abbrechen",
    cardCountInDeck: "{{count}} Karte{{plural[[n]]}} im Deck",
    challenge: "Herausfordern",
    chat: "Chat",
    cheatSheet: "Spickzettel",
    chooseATarget: "Wähle ein Ziel",
    chooseAnAction: "Wähle eine Aktion",
    chooseInfluenceToLose:
      "Wähle eine Einflusskarte, die du verlieren möchtest",
    chooseInfluenceToReveal:
      "Wähle eine Einflusskarte, die du aufdecken möchtest",
    chooseInfluencesToKeep:
      "Wähle {{count}} Einflusskarte{{plural[[n]]}}, die du behalten möchtest",
    choosePersonality: "Wähle eine Persönlichkeit",
    claimAnInfluence: "Beanspruche eine Einflusskarte",
    close: "Schließen",
    collectCoins: "Sammle {{count}} Münze{{plural[[n]]}}",
    colorMode: "Farbmodus",
    confirm: "Bestätigen",
    confirmActions: "Aktionen bestätigen",
    contents: "Inhalt",
    copyInviteLink: "Einladungslink kopieren",
    createGame: "Spiel erstellen",
    createNewGame: "Neues Spiel erstellen",
    dark: "Dunkel",
    draw2InfluencesAndDiscard2: "Ziehe 2 Einflusskarten & lege 2 ab",
    effect: "Effekt",
    eventLog: "Ereignisprotokoll",
    eventLogRetentionTurns: "Aufbewahrungsdauer der Ereignisprotokolle (Züge)",
    [EventMessages.ActionConfirm]: {
      [Actions.Assassinate]: "{{action[[Attentat]]}} {{secondaryPlayer}}",
      [Actions.Coup]: "{{action[[Putsch]]}} {{secondaryPlayer}}",
      [Actions.Exchange]: "{{action[[Austausch]]}} von Einflusskarten",
      [Actions.ForeignAid]: "{{action[[Auslandshilfe]]}} erhalten",
      [Actions.Income]: "{{action[[Einkommen]]}} erhalten",
      [Actions.Steal]: "{{action[[Stehlen]]}} von {{secondaryPlayer}}",
      [Actions.Tax]: "{{action[[Steuern]]}} erhalten",
    },
    [EventMessages.ActionPending]: {
      [Actions.Assassinate]:
        "{{primaryPlayer}} versucht, {{secondaryPlayer}} zu {{action[[Attentat]]}}",
      [Actions.Exchange]:
        "{{primaryPlayer}} versucht, Einflusskarten {{action[[Austausch]]}}",
      [Actions.ForeignAid]:
        "{{primaryPlayer}} versucht, {{action[[Auslandshilfe]]}} zu erhalten",
      [Actions.Steal]:
        "{{primaryPlayer}} versucht, von {{secondaryPlayer}} zu {{action[[Stehlen]]}}",
      [Actions.Tax]:
        "{{primaryPlayer}} versucht, {{action[[Steuern]]}} zu erhalten",
    },
    [EventMessages.ActionProcessed]: {
      [Actions.Assassinate]:
        "{{primaryPlayer}} hat {{secondaryPlayer}} {{action[[Attentat]]}}",
      [Actions.Coup]:
        "{{primaryPlayer}} hat {{secondaryPlayer}} {{action[[Geputscht]]}}",
      [Actions.Exchange]:
        "{{primaryPlayer}} hat Einflusskarten {{action[[Ausgetauscht]]}}",
      [Actions.ForeignAid]:
        "{{primaryPlayer}} hat {{action[[Auslandshilfe]]}} erhalten",
      [Actions.Income]:
        "{{primaryPlayer}} hat {{action[[Einkommen]]}} erhalten",
      [Actions.Steal]:
        "{{primaryPlayer}} hat von {{secondaryPlayer}} {{action[[Gestohlen]]}}",
      [Actions.Tax]: "{{primaryPlayer}} hat {{action[[Steuern]]}} erhalten",
    },
    [EventMessages.BlockFailed]:
      "{{primaryPlayer}} konnte {{secondaryPlayer}} nicht blocken",
    [EventMessages.BlockPending]:
      "{{primaryPlayer}} versucht, {{secondaryPlayer}} als {{primaryInfluence}} zu blocken",
    [EventMessages.BlockSuccessful]:
      "{{primaryPlayer}} hat {{secondaryPlayer}} erfolgreich geblockt",
    [EventMessages.ChallengeFailed]:
      "{{primaryPlayer}} konnte {{secondaryPlayer}} nicht herausfordern",
    [EventMessages.ChallengePending]:
      "{{primaryPlayer}} fordert {{secondaryPlayer}} heraus",
    [EventMessages.ChallengeSuccessful]:
      "{{primaryPlayer}} hat {{secondaryPlayer}} erfolgreich herausgefordert",
    [EventMessages.GameStarted]: "Das Spiel hat begonnen",
    [EventMessages.PlayerDied]: "{{primaryPlayer}} ist raus!",
    [EventMessages.PlayerForfeited]:
      "{{primaryPlayer}} hat das Spiel aufgegeben!",
    [EventMessages.PlayerLostInfluence]:
      "{{primaryPlayer}} hat seine/ihre {{primaryInfluence}} verloren",
    [EventMessages.PlayerReplacedInfluence]:
      "{{primaryPlayer}} hat {{primaryInfluence}} aufgedeckt und ersetzt",
    [EventMessages.PlayerReplacedWithAi]:
      "{{primaryPlayer}} wurde durch einen KI-Spieler ersetzt",
    forfeit: "Aufgeben",
    forfeitConfirmationMessage:
      "Möchtest du deine Einflusskarten töten oder dich durch einen KI-Spieler ersetzen?",
    forfeitConfirmationTitle: "Spiel aufgeben",
    forfeitKillInfluences: "Einflusskarten töten",
    forfeitNotPossible: "Du kannst das Spiel gerade nicht aufgeben",
    forfeitReplaceWithAi: "Durch KI ersetzen",
    fullRules: "Vollständige Regeln",
    gameNotFound: "Spiel nicht gefunden",
    goal: "Ziel",
    home: "Startseite",
    honesty: "Ehrlichkeit",
    influence: "Einfluss",
    influenceWasClaimed: "{{primaryInfluence}} wurde beansprucht",
    influences: "Einflusskarten",
    [Influences.Ambassador]: "Botschafter",
    [Influences.Assassin]: "Attentäter",
    [Influences.Captain]: "Hauptmann",
    [Influences.Contessa]: "Gräfin",
    [Influences.Duke]: "Herzog",
    inviteLinkCopied: "Einladungslink kopiert",
    joinExistingGame: "Vorhandenem Spiel beitreten",
    joinGame: "Spiel beitreten",
    keepInfluences:
      "Behalte {{primaryInfluence}}{{plural[[ und {{secondaryInfluence}}]]}}",
    killAnInfluence: "Eine Einflusskarte eliminieren",
    language: "Sprache",
    light: "Hell",
    loseInfluence: "Verliere {{primaryInfluence}}",
    losingAChallenge: "Eine Herausforderung verlieren",
    losingInfluence: "Einfluss verlieren",
    messageWasDeleted: "Nachricht wurde gelöscht",
    noChatMessages: "Keine Chatnachrichten",
    notEnoughCoins: "Nicht genügend Münzen",
    numberOfPlayers: "Anzahl der Spieler",
    pageNotFound: "Seite nicht gefunden",
    payCoins: "Zahle {{count}} Münze{{plural[[n]]}}",
    personalityIsHidden: "Persönlichkeit ist verborgen",
    playAgain: "Nochmal spielen",
    playerTurn: "{{primaryPlayer}} ist an der Reihe",
    playerWantToReset: "{{primaryPlayer}} möchte das Spiel zurücksetzen",
    playerWins: "{{primaryPlayer}} gewinnt!",
    random: "Zufällig",
    reportBug: "Fehler melden",
    requestFeature: "Funktion anfragen",
    resetGame: "Spiel zurücksetzen",
    [Responses.Block]: "Blocken",
    [Responses.Challenge]: "Herausfordern",
    [Responses.Pass]: "Passen",
    revealInfluence: "Decke {{primaryInfluence}} auf",
    room: "Raum",
    rules: "Regeln",
    rulesActions:
      "Die Spieler führen abwechselnd eine dieser verfügbaren Aktionen aus:",
    rulesAmbassador:
      "Kann deine Einflusskarten mit neuen aus dem Deck tauschen und Stehlversuche blocken.",
    rulesAssassin:
      "Kann einen Spieler zwingen, eine seiner Einflusskarten abzugeben.",
    rulesAssassinate:
      "Kostet drei Münzen. Zwinge einen Spieler, eine Einflusskarte seiner Wahl abzugeben. Kann herausgefordert werden. Kann von der Gräfin geblockt werden.",
    rulesBlock:
      "Wenn ein anderer Spieler eine Aktion ausführt, die geblockt werden kann, kann der betroffene Spieler oder im Falle von Auslandshilfe jeder Spieler diese blocken, indem er behauptet, den entsprechenden Charakter auf einer seiner Einflusskarten zu haben. Der agierende Spieler kann die Aktion nicht ausführen und führt in diesem Zug keine weitere Aktion aus. Jeder Spieler kann den blockenden Spieler herausfordern. Wenn er die Herausforderung gewinnt, wird die Aktion wie gewohnt ausgeführt.",
    rulesCaptain:
      "Kann zwei Münzen von einem anderen Spieler stehlen und Stehlversuche blocken.",
    rulesChallenge:
      'Wenn der agierende Spieler seine Aktion deklariert, kann jeder andere Spieler sein Recht, die Aktion auszuführen, herausfordern. Sie sagen damit: "Ich glaube nicht, dass du den richtigen Charakter dafür hast." Der agierende Spieler muss nun beweisen, dass er die Macht hat, die Aktion auszuführen, oder er verliert die Herausforderung. Wenn er den richtigen Charakter hat, deckt er ihn auf und legt die aufgedeckte Karte zurück in den Stapel. Dann mischt er den Stapel und zieht eine neue Karte. Der herausfordernde Spieler hat die Herausforderung verloren. Wenn er nicht den richtigen Charakter hat, verliert er die Herausforderung.',
    rulesContents: "Deck mit Einflusskarten, Bank mit Münzen.",
    rulesContessa: "Kann Attentatsversuche blocken.",
    rulesCoup:
      "Kostet sieben Münzen. Veranlasse einen Spieler, eine Einflusskarte abzugeben. Kann nicht herausgefordert oder geblockt werden. Wenn du deinen Zug mit 10 oder mehr Münzen beginnst, musst du diese Aktion ausführen.",
    rulesDuke: "Kann Steuern erheben und Auslandshilfe blocken.",
    rulesExchange:
      "Ziehe zwei Einflusskarten vom Deck, sieh sie dir an und mische sie mit deinen aktuellen Einflusskarten. Lege zwei Karten zurück in den Stapel und mische den Stapel. Kann herausgefordert werden. Kann nicht geblockt werden.",
    rulesForeignAid:
      "Nimm zwei Münzen von der Bank. Kann nicht herausgefordert werden. Kann vom Herzog geblockt werden.",
    rulesGoal: "Der einzige Spieler mit verbliebenen Einflusskarten zu sein.",
    rulesIncome:
      "Nimm eine Münze von der Bank. Kann nicht herausgefordert oder geblockt werden.",
    rulesInfluences:
      "Es gibt fünf verschiedene Charaktere im Einflusskarten-Deck (jeweils drei Karten).",
    rulesLosingAChallenge:
      "Jeder Spieler, der eine Herausforderung verliert, muss eine seiner Einflusskarten offen vor sich hinlegen, sodass alle sie sehen können. Wenn dies seine letzte Einflusskarte ist, scheidet er aus dem Spiel aus.",
    rulesLosingInfluence:
      "Jedes Mal, wenn ein Spieler eine Einflusskarte verliert, wählt er, welche seiner Karten er aufdeckt.",
    rulesSetup:
      "Mische die Karten und teile jedem Spieler zwei aus. Die Spieler sollten ihre Karten ansehen, aber sie vor den anderen verbergen. Jeder Spieler nimmt zwei Münzen von der Bank als Startkapital. In einem Spiel mit nur zwei Spielern beginnt der Startspieler das Spiel mit einer Münze anstelle von zwei.",
    rulesSteal:
      "Nimm zwei Münzen von einem anderen Spieler. Kann herausgefordert werden. Kann vom Hauptmann oder Botschafter geblockt werden.",
    rulesTax:
      "Nimm drei Münzen von der Bank. Kann herausgefordert werden. Kann nicht geblockt werden.",
    send: "Senden",
    settings: "Einstellungen",
    setup: "Aufbau",
    skepticism: "Skeptizismus",
    startGame: "Spiel starten",
    startingPlayerBeginsWith1Coin:
      "2-Spieler-Spiel, der Startspieler beginnt mit 1 Münze",
    steal2CoinsFromSomeone: "Stehle 2 Münzen von jemandem",
    system: "System",
    title: "Coup",
    vengefulness: "Rachsucht",
    waitingOnOtherPlayers: "Warten auf andere Spieler",
    websocketsConnection: "WebSockets-Verbindung",
    welcomeToCoup: "Willkommen zu Coup!",
    whatIsBotsName: "Wie ist sein Name?",
    whatIsYourName: "Wie ist dein Name?",
    writeNewMessage: "Neue Nachricht schreiben",
    youAreSpectating: "Du bist Zuschauer",
  },
  "en-US": {
    action: "Action",
    actions: "Actions",
    [Actions.Assassinate]: "Assassinate",
    [Actions.Coup]: "Coup",
    [Actions.Exchange]: "Exchange",
    [Actions.ForeignAid]: "Foreign Aid",
    [Actions.Income]: "Income",
    [Actions.Steal]: "Steal",
    [Actions.Tax]: "Tax",
    add: "Add",
    addAiPlayer: "Add AI Player",
    addPlayersToStartGame: "Add at least one more player to start game",
    anyone: "Anyone",
    block: "Block",
    blockAsInfluence: "Block as {{primaryInfluence}}",
    briefDescriptionOfCoup: "The game of deception, deduction, and luck.",
    cancel: "Cancel",
    cardCountInDeck: "{{count}} card{{plural[[s]]}} in the deck",
    challenge: "Challenge",
    chat: "Chat",
    cheatSheet: "Cheat Sheet",
    chooseATarget: "Choose a Target",
    chooseAnAction: "Choose an Action",
    chooseInfluenceToLose: "Choose an Influence to Lose",
    chooseInfluenceToReveal: "Choose an Influence to Reveal",
    chooseInfluencesToKeep: "Choose {{count}} Influence{{plural[[s]]}} to Keep",
    choosePersonality: "Choose Personality",
    claimAnInfluence: "Claim an influence",
    close: "Close",
    collectCoins: "Collect {{count}} coin{{plural[[s]]}}",
    colorMode: "Color Mode",
    confirm: "Confirm",
    confirmActions: "Confirm Actions",
    contents: "Contents",
    copyInviteLink: "Copy Invite Link",
    createGame: "Create Game",
    createNewGame: "Create New Game",
    dark: "Dark",
    draw2InfluencesAndDiscard2: "Draw 2 influences & Discard 2",
    effect: "Effect",
    eventLog: "Event Log",
    eventLogRetentionTurns: "Event logs turns",
    [EventMessages.ActionConfirm]: {
      [Actions.Assassinate]: "{{action[[Assassinate]]}} {{secondaryPlayer}}",
      [Actions.Coup]: "{{action[[Coup]]}} {{secondaryPlayer}}",
      [Actions.Exchange]: "{{action[[Exchange]]}} influences",
      [Actions.ForeignAid]: "Collect {{action[[Foreign Aid]]}}",
      [Actions.Income]: "Collect {{action[[Income]]}}",
      [Actions.Steal]: "{{action[[Steal]]}} from {{secondaryPlayer}}",
      [Actions.Tax]: "Collect {{action}}",
    },
    [EventMessages.ActionPending]: {
      [Actions.Assassinate]:
        "{{primaryPlayer}} is trying to {{action[[Assassinate]]}} {{secondaryPlayer}}",
      [Actions.Exchange]:
        "{{primaryPlayer}} is trying to {{action[[Exchange]]}} influences",
      [Actions.ForeignAid]:
        "{{primaryPlayer}} is trying to receive {{action[[Foreign Aid]]}}",
      [Actions.Steal]:
        "{{primaryPlayer}} is trying to {{action[[Steal]]}} from {{secondaryPlayer}}",
      [Actions.Tax]: "{{primaryPlayer}} is trying to collect {{action[[Tax]]}}",
    },
    [EventMessages.ActionProcessed]: {
      [Actions.Assassinate]:
        "{{primaryPlayer}} {{action[[Assassinated]]}} {{secondaryPlayer}}",
      [Actions.Coup]:
        "{{primaryPlayer}} {{action[[Couped]]}} {{secondaryPlayer}}",
      [Actions.Exchange]:
        "{{primaryPlayer}} {{action[[Exchanged]]}} influences",
      [Actions.ForeignAid]:
        "{{primaryPlayer}} received {{action[[Foreign Aid]]}}",
      [Actions.Income]: "{{primaryPlayer}} collected {{action[[Income]]}}",
      [Actions.Steal]:
        "{{primaryPlayer}} {{action[[Stole]]}} from {{secondaryPlayer}}",
      [Actions.Tax]: "{{primaryPlayer}} collected {{action[[Tax]]}}",
    },
    [EventMessages.BlockFailed]:
      "{{primaryPlayer}} failed to block {{secondaryPlayer}}",
    [EventMessages.BlockPending]:
      "{{primaryPlayer}} is trying to block {{secondaryPlayer}} as {{primaryInfluence}}",
    [EventMessages.BlockSuccessful]:
      "{{primaryPlayer}} successfully blocked {{secondaryPlayer}}",
    [EventMessages.ChallengeFailed]:
      "{{primaryPlayer}} failed to challenge {{secondaryPlayer}}",
    [EventMessages.ChallengePending]:
      "{{primaryPlayer}} is challenging {{secondaryPlayer}}",
    [EventMessages.ChallengeSuccessful]:
      "{{primaryPlayer}} successfully challenged {{secondaryPlayer}}",
    [EventMessages.GameStarted]: "Game has started",
    [EventMessages.PlayerDied]: "{{primaryPlayer}} is out!",
    [EventMessages.PlayerForfeited]: "{{primaryPlayer}} forfeited the game!",
    [EventMessages.PlayerLostInfluence]:
      "{{primaryPlayer}} lost their {{primaryInfluence}}",
    [EventMessages.PlayerReplacedInfluence]:
      "{{primaryPlayer}} revealed and replaced {{primaryInfluence}}",
    [EventMessages.PlayerReplacedWithAi]: "{{primaryPlayer}} was replaced with an AI player",
    forfeit: "Forfeit",
    forfeitConfirmationMessage: "Do you want to kill your influences or replace yourself with an AI player?",
    forfeitConfirmationTitle: "Forfeit Game",
    forfeitKillInfluences: "Kill Influences",
    forfeitNotPossible: "You can't currently forfeit the game",
    forfeitReplaceWithAi: "Replace with AI",
    fullRules: "Complete Rules",
    gameNotFound: "Game not found",
    goal: "Goal",
    home: "Home",
    honesty: "Honesty",
    influence: "Influence",
    influenceWasClaimed: "{{primaryInfluence}} was claimed",
    influences: "Influences",
    [Influences.Ambassador]: "Ambassador",
    [Influences.Assassin]: "Assassin",
    [Influences.Captain]: "Captain",
    [Influences.Contessa]: "Contessa",
    [Influences.Duke]: "Duke",
    inviteLinkCopied: "Invite Link Copied",
    joinExistingGame: "Join Existing Game",
    joinGame: "Join Game",
    keepInfluences:
      "Keep {{primaryInfluence}}{{plural[[ and {{secondaryInfluence}}]]}}",
    killAnInfluence: "Kill an influence",
    language: "Language",
    light: "Light",
    loseInfluence: "Lose {{primaryInfluence}}",
    losingAChallenge: "Losing a Challenge",
    losingInfluence: "Losing Influence",
    messageWasDeleted: "Message was deleted",
    noChatMessages: "No chat messages",
    notEnoughCoins: "Not enough coins",
    numberOfPlayers: "Number of Players",
    pageNotFound: "Page not found",
    payCoins: "Pay {{count}} coin{{plural[[s]]}}",
    personalityIsHidden: "Personality is hidden",
    playAgain: "Play Again",
    playerTurn: "{{primaryPlayer}}'s Turn",
    playerWantToReset: "{{primaryPlayer}} wants to reset the game",
    playerWins: "{{primaryPlayer}} Wins!",
    random: "Random",
    reportBug: "Report Bug",
    requestFeature: "Request Feature",
    resetGame: "Reset Game",
    [Responses.Block]: "Block",
    [Responses.Challenge]: "Challenge",
    [Responses.Pass]: "Pass",
    revealInfluence: "Reveal {{primaryInfluence}}",
    room: "Room",
    rules: "Rules",
    rulesActions:
      "Players take turns performing one of these available actions:",
    rulesAmbassador:
      "Can Exchange your Influence cards with new ones from the deck and Block stealing attempts.",
    rulesAssassin: "Can Force one player to give up an Influence card.",
    rulesAssassinate:
      "Costs three coins. Force one player to give up an Influence card of their choice. Can be Challenged. Can be Blocked by the Contessa.",
    rulesBlock:
      "If another player takes an action that can be Blocked, the targeted player, or anyone in the case of Foreign Aid, may Block it by claiming to have the proper character on one of their Influence cards. The acting player cannot perform the action and takes no other action this turn. Any player may choose to Challenge the Blocking player. If they win the Challenge, the action goes through as normal.",
    rulesCaptain:
      "Can Steal two coins from another player and Block stealing attempts.",
    rulesChallenge:
      'When the acting player declares their action, any other player may Challenge their right to take the action. They are saying "I don\'t believe you have the proper character to do that." The acting player now must prove they have the power to take the action or lose the Challenge. If they have the right character, they reveal it and place the revealed card back in the deck. They then shuffle the deck and draw a new card. The Challenging player has lost the Challenge. If they do not have the proper character, they lose the Challenge.',
    rulesContents: "Deck of influence cards, bank of coins.",
    rulesContessa: "Can Block assassination attempts.",
    rulesCoup:
      "Costs seven coins. Cause a player to give up an Influence card. Cannot be Challenged or Blocked. If you start your turn with 10+ coins, you must take this action.",
    rulesDuke: "Can Tax and Block Foreign Aid.",
    rulesExchange:
      "Draw two Influence cards from the deck, look at them and mix them with your current Influence cards. Place two cards back in the deck and shuffle the deck. Can be Challenged. Cannot be Blocked.",
    rulesForeignAid:
      "Take two coins from the bank. Cannot be Challenged. Can be Blocked by the Duke.",
    rulesGoal: "To be the only player with any influence cards left.",
    rulesIncome:
      "Take one coin from the bank. Cannot be Challenged or Blocked.",
    rulesInfluences:
      "There are five different characters in the influence deck (three of each character).",
    rulesLosingAChallenge:
      "Any player who loses a Challenge must turn one of their Influence cards face up for all to see. If that is their last Influence card, they are out of the game.",
    rulesLosingInfluence:
      "Any time a player loses an Influence card, they choose which of their cards to reveal.",
    rulesSetup:
      "Shuffle the cards and deal two to each player. Players should look at their cards but keep them hidden from everyone else. Each player takes two coins from the bank as their starting wealth. In a game with only two players, the starting player begins the game with one coin instead of two.",
    rulesSteal:
      "Take two coins from another player. Can be Challenged. Can be Blocked by Captain or Ambassador.",
    rulesTax:
      "Take three coins from the bank. Can be Challenged. Cannot be Blocked.",
    send: "Send",
    settings: "Settings",
    setup: "Setup",
    skepticism: "Skepticism",
    startGame: "Start Game",
    startingPlayerBeginsWith1Coin:
      "2 player game, starting player will begin with 1 coin",
    steal2CoinsFromSomeone: "Steal 2 coins from someone",
    system: "System",
    title: "Coup",
    vengefulness: "Vengefulness",
    waitingOnOtherPlayers: "Waiting on Other Players",
    websocketsConnection: "WebSockets Connection",
    welcomeToCoup: "Welcome To Coup!",
    whatIsBotsName: "What is its name?",
    whatIsYourName: "What is your name?",
    writeNewMessage: "Write New Message",
    youAreSpectating: "You are Spectating",
  },
  "es-MX": {
    action: "Acción",
    actions: "Acciones",
    [Actions.Assassinate]: "Asesinar",
    [Actions.Coup]: "Golpe de estado",
    [Actions.Exchange]: "Intercambiar",
    [Actions.ForeignAid]: "Ayuda extranjera",
    [Actions.Income]: "Ingresos",
    [Actions.Steal]: "Robar",
    [Actions.Tax]: "Impuestos",
    add: "Agregar",
    addAiPlayer: "Agregar jugador IA",
    addPlayersToStartGame:
      "Agrega al menos un jugador más para empezar el juego",
    anyone: "Cualquiera",
    block: "Bloquear",
    blockAsInfluence: "Bloquear como {{primaryInfluence}}",
    briefDescriptionOfCoup: "El juego de engaño, deducción y suerte.",
    cancel: "Cancelar",
    cardCountInDeck: "{{count}} carta{{plural[[s]]}} en la baraja",
    challenge: "Desafiar",
    chat: "Chat",
    cheatSheet: "Hoja de trucos",
    chooseATarget: "Elige un objetivo",
    chooseAnAction: "Elige una acción",
    chooseInfluenceToLose: "Elige una influencia para perder",
    chooseInfluenceToReveal: "Elige una influencia para revelar",
    chooseInfluencesToKeep:
      "Elige {{count}} influencia{{plural[[s]]}} para quedarte",
    choosePersonality: "Elige personalidad",
    claimAnInfluence: "Reclamar una influencia",
    close: "Cerrar",
    collectCoins: "Juntar {{count}} moneda{{plural[[s]]}}",
    colorMode: "Modo de color",
    confirm: "Confirmar",
    confirmActions: "Confirmar acciones",
    contents: "Contenido",
    copyInviteLink: "Copiar enlace de invitación",
    createGame: "Crear partida",
    createNewGame: "Crear partida nueva",
    dark: "Oscuro",
    draw2InfluencesAndDiscard2: "Roba 2 influencias y descarta 2",
    effect: "Efecto",
    eventLog: "Registro de eventos",
    eventLogRetentionTurns: "Turnos de retención del registro de eventos",
    [EventMessages.ActionConfirm]: {
      [Actions.Assassinate]: "{{action[[Asesinar]]}} a {{secondaryPlayer}}",
      [Actions.Coup]: "{{action[[Golpe de estado]]}} a {{secondaryPlayer}}",
      [Actions.Exchange]: "{{action[[Intercambiar]]}} influencias",
      [Actions.ForeignAid]: "Recibir {{action[[Ayuda extranjera]]}}",
      [Actions.Income]: "Recibir {{action[[Ingresos]]}}",
      [Actions.Steal]: "{{action[[Robar]]}} a {{secondaryPlayer}}",
      [Actions.Tax]: "Recibir {{action[[Impuestos]]}}",
    },
    [EventMessages.ActionPending]: {
      [Actions.Assassinate]:
        "{{primaryPlayer}} está tratando de {{action[[Asesinar]]}} a {{secondaryPlayer}}",
      [Actions.Exchange]:
        "{{primaryPlayer}} anda queriendo {{action[[Intercambiar]]}} influencias",
      [Actions.ForeignAid]:
        "{{primaryPlayer}} quiere recibir {{action[[Ayuda extranjera]]}}",
      [Actions.Steal]:
        "{{primaryPlayer}} anda queriendo {{action[[Robar]]}} a {{secondaryPlayer}}",
      [Actions.Tax]: "{{primaryPlayer}} quiere cobrar {{action[[Impuestos]]}}",
    },
    [EventMessages.ActionProcessed]: {
      [Actions.Assassinate]:
        "{{primaryPlayer}} {{action[[Asesinó]]}} a {{secondaryPlayer}}",
      [Actions.Coup]:
        "{{primaryPlayer}} le dio un {{action[[Golpe de estado]]}} a {{secondaryPlayer}}",
      [Actions.Exchange]:
        "{{primaryPlayer}} {{action[[Intercambió]]}} influencias",
      [Actions.ForeignAid]:
        "{{primaryPlayer}} recibió {{action[[Ayuda extranjera]]}}",
      [Actions.Income]: "{{primaryPlayer}} recibió {{action[[Ingresos]]}}",
      [Actions.Steal]:
        "{{primaryPlayer}} le {{action[[Robó]]}} a {{secondaryPlayer}}",
      [Actions.Tax]: "{{primaryPlayer}} cobró {{action[[Impuestos]]}}",
    },
    [EventMessages.BlockFailed]:
      "{{primaryPlayer}} no pudo bloquear a {{secondaryPlayer}}",
    [EventMessages.BlockPending]:
      "{{primaryPlayer}} está queriendo bloquear a {{secondaryPlayer}} como {{primaryInfluence}}",
    [EventMessages.BlockSuccessful]:
      "{{primaryPlayer}} bloqueó con éxito a {{secondaryPlayer}}",
    [EventMessages.ChallengeFailed]:
      "{{primaryPlayer}} no pudo desafiar a {{secondaryPlayer}}",
    [EventMessages.ChallengePending]:
      "{{primaryPlayer}} está desafiando a {{secondaryPlayer}}",
    [EventMessages.ChallengeSuccessful]:
      "{{primaryPlayer}} desafió con éxito a {{secondaryPlayer}}",
    [EventMessages.GameStarted]: "¡La partida ha comenzado!",
    [EventMessages.PlayerDied]: "¡{{primaryPlayer}} ya valió!",
    [EventMessages.PlayerForfeited]: "{{primaryPlayer}} se rindió",
    [EventMessages.PlayerLostInfluence]:
      "{{primaryPlayer}} perdió su {{primaryInfluence}}",
    [EventMessages.PlayerReplacedInfluence]:
      "{{primaryPlayer}} reveló y reemplazó {{primaryInfluence}}",
    [EventMessages.PlayerReplacedWithAi]:
      "{{primaryPlayer}} fue reemplazado por un jugador IA",
    forfeit: "Rendir",
    forfeitConfirmationMessage:
      "¿Quieres matar tus influencias o reemplazarte con un jugador IA?",
    forfeitConfirmationTitle: "Rendir partida",
    forfeitKillInfluences: "Matar influencias",
    forfeitNotPossible: "No puedes rendirte en este momento",
    forfeitReplaceWithAi: "Reemplazar con IA",
    fullRules: "Reglas completas",
    gameNotFound: "Partida no encontrada",
    goal: "Objetivo",
    home: "Inicio",
    honesty: "Honestidad",
    influence: "Influencia",
    influenceWasClaimed: "Se reclamó {{primaryInfluence}}",
    influences: "Influencias",
    [Influences.Ambassador]: "Embajador",
    [Influences.Assassin]: "Asesino",
    [Influences.Captain]: "Capitán",
    [Influences.Contessa]: "Condesa",
    [Influences.Duke]: "Duque",
    inviteLinkCopied: "Enlace de invitación copiado",
    joinExistingGame: "Unirse a partida existente",
    joinGame: "Unirse a partida",
    keepInfluences:
      "Quédate con {{primaryInfluence}}{{plural[[ y {{secondaryInfluence}}]]}}",
    killAnInfluence: "Eliminar una influencia",
    language: "Idioma",
    light: "Claro",
    loseInfluence: "Perder {{primaryInfluence}}",
    losingAChallenge: "Perder un desafío",
    losingInfluence: "Perder influencia",
    messageWasDeleted: "El mensaje fue borrado",
    noChatMessages: "No hay mensajes en el chat",
    notEnoughCoins: "No alcanzan las monedas",
    numberOfPlayers: "Número de jugadores",
    pageNotFound: "Página no encontrada",
    payCoins: "Pagar {{count}} moneda{{plural[[s]]}}",
    personalityIsHidden: "La personalidad está oculta",
    playAgain: "Jugar otra vez",
    playerTurn: "Turno de {{primaryPlayer}}",
    playerWantToReset: "{{primaryPlayer}} quiere reiniciar la partida",
    playerWins: "¡{{primaryPlayer}} ganó!",
    random: "Aleatorio",
    reportBug: "Reportar error",
    requestFeature: "Pedir función",
    resetGame: "Reiniciar partida",
    [Responses.Block]: "Bloquear",
    [Responses.Challenge]: "Desafiar",
    [Responses.Pass]: "Pasar",
    revealInfluence: "Revelar {{primaryInfluence}}",
    room: "Sala",
    rules: "Reglas",
    rulesActions: "Los jugadores se turnan para hacer una de estas acciones:",
    rulesAmbassador:
      "Puede intercambiar tus cartas de influencia con nuevas del mazo y bloquear intentos de robo.",
    rulesAssassin:
      "Puede obligar a un jugador a deshacerse de una carta de influencia.",
    rulesAssassinate:
      "Cuesta tres monedas. Obliga a un jugador a deshacerse de una carta de influencia de su elección. Se puede desafiar. La Condesa lo puede bloquear.",
    rulesBlock:
      "Si otro jugador hace una acción que se puede bloquear, el jugador al que va dirigida, o cualquiera en el caso de Ayuda Extranjera, puede bloquearla diciendo que tiene el personaje adecuado en una de sus cartas de influencia. El jugador que actúa no puede hacer la acción y no hace nada más en este turno. Cualquier jugador puede desafiar al que bloquea. Si gana el desafío, la acción se lleva a cabo normal.",
    rulesCaptain:
      "Puede robar dos monedas a otro jugador y bloquear intentos de robo.",
    rulesChallenge:
      'Cuando el jugador que actúa declara su acción, cualquier otro jugador puede desafiar si tiene derecho a hacerla. Están diciendo: "No te creo que tengas el personaje para hacer eso". El jugador que actúa ahora debe probar que tiene el poder para hacer la acción o pierde el desafío. Si tiene el personaje correcto, lo revela y pone la carta revelada de vuelta en el mazo. Luego baraja el mazo y roba una carta nueva. El jugador que desafía perdió. Si no tiene el personaje correcto, pierde el desafío.',
    rulesContents: "Mazo de cartas de influencia, banco de monedas.",
    rulesContessa: "Puede bloquear intentos de asesinato.",
    rulesCoup:
      "Cuesta siete monedas. Obliga a un jugador a deshacerse de una carta de influencia. No se puede desafiar ni bloquear. Si empiezas tu turno con 10 o más monedas, debes hacer esta acción.",
    rulesDuke: "Puede cobrar impuestos y bloquear la Ayuda Extranjera.",
    rulesExchange:
      "Roba dos cartas de influencia del mazo, míralas y mézclalas con tus cartas de influencia. Pon dos cartas de vuelta en el mazo y baraja el mazo. Se puede desafiar. No se puede bloquear.",
    rulesForeignAid:
      "Toma dos monedas del banco. No se puede desafiar. El Duque lo puede bloquear.",
    rulesGoal: "Ser el único jugador que quede con cartas de influencia.",
    rulesIncome: "Toma una moneda del banco. No se puede desafiar ni bloquear.",
    rulesInfluences:
      "Hay cinco personajes diferentes en el mazo de influencia (tres de cada uno).",
    rulesLosingAChallenge:
      "Cualquier jugador que pierda un desafío debe poner una de sus cartas de influencia boca arriba para que todos la vean. Si esa es su última carta de influencia, queda fuera del juego.",
    rulesLosingInfluence:
      "Cada vez que un jugador pierde una carta de influencia, elige cuál de sus cartas revela.",
    rulesSetup:
      "Baraja las cartas y reparte dos a cada jugador. Los jugadores deben ver sus cartas pero mantenerlas escondidas de los demás. Cada jugador toma dos monedas del banco para empezar. En una partida de solo dos jugadores, el que empieza comienza con una moneda en lugar de dos.",
    rulesSteal:
      "Roba dos monedas a otro jugador. Se puede desafiar. El Capitán o el Embajador lo pueden bloquear.",
    rulesTax:
      "Toma tres monedas del banco. Se puede desafiar. No se puede bloquear.",
    send: "Enviar",
    settings: "Ajustes",
    setup: "Preparación",
    skepticism: "Escepticismo",
    startGame: "Empezar partida",
    startingPlayerBeginsWith1Coin:
      "Partida de 2 jugadores, el que empieza tendrá 1 moneda",
    steal2CoinsFromSomeone: "Robarle 2 monedas a alguien",
    system: "Sistema",
    title: "Coup",
    vengefulness: "Sed de venganza",
    waitingOnOtherPlayers: "Esperando a los demás jugadores",
    websocketsConnection: "Conexión WebSockets",
    welcomeToCoup: "¡Bienvenido al Coup!",
    whatIsBotsName: "¿Cuál es su nombre?",
    whatIsYourName: "¿Cómo te llamas?",
    writeNewMessage: "Escribir mensaje nuevo",
    youAreSpectating: "Estás observando",
  },
  "fr-FR": {
    action: "Action",
    actions: "Actions",
    [Actions.Assassinate]: "Assassiner",
    [Actions.Coup]: "Coup",
    [Actions.Exchange]: "Échanger",
    [Actions.ForeignAid]: "Aide étrangère",
    [Actions.Income]: "Revenu",
    [Actions.Steal]: "Voler",
    [Actions.Tax]: "Taxe",
    add: "Ajouter",
    addAiPlayer: "Ajouter un joueur IA",
    addPlayersToStartGame:
      "Ajouter au moins un joueur de plus pour démarrer la partie",
    anyone: "N'importe qui",
    block: "Bloquer",
    blockAsInfluence: "Bloquer comme {{primaryInfluence}}",
    briefDescriptionOfCoup:
      "Le jeu de la tromperie, de la déduction et de la chance.",
    cancel: "Annuler",
    cardCountInDeck: "{{count}} carte{{plural[[s]]}} dans le deck",
    challenge: "Défier",
    chat: "Chat",
    cheatSheet: "Aide-mémoire",
    chooseATarget: "Choisir une cible",
    chooseAnAction: "Choisir une action",
    chooseInfluenceToLose: "Choisir une influence à perdre",
    chooseInfluenceToReveal: "Choisir une influence à révéler",
    chooseInfluencesToKeep:
      "Choisir {{count}} influence{{plural[[s]]}} à garder",
    choosePersonality: "Choisir une personnalité",
    claimAnInfluence: "Revendiquer une influence",
    close: "Fermer",
    collectCoins: "Collecter {{count}} pièce{{plural[[s]]}}",
    colorMode: "Mode couleur",
    confirm: "Confirmer",
    confirmActions: "Confirmer les actions",
    contents: "Contenu",
    copyInviteLink: "Copier le lien d'invitation",
    createGame: "Créer une partie",
    createNewGame: "Créer une nouvelle partie",
    dark: "Sombre",
    draw2InfluencesAndDiscard2: "Piocher 2 influences et défausser 2",
    effect: "Effet",
    eventLog: "Journal des événements",
    eventLogRetentionTurns: "Tours de conservation du journal des événements",
    [EventMessages.ActionConfirm]: {
      [Actions.Assassinate]: "{{action[[Assassiner]]}} {{secondaryPlayer}}",
      [Actions.Coup]: "{{action[[Coup d'état]]}} {{secondaryPlayer}}",
      [Actions.Exchange]: "{{action[[Échanger]]}} des influences",
      [Actions.ForeignAid]: "Collecter {{action[[Aide étrangère]]}}",
      [Actions.Income]: "Collecter {{action[[Revenu]]}}",
      [Actions.Steal]: "{{action[[Voler]]}} à {{secondaryPlayer}}",
      [Actions.Tax]: "Collecter {{action[[Taxe]]}}",
    },
    [EventMessages.ActionPending]: {
      [Actions.Assassinate]:
        "{{primaryPlayer}} essaie d'{{action[[Assassiner]]}} {{secondaryPlayer}}",
      [Actions.Exchange]:
        "{{primaryPlayer}} essaie d'{{action[[Échanger]]}} des influences",
      [Actions.ForeignAid]:
        "{{primaryPlayer}} essaie de recevoir l'{{action[[Aide étrangère]]}}",
      [Actions.Steal]:
        "{{primaryPlayer}} essaie de {{action[[Voler]]}} à {{secondaryPlayer}}",
      [Actions.Tax]:
        "{{primaryPlayer}} essaie de collecter la {{action[[Taxe]]}}",
    },
    [EventMessages.ActionProcessed]: {
      [Actions.Assassinate]:
        "{{primaryPlayer}} a {{action[[Assassiné]]}} {{secondaryPlayer}}",
      [Actions.Coup]:
        "{{primaryPlayer}} a fait un {{action[[Coup d'état]]}} à {{secondaryPlayer}}",
      [Actions.Exchange]:
        "{{primaryPlayer}} a {{action[[Échangé]]}} des influences",
      [Actions.ForeignAid]:
        "{{primaryPlayer}} a reçu l'{{action[[Aide étrangère]]}}",
      [Actions.Income]: "{{primaryPlayer}} a collecté le {{action[[Revenu]]}}",
      [Actions.Steal]:
        "{{primaryPlayer}} a {{action[[Volé]]}} à {{secondaryPlayer}}",
      [Actions.Tax]: "{{primaryPlayer}} a collecté la {{action[[Taxe]]}}",
    },
    [EventMessages.BlockFailed]:
      "{{primaryPlayer}} n'a pas réussi à bloquer {{secondaryPlayer}}",
    [EventMessages.BlockPending]:
      "{{primaryPlayer}} essaie de bloquer {{secondaryPlayer}} en tant que {{primaryInfluence}}",
    [EventMessages.BlockSuccessful]:
      "{{primaryPlayer}} a bloqué {{secondaryPlayer}} avec succès",
    [EventMessages.ChallengeFailed]:
      "{{primaryPlayer}} n'a pas réussi à défier {{secondaryPlayer}}",
    [EventMessages.ChallengePending]:
      "{{primaryPlayer}} défie {{secondaryPlayer}}",
    [EventMessages.ChallengeSuccessful]:
      "{{primaryPlayer}} a défié {{secondaryPlayer}} avec succès",
    [EventMessages.GameStarted]: "La partie a commencé",
    [EventMessages.PlayerDied]: "{{primaryPlayer}} est éliminé !",
    [EventMessages.PlayerForfeited]:
      "{{primaryPlayer}} a abandonné la partie !",
    [EventMessages.PlayerLostInfluence]:
      "{{primaryPlayer}} a perdu son influence {{primaryInfluence}}",
    [EventMessages.PlayerReplacedInfluence]:
      "{{primaryPlayer}} a révélé et remplacé son influence {{primaryInfluence}}",
    [EventMessages.PlayerReplacedWithAi]:
      "{{primaryPlayer}} a été remplacé par un joueur IA",
    forfeit: "Abandonner",
    forfeitConfirmationMessage:
      "Voulez-vous tuer vos influences ou vous remplacer par un joueur IA ?",
    forfeitConfirmationTitle: "Abandonner la partie",
    forfeitKillInfluences: "Tuer les influences",
    forfeitNotPossible: "Vous ne pouvez pas abandonner la partie pour le moment",
    forfeitReplaceWithAi: "Remplacer par IA",
    fullRules: "Règles complètes",
    gameNotFound: "Partie non trouvée",
    goal: "Objectif",
    home: "Accueil",
    honesty: "Honnêteté",
    influence: "Influence",
    influenceWasClaimed: "{{primaryInfluence}} a été revendiquée",
    influences: "Influences",
    [Influences.Ambassador]: "Ambassadeur",
    [Influences.Assassin]: "Assassin",
    [Influences.Captain]: "Capitaine",
    [Influences.Contessa]: "Comtesse",
    [Influences.Duke]: "Duc",
    inviteLinkCopied: "Lien d'invitation copié",
    joinExistingGame: "Rejoindre une partie existante",
    joinGame: "Rejoindre la partie",
    keepInfluences:
      "Garder {{primaryInfluence}}{{plural[[ et {{secondaryInfluence}}]]}}",
    killAnInfluence: "Éliminer une influence",
    language: "Langue",
    light: "Clair",
    loseInfluence: "Perdre {{primaryInfluence}}",
    losingAChallenge: "Perdre un défi",
    losingInfluence: "Perte d'influence",
    messageWasDeleted: "Le message a été supprimé",
    noChatMessages: "Aucun message dans le chat",
    notEnoughCoins: "Pas assez de pièces",
    numberOfPlayers: "Nombre de joueurs",
    pageNotFound: "Page non trouvée",
    payCoins: "Payer {{count}} pièce{{plural[[s]]}}",
    personalityIsHidden: "La personnalité est cachée",
    playAgain: "Rejouer",
    playerTurn: "Tour de {{primaryPlayer}}",
    playerWantToReset: "{{primaryPlayer}} veut réinitialiser la partie",
    playerWins: "{{primaryPlayer}} gagne !",
    random: "Aléatoire",
    reportBug: "Signaler un bug",
    requestFeature: "Demander une fonctionnalité",
    resetGame: "Réinitialiser la partie",
    [Responses.Block]: "Bloquer",
    [Responses.Challenge]: "Défier",
    [Responses.Pass]: "Passer",
    revealInfluence: "Révéler {{primaryInfluence}}",
    room: "Salle",
    rules: "Règles",
    rulesActions:
      "Les joueurs effectuent à tour de rôle l'une de ces actions disponibles :",
    rulesAmbassador:
      "Peut échanger vos cartes d'Influence avec de nouvelles du deck et Bloquer les tentatives de vol.",
    rulesAssassin:
      "Peut forcer un joueur à se défaire d'une carte d'Influence.",
    rulesAssassinate:
      "Coûte trois pièces. Forcez un joueur à se défaire d'une carte d'Influence de son choix. Peut être Défié. Peut être Bloqué par la Comtesse.",
    rulesBlock:
      "Si un autre joueur entreprend une action qui peut être Bloquée, le joueur ciblé, ou n'importe qui dans le cas de l'Aide Étrangère, peut la Bloquer en affirmant avoir le personnage approprié sur l'une de ses cartes d'Influence. Le joueur actif ne peut pas effectuer l'action et n'entreprend aucune autre action ce tour-ci. N'importe quel joueur peut choisir de Défier le joueur qui Bloque. S'il gagne le Défi, l'action se déroule normalement.",
    rulesCaptain:
      "Peut Voler deux pièces à un autre joueur et Bloquer les tentatives de vol.",
    rulesChallenge:
      "Lorsque le joueur actif déclare son action, n'importe quel autre joueur peut Défier son droit d'entreprendre l'action. Il dit alors : « Je ne crois pas que vous ayez le personnage approprié pour faire cela. » Le joueur actif doit alors prouver qu'il a le pouvoir d'entreprendre l'action ou perdre le Défi. S'il a le bon personnage, il le révèle et replace la carte révélée dans le deck. Il mélange ensuite le deck et pioche une nouvelle carte. Le joueur qui Défie a perdu le Défi. S'il n'a pas le bon personnage, il perd le Défi.",
    rulesContents: "Deck de cartes d'influence, banque de pièces.",
    rulesContessa: "Peut Bloquer les tentatives d'assassinat.",
    rulesCoup:
      "Coûte sept pièces. Forcez un joueur à se défaire d'une carte d'Influence. Ne peut pas être Défié ou Bloqué. Si vous commencez votre tour avec 10 pièces ou plus, vous devez entreprendre cette action.",
    rulesDuke: "Peut Taxer et Bloquer l'Aide Étrangère.",
    rulesExchange:
      "Piochez deux cartes d'Influence du deck, regardez-les et mélangez-les avec vos cartes d'Influence actuelles. Replacez deux cartes dans le deck et mélangez le deck. Peut être Défié. Ne peut pas être Bloqué.",
    rulesForeignAid:
      "Prenez deux pièces de la banque. Ne peut pas être Défié. Peut être Bloqué par le Duc.",
    rulesGoal: "Être le seul joueur avec des cartes d'influence restantes.",
    rulesIncome:
      "Prenez une pièce de la banque. Ne peut pas être Défié ou Bloqué.",
    rulesInfluences:
      "Il y a cinq personnages différents dans le deck d'influence (trois de chaque personnage).",
    rulesLosingAChallenge:
      "Tout joueur qui perd un Défi doit retourner l'une de ses cartes d'Influence face visible pour que tous la voient. Si c'est sa dernière carte d'Influence, il est éliminé du jeu.",
    rulesLosingInfluence:
      "Chaque fois qu'un joueur perd une carte d'Influence, il choisit laquelle de ses cartes révéler.",
    rulesSetup:
      "Mélangez les cartes et distribuez-en deux à chaque joueur. Les joueurs doivent regarder leurs cartes mais les garder cachées aux autres. Chaque joueur prend deux pièces de la banque comme richesse de départ. Dans une partie avec seulement deux joueurs, le joueur de départ commence la partie avec une pièce au lieu de deux.",
    rulesSteal:
      "Prenez deux pièces à un autre joueur. Peut être Défié. Peut être Bloqué par le Capitaine ou l'Ambassadeur.",
    rulesTax:
      "Prenez trois pièces de la banque. Peut être Défié. Ne peut pas être Bloqué.",
    send: "Envoyer",
    settings: "Paramètres",
    setup: "Préparation",
    skepticism: "Scepticisme",
    startGame: "Démarrer la partie",
    startingPlayerBeginsWith1Coin:
      "Partie à 2 joueurs, le joueur de départ commencera avec 1 pièce",
    steal2CoinsFromSomeone: "Voler 2 pièces à quelqu'un",
    system: "Système",
    title: "Coup",
    vengefulness: "Vengeance",
    waitingOnOtherPlayers: "En attente des autres joueurs",
    websocketsConnection: "Connexion WebSockets",
    welcomeToCoup: "Bienvenue à Coup !",
    whatIsBotsName: "Quel est son nom ?",
    whatIsYourName: "Quel est votre nom ?",
    writeNewMessage: "Écrire un nouveau message",
    youAreSpectating: "Vous êtes en train de regarder",
  },
  "it-IT": {
    action: "Azione",
    actions: "Azioni",
    [Actions.Assassinate]: "Assassina",
    [Actions.Coup]: "Colpo di stato",
    [Actions.Exchange]: "Scambia",
    [Actions.ForeignAid]: "Aiuti esteri",
    [Actions.Income]: "Reddito",
    [Actions.Steal]: "Ruba",
    [Actions.Tax]: "Tassa",
    add: "Aggiungi",
    addAiPlayer: "Aggiungi giocatore IA",
    addPlayersToStartGame:
      "Aggiungi almeno un altro giocatore per iniziare la partita",
    anyone: "Chiunque",
    block: "Blocca",
    blockAsInfluence: "Blocca come {{primaryInfluence}}",
    briefDescriptionOfCoup:
      "Il gioco dell'inganno, della deduzione e della fortuna.",
    cancel: "Annulla",
    cardCountInDeck: "{{count}} carta{{plural[[e]]}} nel mazzo",
    challenge: "Sfida",
    chat: "Chat",
    cheatSheet: "Bigliettino",
    chooseATarget: "Scegli un bersaglio",
    chooseAnAction: "Scegli un'azione",
    chooseInfluenceToLose: "Scegli un'influenza da perdere",
    chooseInfluenceToReveal: "Scegli un'influenza da rivelare",
    chooseInfluencesToKeep:
      "Scegli {{count}} influenza{{plural[[e]]}} da tenere",
    choosePersonality: "Scegli Personalità",
    claimAnInfluence: "Rivendica un'influenza",
    close: "Chiudi",
    collectCoins: "Raccogli {{count}} moneta{{plural[[e]]}}",
    colorMode: "Modalità colore",
    confirm: "Conferma",
    confirmActions: "Conferma azioni",
    contents: "Contenuti",
    copyInviteLink: "Copia link d'invito",
    createGame: "Crea partita",
    createNewGame: "Crea nuova partita",
    dark: "Scuro",
    draw2InfluencesAndDiscard2: "Pesca 2 influenze e scarta 2",
    effect: "Effetto",
    eventLog: "Registro eventi",
    eventLogRetentionTurns: "Turni di conservazione del registro eventi",
    [EventMessages.ActionConfirm]: {
      [Actions.Assassinate]: "{{action[[Assassina]]}} {{secondaryPlayer}}",
      [Actions.Coup]: "{{action[[Colpo di stato]]}} {{secondaryPlayer}}",
      [Actions.Exchange]: "{{action[[Scambia]]}} influenze",
      [Actions.ForeignAid]: "Raccogli {{action[[Aiuti esteri]]}}",
      [Actions.Income]: "Raccogli {{action[[Reddito]]}}",
      [Actions.Steal]: "{{action[[Ruba]]}} da {{secondaryPlayer}}",
      [Actions.Tax]: "Raccogli {{action[[Tassa]]}}",
    },
    [EventMessages.ActionPending]: {
      [Actions.Assassinate]:
        "{{primaryPlayer}} sta cercando di {{action[[assassinare]]}} {{secondaryPlayer}}",
      [Actions.Exchange]:
        "{{primaryPlayer}} sta cercando di {{action[[scambiare]]}} influenze",
      [Actions.ForeignAid]:
        "{{primaryPlayer}} sta cercando di ricevere {{action[[aiuti esteri]]}}",
      [Actions.Steal]:
        "{{primaryPlayer}} sta cercando di {{action[[rubare]]}} da {{secondaryPlayer}}",
      [Actions.Tax]:
        "{{primaryPlayer}} sta cercando di riscuotere la {{action[[tassa]]}}",
    },
    [EventMessages.ActionProcessed]: {
      [Actions.Assassinate]:
        "{{primaryPlayer}} ha {{action[[assassinato]]}} {{secondaryPlayer}}",
      [Actions.Coup]:
        "{{primaryPlayer}} ha fatto un {{action[[colpo di stato]]}} a {{secondaryPlayer}}",
      [Actions.Exchange]:
        "{{primaryPlayer}} ha {{action[[scambiato]]}} influenze",
      [Actions.ForeignAid]:
        "{{primaryPlayer}} ha ricevuto {{action[[aiuti esteri]]}}",
      [Actions.Income]:
        "{{primaryPlayer}} ha riscosso il {{action[[reddito]]}}",
      [Actions.Steal]:
        "{{primaryPlayer}} ha {{action[[rubato]]}} da {{secondaryPlayer}}",
      [Actions.Tax]: "{{primaryPlayer}} ha riscosso la {{action[[tassa]]}}",
    },
    [EventMessages.BlockFailed]:
      "{{primaryPlayer}} non è riuscito a bloccare {{secondaryPlayer}}",
    [EventMessages.BlockPending]:
      "{{primaryPlayer}} sta cercando di bloccare {{secondaryPlayer}} come {{primaryInfluence}}",
    [EventMessages.BlockSuccessful]:
      "{{primaryPlayer}} ha bloccato {{secondaryPlayer}} con successo",
    [EventMessages.ChallengeFailed]:
      "{{primaryPlayer}} non è riuscito a sfidare {{secondaryPlayer}}",
    [EventMessages.ChallengePending]:
      "{{primaryPlayer}} sta sfidando {{secondaryPlayer}}",
    [EventMessages.ChallengeSuccessful]:
      "{{primaryPlayer}} ha sfidato {{secondaryPlayer}} con successo",
    [EventMessages.GameStarted]: "La partita è iniziata",
    [EventMessages.PlayerDied]: "{{primaryPlayer}} è fuori!",
    [EventMessages.PlayerForfeited]:
      "{{primaryPlayer}} ha rinunciato alla partita!",
    [EventMessages.PlayerLostInfluence]:
      "{{primaryPlayer}} ha perso la sua influenza {{primaryInfluence}}",
    [EventMessages.PlayerReplacedInfluence]:
      "{{primaryPlayer}} ha rivelato e sostituito la sua influenza {{primaryInfluence}}",
    [EventMessages.PlayerReplacedWithAi]:
      "{{primaryPlayer}} è stato sostituito da un giocatore IA",
    forfeit: "Rinuncia",
    forfeitConfirmationMessage:
      "Vuoi uccidere le tue influenze o sostituirti con un giocatore IA?",
    forfeitConfirmationTitle: "Rinuncia alla partita",
    forfeitKillInfluences: "Uccidi le influenze",
    forfeitNotPossible: "Non puoi rinunciare alla partita in questo momento",
    forfeitReplaceWithAi: "Sostituisci con IA",
    fullRules: "Regole complete",
    gameNotFound: "Partita non trovata",
    goal: "Obiettivo",
    home: "Casa",
    honesty: "Onestà",
    influence: "Influenza",
    influenceWasClaimed: "{{primaryInfluence}} è stata rivendicata",
    influences: "Influenze",
    [Influences.Ambassador]: "Ambasciatore",
    [Influences.Assassin]: "Assassino",
    [Influences.Captain]: "Capitano",
    [Influences.Contessa]: "Contessa",
    [Influences.Duke]: "Duca",
    inviteLinkCopied: "Link d'invito copiato",
    joinExistingGame: "Unisciti a una partita esistente",
    joinGame: "Unisciti alla partita",
    keepInfluences:
      "Tieni {{primaryInfluence}}{{plural[[ e {{secondaryInfluence}}]]}}",
    killAnInfluence: "Elimina un'influenza",
    language: "Lingua",
    light: "Chiaro",
    loseInfluence: "Perdi {{primaryInfluence}}",
    losingAChallenge: "Perdita di una sfida",
    losingInfluence: "Perdita di influenza",
    messageWasDeleted: "Il messaggio è stato eliminato",
    noChatMessages: "Nessun messaggio in chat",
    notEnoughCoins: "Non abbastanza monete",
    numberOfPlayers: "Numero di giocatori",
    pageNotFound: "Pagina non trovata",
    payCoins: "Paga {{count}} moneta{{plural[[e]]}}",
    personalityIsHidden: "La personalità è nascosta",
    playAgain: "Gioca ancora",
    playerTurn: "Turno di {{primaryPlayer}}",
    playerWantToReset: "{{primaryPlayer}} vuole resettare la partita",
    playerWins: "{{primaryPlayer}} vince!",
    random: "Casuale",
    reportBug: "Segnala un bug",
    requestFeature: "Richiedi una funzionalità",
    resetGame: "Resetta partita",
    [Responses.Block]: "Blocca",
    [Responses.Challenge]: "Sfida",
    [Responses.Pass]: "Passa",
    revealInfluence: "Rivela {{primaryInfluence}}",
    room: "Stanza",
    rules: "Regole",
    rulesActions:
      "I giocatori a turno eseguono una di queste azioni disponibili:",
    rulesAmbassador:
      "Può scambiare le tue carte Influenza con nuove dal mazzo e Bloccare i tentativi di furto.",
    rulesAssassin:
      "Può costringere un giocatore a rinunciare a una carta Influenza.",
    rulesAssassinate:
      "Costa tre monete. Costringi un giocatore a rinunciare a una carta Influenza a sua scelta. Può essere Sfidato. Può essere Bloccato dalla Contessa.",
    rulesBlock:
      "Se un altro giocatore intraprende un'azione che può essere Bloccata, il giocatore bersaglio, o chiunque nel caso di Aiuti Esteri, può Bloccarla dichiarando di avere il personaggio appropriato su una delle sue carte Influenza. Il giocatore attivo non può eseguire l'azione e non intraprende altre azioni in questo turno. Qualsiasi giocatore può scegliere di Sfidare il giocatore che Blocca. Se vince la Sfida, l'azione prosegue normalmente.",
    rulesCaptain:
      "Può Rubare due monete a un altro giocatore e Bloccare i tentativi di furto.",
    rulesChallenge:
      "Quando il giocatore attivo dichiara la sua azione, qualsiasi altro giocatore può Sfidare il suo diritto di intraprendere l'azione. Stanno dicendo: \"Non credo che tu abbia il personaggio appropriato per farlo.\" Il giocatore attivo ora deve provare di avere il potere di intraprendere l'azione o perdere la Sfida. Se ha il personaggio giusto, lo rivela e rimette la carta rivelata nel mazzo. Quindi mescola il mazzo e pesca una nuova carta. Il giocatore che Sfida ha perso la Sfida. Se non ha il personaggio appropriato, perde la Sfida.",
    rulesContents: "Mazzo di carte influenza, banca di monete.",
    rulesContessa: "Può Bloccare i tentativi di assassinio.",
    rulesCoup:
      "Costa sette monete. Costringi un giocatore a rinunciare a una carta Influenza. Non può essere Sfidato o Bloccato. Se inizi il tuo turno con 10+ monete, devi intraprendere questa azione.",
    rulesDuke: "Può Tassare e Bloccare gli Aiuti Esteri.",
    rulesExchange:
      "Pesca due carte Influenza dal mazzo, guardale e mescolale con le tue carte Influenza attuali. Rimetti due carte nel mazzo e mescola il mazzo. Può essere Sfidato. Non può essere Bloccato.",
    rulesForeignAid:
      "Prendi due monete dalla banca. Non può essere Sfidato. Può essere Bloccato dal Duca.",
    rulesGoal: "Essere l'unico giocatore con carte influenza rimaste.",
    rulesIncome:
      "Prendi una moneta dalla banca. Non può essere Sfidato o Bloccato.",
    rulesInfluences:
      "Ci sono cinque diversi personaggi nel mazzo influenza (tre per ogni personaggio).",
    rulesLosingAChallenge:
      "Qualsiasi giocatore che perde una Sfida deve girare una delle sue carte Influenza a faccia in su perché tutti la vedano. Se quella è la sua ultima carta Influenza, è fuori dal gioco.",
    rulesLosingInfluence:
      "Ogni volta che un giocatore perde una carta Influenza, sceglie quale delle sue carte rivelare.",
    rulesSetup:
      "Mescola le carte e distribuiscine due a ogni giocatore. I giocatori dovrebbero guardare le loro carte ma tenerle nascoste a tutti gli altri. Ogni giocatore prende due monete dalla banca come ricchezza iniziale. In una partita con solo due giocatori, il giocatore iniziale inizia la partita con una moneta invece di due.",
    rulesSteal:
      "Prendi due monete da un altro giocatore. Può essere Sfidato. Può essere Bloccato dal Capitano o dall'Ambasciatore.",
    rulesTax:
      "Prendi tre monete dalla banca. Può essere Sfidato. Non può essere Bloccato.",
    send: "Invia",
    settings: "Impostazioni",
    setup: "Impostazione",
    skepticism: "Scetticismo",
    startGame: "Inizia partita",
    startingPlayerBeginsWith1Coin:
      "Partita a 2 giocatori, il giocatore iniziale inizierà con 1 moneta",
    steal2CoinsFromSomeone: "Ruba 2 monete a qualcuno",
    system: "Sistema",
    title: "Coup",
    vengefulness: "Vendetta",
    waitingOnOtherPlayers: "In attesa degli altri giocatori",
    websocketsConnection: "Connessione WebSockets",
    welcomeToCoup: "Benvenuto a Coup!",
    whatIsBotsName: "Qual è il suo nome?",
    whatIsYourName: "Qual è il tuo nome?",
    writeNewMessage: "Scrivi nuovo messaggio",
    youAreSpectating: "Stai osservando",
  },
  "pt-BR": {
    action: "Ação",
    actions: "Ações",
    [Actions.Assassinate]: "Assassinar",
    [Actions.Coup]: "Golpe",
    [Actions.Exchange]: "Trocar",
    [Actions.ForeignAid]: "Ajuda Externa",
    [Actions.Income]: "Renda",
    [Actions.Steal]: "Roubar",
    [Actions.Tax]: "Imposto",
    add: "Adicionar",
    addAiPlayer: "Adicionar jogador AI",
    addPlayersToStartGame:
      "Adicione pelo menos mais um jogador para iniciar o jogo",
    anyone: "Todos",
    block: "Bloque",
    blockAsInfluence: "Bloquear como {{primaryInfluence}}",
    briefDescriptionOfCoup: "O jogo de engano, dedução e sorte.",
    cancel: "Cancelar",
    cardCountInDeck: "{{count}} carta{{plural[[s]]}} no baralho",
    challenge: "Desafio",
    chat: "Bate-papo",
    cheatSheet: "Folha de dicas",
    chooseATarget: "Escolha um alvo",
    chooseAnAction: "Escolha uma ação",
    chooseInfluenceToLose: "Escolha uma influência para perder",
    chooseInfluenceToReveal: "Escolha uma influência para revelar",
    chooseInfluencesToKeep:
      "Escolha {{count}} influência{{plural[[s]]}} para manter",
    choosePersonality: "Escolher personalidade",
    claimAnInfluence: "Declare uma influência",
    close: "Fechar",
    collectCoins: "Colete {{count}} moeda{{plural[[s]]}}",
    colorMode: "Modo de cor",
    confirm: "Confirmar",
    confirmActions: "Confirmar ações",
    contents: "Conteúdo",
    copyInviteLink: "Copiar link de convite",
    createGame: "Crie jogo",
    createNewGame: "Crie um jogo",
    dark: "Escuro",
    draw2InfluencesAndDiscard2: "Ganhe 2 influências e descarte 2",
    effect: "Efeito",
    eventLog: "Registro de eventos",
    eventLogRetentionTurns: "Turnos para registros de eventos",
    [EventMessages.ActionConfirm]: {
      [Actions.Assassinate]: "{{action[[Assassinar]]}} {{secondaryPlayer}}",
      [Actions.Coup]: "{{action[[Golpear]]}} {{secondaryPlayer}}",
      [Actions.Exchange]: "{{action[[Trocar]]}} influências",
      [Actions.ForeignAid]: "Receber {{action[[ajuda externa]]}}",
      [Actions.Income]: "Coleter {{action[[renda]]}}",
      [Actions.Steal]: "{{action[[Roubar]]}} de {{secondaryPlayer}}",
      [Actions.Tax]: "Cobrar {{action[[imposto]]}}",
    },
    [EventMessages.ActionPending]: {
      [Actions.Assassinate]:
        "{{primaryPlayer}} está tentando {{action[[assassinar]]}} {{secondaryPlayer}}",
      [Actions.Exchange]:
        "{{primaryPlayer}} está tentando {{action[[trocar]]}} influências",
      [Actions.ForeignAid]:
        "{{primaryPlayer}} está tentando receber {{action[[ajuda externa]]}}",
      [Actions.Steal]:
        "{{primaryPlayer}} está tentando {{action[[roubar]]}} de {{secondaryPlayer}}",
      [Actions.Tax]:
        "{{primaryPlayer}} está tentando cobrar {{action[[imposto]]}}",
    },
    [EventMessages.ActionProcessed]: {
      [Actions.Assassinate]:
        "{{primaryPlayer}} {{action[[assassinou]]}} {{secondaryPlayer}}",
      [Actions.Coup]:
        "{{primaryPlayer}} {{action[[golpeou]]}} {{secondaryPlayer}}",
      [Actions.Exchange]: "{{primaryPlayer}} {{action[[trocou]]}} influências",
      [Actions.ForeignAid]:
        "{{primaryPlayer}} recebeu {{action[[ajuda externa]]}}",
      [Actions.Income]: "{{primaryPlayer}} coletou {{action[[renda]]}}",
      [Actions.Steal]:
        "{{primaryPlayer}} {{action[[roubou]]}} de {{secondaryPlayer}}",
      [Actions.Tax]: "{{primaryPlayer}} coubrou {{action[[imposto]]}}",
    },
    [EventMessages.BlockFailed]:
      "{{primaryPlayer}} não conseguiu bloquear {{secondaryPlayer}}",
    [EventMessages.BlockPending]:
      "{{primaryPlayer}} está tentando bloquear {{secondaryPlayer}} como {{primaryInfluence}}",
    [EventMessages.BlockSuccessful]:
      "{{primaryPlayer}} bloqueou {{secondaryPlayer}} com sucesso",
    [EventMessages.ChallengeFailed]:
      "{{primaryPlayer}} não conseguiu desafiar {{secondaryPlayer}}",
    [EventMessages.ChallengePending]:
      "{{primaryPlayer}} está desafiando {{secondaryPlayer}}",
    [EventMessages.ChallengeSuccessful]:
      "{{primaryPlayer}} desafiou {{secondaryPlayer}} com sucesso",
    [EventMessages.GameStarted]: "O jogo começou",
    [EventMessages.PlayerDied]: "{{primaryPlayer}} está fora!",
    [EventMessages.PlayerForfeited]: "{{primaryPlayer}} desistiu do jogo!",
    [EventMessages.PlayerLostInfluence]:
      "{{primaryPlayer}} perdeu seu {{primaryInfluence}}",
    [EventMessages.PlayerReplacedInfluence]:
      "{{primaryPlayer}} revelou e substituiu {{primaryInfluence}}",
    [EventMessages.PlayerReplacedWithAi]:
      "{{primaryPlayer}} foi substituído por um jogador IA",
    forfeit: "Desistir",
    forfeitConfirmationMessage:
      "Você quer matar suas influências ou se substituir por um jogador IA?",
    forfeitConfirmationTitle: "Desistir do jogo",
    forfeitKillInfluences: "Mate as influências",
    forfeitNotPossible: "Você não pode desistir do jogo no momento",
    forfeitReplaceWithAi: "Substituir por IA",
    fullRules: "Regras completas",
    gameNotFound: "Jogo não encontrado",
    goal: "Meta",
    home: "Início",
    honesty: "Honestidade",
    influence: "Influência",
    influenceWasClaimed: "{{primaryInfluence}} foi declarado",
    influences: "Influências",
    [Influences.Ambassador]: "Embaixador",
    [Influences.Assassin]: "Assassino",
    [Influences.Captain]: "Capitão",
    [Influences.Contessa]: "Contessa",
    [Influences.Duke]: "Duque",
    inviteLinkCopied: "Link de convite copiado",
    joinExistingGame: "Participe de um jogo",
    joinGame: "Entre no jogo",
    keepInfluences:
      "Manter {{primaryInfluence}}{{plural[[ e {{secondaryInfluence}}]]}}",
    killAnInfluence: "Mate uma influência",
    language: "Idioma",
    light: "Claro",
    loseInfluence: "Perder {{primaryInfluence}}",
    losingAChallenge: "Perdendo um desafio",
    losingInfluence: "Perdendo influência",
    messageWasDeleted: "Mensagem foi descartada",
    noChatMessages: "Nenhuma mensagem",
    notEnoughCoins: "Moedas insuficientes",
    numberOfPlayers: "Número de jogadores",
    pageNotFound: "Página não encontrada",
    payCoins: "Pague {{count}} moeda{{plural[[s]]}}",
    personalityIsHidden: "Personalidade está oculta",
    playAgain: "Jogar novamente",
    playerTurn: "A vez de {{primaryPlayer}}",
    playerWantToReset: "{{primaryPlayer}} quer reiniciar o jogo",
    playerWins: "{{primaryPlayer}} vence!",
    random: "Aleatório",
    reportBug: "Reportar bug",
    requestFeature: "Solicitar recurso",
    resetGame: "Reiniciar jogo",
    [Responses.Block]: "Bloquear",
    [Responses.Challenge]: "Desafiar",
    [Responses.Pass]: "Passar",
    revealInfluence: "Revelar {{primaryInfluence}}",
    room: "Sala",
    rules: "Regras",
    rulesActions:
      "Os jogadores se revezam realizando uma destas ações disponíveis:",
    rulesAmbassador:
      "Pode trocar suas cartas de influência por novas do baralho e bloquear tentativas de roubo.",
    rulesAssassin:
      "Pode forçar um jogador a descartar uma carta de influência.",
    rulesAssassinate:
      "Custa três moedas. Force um jogador a descartar uma carta de Influência de sua escolha. Pode ser desafiado. Pode ser bloqueado pela Contessa.",
    rulesBlock:
      "Se outro jogador realizar uma ação que possa ser Bloqueada, o jogador alvo, ou qualquer pessoa no caso de Ajuda Externa, poderá Bloqueá-la alegando ter o personagem adequado em uma de suas cartas de Influência. O jogador agente não pode realizar a ação e não realiza nenhuma outra ação neste turno. Qualquer jogador pode escolher desafiar o jogador bloqueador. Se vencerem o Desafio, a ação prosseguirá normalmente.",
    rulesCaptain:
      "Pode roubar duas moedas de outro jogador e bloquear tentativas de roubo.",
    rulesChallenge:
      "Quando o jogador agente declara sua ação, qualquer outro jogador pode contestar seu direito de realizar a ação. Eles estão dizendo: “Não acredito que você tenha o caráter adequado para fazer isso”. O jogador atuante agora deve provar que tem o poder de realizar a ação ou perderá o Desafio. Se tiverem o personagem certo, eles o revelam e colocam a carta revelada de volta no baralho. Eles então embaralham o baralho e compram uma nova carta. O jogador Desafiador perdeu o Desafio. Se não tiverem o caráter adequado, perdem o Desafio.",
    rulesContents: "Baralho de cartas de influência, banco de moedas.",
    rulesContessa: "Pode bloquear tentativas de assassinato.",
    rulesCoup:
      "Custa sete moedas. Faça com que um jogador descarte uma carta de Influência. Não pode ser desafiado ou bloqueado. Se você começar seu turno com 10 moedas ou mais, você será forçado a realizar esta ação.",
    rulesDuke: "Pode cobrar impostos e bloquear ajuda externa.",
    rulesExchange:
      "Pegue duas cartas de Influência do baralho, observe-as e misture-as com suas cartas de Influência atuais. Coloque duas cartas de volta no baralho e embaralhe-o. Pode ser desafiado. Não pode ser bloqueado.",
    rulesForeignAid:
      "Pegue duas moedas do banco. Não pode ser desafiado. Pode ser bloqueado pelo duque.",
    rulesGoal: "Ser o único jogador com cartas de influência restantes.",
    rulesIncome:
      "Pegue uma moeda do banco. Não pode ser desafiado ou bloqueado.",
    rulesInfluences:
      "Existem cinco personagens diferentes no baralho de influência (três de cada personagem).",
    rulesLosingAChallenge:
      "Qualquer jogador que perder um Desafio deve virar uma de suas cartas de Influência para que todos possam ver. Se esta for a última carta de Influência, eles estão fora do jogo.",
    rulesLosingInfluence:
      "Sempre que um jogador perde uma carta de Influência, ele escolhe qual das suas cartas revelar.",
    rulesSetup:
      "Embaralhe as cartas e distribua duas para cada jogador. Os jogadores devem olhar para as suas cartas, mas mantê-las escondidas de todos os outros. Cada jogador pega duas moedas do banco como riqueza inicial. Num jogo com apenas dois jogadores, o jogador inicial começa o jogo com uma moeda em vez de duas.",
    rulesSteal:
      "Pegue duas moedas de outro jogador. Pode ser desafiado. Pode ser bloqueado pelo Capitão ou Embaixador.",
    rulesTax:
      "Pegue três moedas do banco. Pode ser desafiado. Não pode ser bloqueado.",
    send: "Enviar",
    settings: "Configurações",
    setup: "Configurar",
    skepticism: "Ceticismo",
    startGame: "Iniciar jogo",
    startingPlayerBeginsWith1Coin:
      "2 jogadores, o jogador inicial começará com 1 moeda",
    steal2CoinsFromSomeone: "Rouba 2 moedas de alguém",
    system: "Sistema",
    title: "Golpe",
    vengefulness: "Vingança",
    waitingOnOtherPlayers: "Esperando por outros jogadores",
    websocketsConnection: "Conexão WebSockets",
    welcomeToCoup: "Bem vindo ao Golpe!",
    whatIsBotsName: "Qual é seu nome?",
    whatIsYourName: "Qual o seu nome?",
    writeNewMessage: "Escreva nova mensagem",
    youAreSpectating: "Você está assistindo",
  },
}

export default translations
