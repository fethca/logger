import { Parser } from './parser.js'

export class AppParser extends Parser {
  parse(payload?: unknown): unknown {
    if (this.isObject(payload)) {
      return {
        app: String(payload.name),
        version: String(payload.version),
        env: String(payload.env),
      }
    }
  }
}
