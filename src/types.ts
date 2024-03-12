import { ForwardedError } from './parsers/error.js'
import { Parser } from './parsers/parser.js'

export type FormatType = 'simple' | 'json'

export type ActionRecord = { id: string; meta?: Record<string, unknown> }
export type ActionResult = ActionRecord & { error?: unknown }

export interface IAction {
  success(additionalMeta?: Record<string, unknown>): void
  skip(cause: string, additionalMeta?: Record<string, unknown>): void
  failure(error: unknown, additionalMeta?: Record<string, unknown>): ForwardedError
}

export interface IActions {
  end(results: ActionResult[]): void
}

export type Message<T> =
  | T
  | 'app_start'
  | 'start_consumer'
  | 'consume_queue_failure'
  | 'start_producer'
  | 'init_bucket'
  | 'init_config'
  | 'fetch_config_failure'
  | 'app_stop'
  | 'handle_message'
  | 'parse_message'
  | 'validate_message'
  | 'process_message'
  | 'send_message'

export interface ILogger<T extends string = ''> {
  jobId: string
  child(): ILogger<T>
  setParser<U extends Record<string, unknown>>(name: string, parser: Parser<U>): void
  addMeta(meta: Record<string, unknown>): void
  action(message: Message<T>, meta?: Record<string, unknown>): IAction
  actions(message: Message<T>, records: ActionRecord[]): IActions
  info(message: Message<T>, meta?: Record<string, unknown>): void
  warn(message: Message<T>, meta?: Record<string, unknown>): void
  error(message: Message<T>, meta?: Record<string, unknown>): void
}

export type LoggerOptions = {
  colorize?: boolean
  silent?: boolean
  format?: FormatType
  file?: string
}

export type Metadata = {
  app: string
  env: string
  version: string
} & Record<string, unknown>
