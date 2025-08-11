import { AvailableLanguageCode } from '../../../shared/i18n/availableLanguages'

type TranslationsForString = { [key in AvailableLanguageCode]: string }
type AllTranslations = { [key: string]: TranslationsForString }

const translations = {
  actionNotChallengeable: {
    'de-DE': 'Diese Aktion kann nicht angefochten werden',
    'en-US': 'This action cannot be challenged',
    'es-MX': 'Esta acción no se puede impugnar',
    'fr-FR': 'Cette action ne peut pas être contestée',
    'it-IT': 'Questa azione non può essere contestata',
    'pt-BR': 'Esta ação não pode ser contestada'
  },
  actionNotCurrentlyAllowed: {
    'de-DE': 'Diese Aktion ist gerade nicht erlaubt',
    'en-US': 'You can\'t take this action right now',
    'es-MX': 'No puedes tomar esta acción en este momento',
    'fr-FR': 'Vous ne pouvez pas effectuer cette action pour le moment',
    'it-IT': 'Non puoi eseguire questa azione in questo momento',
    'pt-BR': 'Você não pode realizar esta ação no momento'
  },
  blockMayNotBeBlocked: {
    'de-DE': 'Du kannst einen Block nicht blockieren',
    'en-US': 'You can\'t block a block',
    'es-MX': 'No puedes bloquear un bloqueo',
    'fr-FR': 'Vous ne pouvez pas bloquer un bloc',
    'it-IT': 'Non puoi bloccare un blocco',
    'pt-BR': 'Você não pode bloquear um bloqueio'
  },
  claimedInfluenceAlreadyConfirmed: {
    'de-DE': 'Der beanspruchte Einfluss wurde bereits bestätigt',
    'en-US': 'Claimed influence has already been confirmed',
    'es-MX': 'La influencia reclamada ya ha sido confirmada',
    'fr-FR': 'L\'influence revendiquée a déjà été confirmée',
    'it-IT': 'L\'influenza rivendicata è già stata confermata',
    'pt-BR': 'A influência reivindicada já foi confirmada'
  },
  claimedInfluenceInvalid: {
    'de-DE': 'Der beanspruchte Einfluss ist ungültig',
    'en-US': 'Claimed influence is invalid',
    'es-MX': 'La influencia reclamada es inválida',
    'fr-FR': 'L\'influence revendiquée est invalide',
    'it-IT': 'L\'influenza rivendicata è invalida',
    'pt-BR': 'A influência reivindicada é inválida'
  },
  claimedInfluenceRequired: {
    'de-DE': 'Der beanspruchte Einfluss ist erforderlich',
    'en-US': 'Claimed influence is required',
    'es-MX': 'Se requiere influencia reclamada',
    'fr-FR': 'L\'influence revendiquée est requise',
    'it-IT': 'L\'influenza rivendicata è necessaria',
    'pt-BR': 'A influência reivindicada é necessária'
  },
  deckIsEmpty: {
    'de-DE': 'Das Deck ist leer',
    'en-US': 'Deck is empty',
    'es-MX': 'El mazo está vacío',
    'fr-FR': 'Le deck est vide',
    'it-IT': 'Il mazzo è vuoto',
    'pt-BR': 'O baralho está vazio'
  },
  everyonePassedWithPendingDecision: {
    'de-DE': 'Alle haben gepasst, aber eine Entscheidung steht noch aus',
    'en-US': 'Everyone has passed but a decision is still pending',
    'es-MX': 'Todos han pasado, pero una decisión aún está pendiente',
    'fr-FR': 'Tout le monde a passé, mais une décision est toujours en attente',
    'it-IT': 'Tutti hanno passato, ma una decisione è ancora in sospeso',
    'pt-BR': 'Todos passaram, mas uma decisão ainda está pendente'
  },
  gameInProgress: {
    'de-DE': 'Das Spiel ist im Gange',
    'en-US': 'Game is in progress',
    'es-MX': 'El juego está en curso',
    'fr-FR': 'Le jeu est en cours',
    'it-IT': 'Il gioco è in corso',
    'pt-BR': 'O jogo está em andamento'
  },
  gameNeedsAtLeast2PlayersToStart: {
    'de-DE': 'Das Spiel benötigt mindestens 2 Spieler, um zu starten',
    'en-US': 'Game needs at least 2 players to start',
    'es-MX': 'El juego necesita al menos 2 jugadores para comenzar',
    'fr-FR': 'Le jeu a besoin d\'au moins 2 joueurs pour commencer',
    'it-IT': 'Il gioco ha bisogno di almeno 2 giocatori per iniziare',
    'pt-BR': 'O jogo precisa de pelo menos 2 jogadores para começar'
  },
  gameNotInProgress: {
    'de-DE': 'Das Spiel ist noch nicht im Gange',
    'en-US': 'Game is not in progress yet',
    'es-MX': 'El juego aún no está en curso',
    'fr-FR': 'Le jeu n\'est pas encore en cours',
    'it-IT': 'Il gioco non è ancora in corso',
    'pt-BR': 'O jogo ainda não está em andamento'
  },
  gameOver: {
    'de-DE': 'Das Spiel ist vorbei',
    'en-US': 'Game is over',
    'es-MX': 'El juego ha terminado',
    'fr-FR': 'Le jeu est terminé',
    'it-IT': 'Il gioco è finito',
    'pt-BR': 'O jogo acabou'
  },
  incorrectTotalCardCount: {
    'de-DE': 'Falsche Gesamtanzahl der Karten im Spiel',
    'en-US': 'Incorrect total card count in game',
    'es-MX': 'Recuento total de cartas incorrecto en el juego',
    'fr-FR': 'Nombre total de cartes incorrect dans le jeu',
    'it-IT': 'Conteggio totale delle carte errato nel gioco',
    'pt-BR': 'Contagem total de cartas incorreta no jogo'
  },
  insufficientCoins: {
    'de-DE': 'Du hast nicht genug Münzen',
    'en-US': 'You don\'t have enough coins',
    'es-MX': 'No tienes suficientes monedas',
    'fr-FR': 'Vous n\'avez pas assez de pièces',
    'it-IT': 'Non hai abbastanza monete',
    'pt-BR': 'Você não tem moedas suficientes'
  },
  invalidActionAt10Coins: {
    'de-DE': 'Ungültige Aktion, wenn du 10 oder mehr Münzen hast',
    'en-US': 'Invalid action when you have 10 or more coins',
    'es-MX': 'Acción inválida cuando tienes 10 o más monedas',
    'fr-FR': 'Action invalide lorsque vous avez 10 pièces ou plus',
    'it-IT': 'Azione non valida quando hai 10 o più monete',
    'pt-BR': 'Ação inválida quando você tem 10 ou mais moedas'
  },
  invalidPlayerCount: {
    'de-DE': 'Das Spiel muss zwischen 1 und {{count}} Spielern haben',
    'en-US': 'Game must have between 1 and {{count}} players',
    'es-MX': 'El juego debe tener entre 1 y {{count}} jugadores',
    'fr-FR': 'Le jeu doit avoir entre 1 et {{count}} joueurs',
    'it-IT': 'Il gioco deve avere tra 1 e {{count}} giocatori',
    'pt-BR': 'O jogo deve ter entre 1 e {{count}} jogadores'
  },
  invalidTurnPlayer: {
    'de-DE': 'Ungültiger Zugspieler',
    'en-US': 'Invalid turn player',
    'es-MX': 'Jugador de turno inválido',
    'fr-FR': 'Joueur de tour invalide',
    'it-IT': 'Giocatore di turno non valido',
    'pt-BR': 'Jogador de turno inválido'
  },
  invalidUserRequest: {
    'de-DE': 'Ungültige Benutzeranfrage',
    'en-US': 'Invalid user request',
    'es-MX': 'Solicitud de usuario no válida',
    'fr-FR': 'Demande d\'utilisateur invalide',
    'it-IT': 'Richiesta utente non valida',
    'pt-BR': 'Solicitação de usuário inválida'
  },
  joinAsPlayerName: {
    'de-DE': 'Du kannst dem Spiel als "{{playerName}}" beitreten',
    'en-US': 'You can join the game as "{{playerName}}"',
    'es-MX': 'Puedes unirte al juego como "{{playerName}}"',
    'fr-FR': 'Vous pouvez rejoindre le jeu en tant que "{{playerName}}"',
    'it-IT': 'Puoi unirti al gioco come "{{playerName}}"',
    'pt-BR': 'Você pode entrar no jogo como "{{playerName}}"'
  },
  messageDoesNotExist: {
    'de-DE': 'Nachricht existiert nicht',
    'en-US': 'Message does not exist',
    'es-MX': 'La mensaje no existe',
    'fr-FR': 'Le message n\'existe pas',
    'it-IT': 'Il messaggio non esiste',
    'pt-BR': 'A mensagem não existe'
  },
  messageIsNotYours: {
    'de-DE': 'Die Nachricht gehört dir nicht',
    'en-US': 'Message is not yours',
    'es-MX': 'El mensaje no es tuyo',
    'fr-FR': 'Le message ne vous appartient pas',
    'it-IT': 'Il messaggio non è tuo',
    'pt-BR': 'A mensagem não é sua'
  },
  missingInfluence: {
    'de-DE': 'Du hast den erforderlichen Einfluss nicht',
    'en-US': 'You don\'t have the required influence',
    'es-MX': 'No tienes la influencia requerida',
    'fr-FR': 'Vous n\'avez pas l\'influence requise',
    'it-IT': 'Non hai l\'influenza richiesta',
    'pt-BR': 'Você não tem a influência necessária'
  },
  noDeadInfluences: {
    'de-DE': 'Keine toten Einflüsse',
    'en-US': 'No dead influences',
    'es-MX': 'Sin influencias muertas',
    'fr-FR': 'Pas d\'influences mortes',
    'it-IT': 'Nessuna influenza morta',
    'pt-BR': 'Sem influências mortas'
  },
  playerNotInGame: {
    'de-DE': 'Spieler ist nicht im Spiel',
    'en-US': 'Player is not in the game',
    'es-MX': 'El jugador no está en el juego',
    'fr-FR': 'Le joueur n\'est pas dans le jeu',
    'it-IT': 'Il giocatore non è nel gioco',
    'pt-BR': 'O jogador não está no jogo'
  },
  playersMustHave2Influences: {
    'de-DE': 'Spieler müssen genau 2 Einflüsse haben',
    'en-US': 'Players must have exactly 2 influences',
    'es-MX': 'Los jugadores deben tener exactamente 2 influencias',
    'fr-FR': 'Les joueurs doivent avoir exactement 2 influences',
    'it-IT': 'I giocatori devono avere esattamente 2 influenze',
    'pt-BR': 'Os jogadores devem ter exatamente 2 influências'
  },
  reviveNotAllowedInGame: {
    'de-DE': 'Wiederbelebung im Spiel nicht erlaubt',
    'en-US': 'Revive not allowed in game',
    'es-MX': 'Revivir no permitido en el juego',
    'fr-FR': 'Ressusciter non autorisé dans le jeu',
    'it-IT': 'Rivivere non consentito nel gioco',
    'pt-BR': 'Reviver não permitido no jogo'
  },
  roomAlreadyHasPlayer: {
    'de-DE': 'Der Raum hat bereits einen Spieler namens "{{playerName}}"',
    'en-US': 'Room already has a player named "{{playerName}}"',
    'es-MX': 'La sala ya tiene un jugador llamado "{{playerName}}"',
    'fr-FR': 'La chambre a déjà un joueur nommé "{{playerName}}"',
    'it-IT': 'La stanza ha già un giocatore di nome "{{playerName}}"',
    'pt-BR': 'A sala já tem um jogador chamado "{{playerName}}"'
  },
  roomIsFull: {
    'de-DE': 'Der Raum {{roomId}} ist voll',
    'en-US': 'Room {{roomId}} is full',
    'es-MX': 'La sala {{roomId}} está llena',
    'fr-FR': 'La chambre {{roomId}} est pleine',
    'it-IT': 'La stanza {{roomId}} è piena',
    'pt-BR': 'A sala {{roomId}} está cheia'
  },
  roomNotFound: {
    'de-DE': "Raum nicht gefunden",
    'en-US': "Room not found",
    'es-MX': "Sala no encontrada",
    'fr-FR': "Chambre non trouvée",
    'it-IT': "Stanza non trovata",
    'pt-BR': "Sala não encontrada"
  },
  stateChangedSinceValidation: {
    'de-DE': 'Der Status hat sich seit der Validierung geändert',
    'en-US': 'State has changed since validation',
    'es-MX': 'El estado ha cambiado desde la validación',
    'fr-FR': 'L\'état a changé depuis la validation',
    'it-IT': 'Lo stato è cambiato dalla convalida',
    'pt-BR': 'O estado mudou desde a validação'
  },
  targetPlayerIsSelf: {
    'de-DE': 'Du kannst dich nicht selbst anvisieren',
    'en-US': 'You can not target yourself',
    'es-MX': 'No puedes apuntarte a ti mismo',
    'fr-FR': 'Vous ne pouvez pas vous cibler vous-même',
    'it-IT': 'Non puoi mirare a te stesso',
    'pt-BR': 'Você não pode se mirar'
  },
  targetPlayerNotAllowedForAction: {
    'de-DE': 'Zielspieler für Aktion nicht erlaubt',
    'en-US': 'Target player not allowed for action',
    'es-MX': 'Jugador objetivo no permitido para la acción',
    'fr-FR': 'Joueur cible non autorisé pour l\'action',
    'it-IT': 'Giocatore target non consentito per l\'azione',
    'pt-BR': 'Jogador alvo não permitido para a ação'
  },
  targetPlayerRequiredForAction: {
    'de-DE': 'Zielspieler für Aktion erforderlich',
    'en-US': 'Target player required for action',
    'es-MX': 'Se requiere jugador objetivo para la acción',
    'fr-FR': 'Joueur cible requis pour l\'action',
    'it-IT': 'Giocatore target richiesto per l\'azione',
    'pt-BR': 'Jogador alvo necessário para a ação'
  },
  unableToDetermineNextPlayerTurn: {
    'de-DE': 'Nächsten Zugspieler nicht bestimmt',
    'en-US': 'Unable to determine next player turn',
    'es-MX': 'No se pudo determinar el siguiente turno del jugador',
    'fr-FR': 'Impossible de déterminer le prochain tour du joueur',
    'it-IT': 'Impossibile determinare il prossimo turno del giocatore',
    'pt-BR': 'Não foi possível determinar o próximo turno do jogador'
  },
  unableToFindPendingAction: {
    'de-DE': 'Ausstehende Aktion nicht gefunden',
    'en-US': 'Unable to find pending action',
    'es-MX': 'No se pudo encontrar la acción pendiente',
    'fr-FR': 'Impossible de trouver l\'action en attente',
    'it-IT': 'Impossibile trovare l\'azione in sospeso',
    'pt-BR': 'Não foi possível encontrar a ação pendente'
  },
  unableToFindPlayer: {
    'de-DE': 'Spieler nicht gefunden',
    'en-US': 'Unable to find player',
    'es-MX': 'Jugador no encontrado',
    'fr-FR': 'Joueur non trouvé',
    'it-IT': 'Giocatore non trovato',
    'pt-BR': 'Jogador não encontrado'
  },
  unableToForfeit: {
    'de-DE': 'Du kannst das Spiel im Moment nicht aufgeben',
    'en-US': 'You can\'t forfeit the game at this time',
    'es-MX': 'No puedes rendirte en este momento',
    'fr-FR': 'Vous ne pouvez pas abandonner le jeu pour le moment',
    'it-IT': 'Non puoi rinunciare al gioco in questo momento',
    'pt-BR': 'Você não pode desistir do jogo neste momento'
  },
  wrongPlayerIdOnSocket: {
    'de-DE': 'Falsche Spieler-ID im Socket',
    'en-US': 'Wrong player ID on socket',
    'es-MX': 'ID de jugador incorrecta en el socket',
    'fr-FR': 'ID de joueur incorrecte sur le socket',
    'it-IT': 'ID giocatore errato sul socket',
    'pt-BR': 'ID de jogador incorreta no socket'
  },
  youAreDead: {
    'de-DE': 'Du bist tot',
    'en-US': 'You are dead',
    'es-MX': 'Estás muerto',
    'fr-FR': 'Vous êtes mort',
    'it-IT': 'Sei morto',
    'pt-BR': 'Você está morto'
  }
} as const satisfies AllTranslations

type TranslationKey = keyof typeof translations;
type Variables = {
  count?: number;
  [key: string]: string | number;
};

export const translate = ({ key, language, variables }: {
  key: TranslationKey,
  language: AvailableLanguageCode,
  variables?: Variables
}): string => {
  let template = translations[key][language] as string

  if (!variables) return template

  const vars = { ...variables }

  if (vars.count !== undefined) {
    template = template.replaceAll('{{count}}', vars.count.toString())
    const pluralRegex = /\{\{plural\[\[(.+?)\]\]\}\}/g
    template = template.replaceAll(pluralRegex, (replaceMatch) => {
      const plural = replaceMatch.matchAll(pluralRegex).next().value?.[1]
      return (vars.count !== 1 && plural) || ''
    })
    delete vars.count
  }

  Object.entries(vars).forEach(([key, value]) => {
    template = template.replaceAll(`{{${key}}}`, value.toString())
  })

  return template
}
