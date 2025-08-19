import { AvailableLanguageCode } from '../../../shared/i18n/availableLanguages'
import { translate } from '../i18n/translations'

export class GameMutationInputError extends Error {
  getMessage: (language: AvailableLanguageCode) => string
  httpCode?: number
}

export class ActionNotChallengeableError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'actionNotChallengeable',
      language
    })
  }
}

export class ActionNotCurrentlyAllowedError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'actionNotCurrentlyAllowed',
      language
    })
  }
}

export class BlockMayNotBeBlockedError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'blockMayNotBeBlocked',
      language
    })
  }
}

export class ClaimedInfluenceAlreadyConfirmedError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'claimedInfluenceAlreadyConfirmed',
      language
    })
  }
}

export class ClaimedInfluenceInvalidError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'claimedInfluenceInvalid',
      language
    })
  }
}

export class ClaimedInfluenceRequiredError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'claimedInfluenceRequired',
      language
    })
  }
}

export class DeckIsEmptyError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'deckIsEmpty',
      language
    })
  }
}

export class DifferentPlayerNameError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor(playerName: string) {
    super()
    this.getMessage = (language) => translate({
      key: 'joinAsPlayerName',
      language,
      variables: { playerName }
    })
  }
}

export class EveryonePassedWithPendingDecisionError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'everyonePassedWithPendingDecision',
      language
    })
  }
}

export class GameInProgressError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'gameInProgress',
      language
    })
  }
}

export class GameNeedsAtLeast2PlayersToStartError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'gameNeedsAtLeast2PlayersToStart',
      language
    })
  }
}

export class GameNotInProgressError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'gameNotInProgress',
      language
    })
  }
}

export class GameOverError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'gameOver',
      language
    })
  }
}

export class IncorrectTotalCardCountError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'incorrectTotalCardCount',
      language
    })
  }
}

export class InsufficientCoinsError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'insufficientCoins',
      language
    })
  }
}

export class InvalidActionAt10CoinsError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'invalidActionAt10Coins',
      language
    })
  }
}

export class InvalidPlayerCountError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor(max: number) {
    super()
    this.getMessage = (language) => translate({
      key: 'invalidPlayerCount',
      language,
      variables: { count: max }
    })
  }
}

export class InvalidTurnPlayerError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'invalidTurnPlayer',
      language
    })
  }
}

export class MessageDoesNotExistError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'messageDoesNotExist',
      language
    })
  }
}

export class MessageIsNotYoursError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'messageIsNotYours',
      language
    })
  }
}

export class MissingInfluenceError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'missingInfluence',
      language
    })
  }
}

export class NoDeadInfluencesError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'noDeadInfluences',
      language
    })
  }
}

export class PlayerNotInGameError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'playerNotInGame',
      language
    })
  }
}

export class PlayersMustHave2InfluencesError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'playersMustHave2Influences',
      language
    })
  }
}

export class ReviveNotAllowedInGameError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'reviveNotAllowedInGame',
      language
    })
  }
}

export class RoomAlreadyHasPlayerError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor(playerName: string) {
    super()
    this.getMessage = (language) => translate({
      key: 'roomAlreadyHasPlayer',
      language,
      variables: { playerName }
    })
  }
}

export class RoomIsFullError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor(roomId: string) {
    super()
    this.getMessage = (language) => translate({
      key: 'roomIsFull',
      language,
      variables: { roomId }
    })
  }
}

export class RoomNotFoundError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.httpCode = 404
    this.getMessage = (language) => translate({
      key: 'roomNotFound',
      language
    })
  }
}

export class TargetPlayerIsSelfError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'targetPlayerIsSelf',
      language
    })
  }
}

export class StateChangedSinceValidationError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'stateChangedSinceValidation',
      language
    })
  }
}

export class TargetPlayerNotAllowedForActionError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'targetPlayerNotAllowedForAction',
      language
    })
  }
}

export class TargetPlayerRequiredForActionError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'targetPlayerRequiredForAction',
      language
    })
  }
}

export class UnableToDetermineNextPlayerTurnError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'unableToDetermineNextPlayerTurn',
      language
    })
  }
}

export class UnableToFindPlayerError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'unableToFindPlayer',
      language
    })
  }
}

export class UnableToForfeitError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'unableToForfeit',
      language
    })
  }
}

export class WrongPlayerIdOnSocketError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'wrongPlayerIdOnSocket',
      language
    })
  }
}

export class YouAreDeadError extends GameMutationInputError {
  getMessage: (language: AvailableLanguageCode) => string

  constructor() {
    super()
    this.getMessage = (language) => translate({
      key: 'youAreDead',
      language
    })
  }
}
