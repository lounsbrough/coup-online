export class GameMutationError extends Error {
  message: string
  httpCode: number

  constructor(message: string, httpCode: number = 400) {
    super()
    this.message = message
    this.httpCode = httpCode
  }
}
