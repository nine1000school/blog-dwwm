export class HttpAccessError extends Error {
  constructor(message = "Forbidden") {
    super(message)
  }
}
