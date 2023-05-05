
export class MissingConfigItemError extends Error {
  constructor(item: string) {
    super(`Missing expected config item ${item}`)
  }
}
