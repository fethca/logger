import { randomBytes } from 'crypto'
import { ErrorParser, ForwardedError } from './parsers/error.js'
import { Parser } from './parsers/parser.js'
import { ActionRecord, ActionResult, IAction, IActions, ILogger, Message, Metadata } from './types.js'

interface ILoggerOptions {
  silent?: boolean
}

export const defaultParsers: Record<string, Parser> = {
  default: new Parser(),
  error: new ErrorParser(),
}

export class Logger<T extends string = ''> implements ILogger<T> {
  jobId: string
  private parsers: Record<string, Parser>
  private meta: Metadata

  static create<T extends string = ''>(instanceId: string, options: ILoggerOptions, meta: Metadata): ILogger<T> {
    return new Logger(instanceId, options, meta)
  }

  constructor(
    private instanceId: string,
    private options: ILoggerOptions,
    { app, env, version, ...meta }: Metadata,
  ) {
    this.meta = { app, env, version }
    this.parsers = defaultParsers
    this.jobId = randomBytes(16).toString('hex')
    this.addMeta(meta)
  }

  child(): Logger<T> {
    return new Logger<T>(this.instanceId, this.options, this.meta)
  }

  private getParser(key: string) {
    return this.parsers[key] || this.parsers.default
  }

  setParser<U extends Record<string, unknown>>(name: string, parser: Parser<U>): void {
    this.parsers[name] = parser
  }

  addMeta(meta: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(meta)) {
      this.meta[key] = this.getParser(key).parse(value)
    }
  }

  action(message: Message<T>, meta?: Record<string, unknown>): IAction {
    const actionId = randomBytes(16).toString('hex')
    const start = Date.now()
    this.info(message, { ...meta, actionId })
    return {
      success: (successMeta?: Record<string, unknown>) => {
        const duration = Date.now() - start
        this.info(`${message}_success`, { ...meta, ...successMeta, actionId, duration })
      },
      skip: (cause: string, skipMeta?: Record<string, unknown>) => {
        const duration = Date.now() - start
        this.info(`${message}_skip`, { ...meta, ...skipMeta, cause, actionId, duration })
      },
      failure: (error: unknown, failureMeta?: Record<string, unknown>) => {
        const duration = Date.now() - start
        this.error(`${message}_failure`, { ...meta, ...failureMeta, error, actionId, duration })
        return new ForwardedError(message, error)
      },
    }
  }

  actions(message: Message<T>, records: ActionRecord[]): IActions {
    const actionId = randomBytes(16).toString('hex')
    const start = Date.now()
    const actionsMeta: Record<string, Record<string, unknown> | undefined> = {}
    for (const { id, meta } of records) {
      actionsMeta[id] = { ...meta, actionId }
      this.info(message, actionsMeta[id])
    }
    return {
      end: (results: ActionResult[]) => {
        for (const { id, meta, error } of results) {
          const duration = Date.now() - start
          if (error) {
            this.error(`${message}_failure`, { ...actionsMeta[id], ...meta, error, duration })
          } else {
            this.info(`${message}_success`, { ...actionsMeta[id], ...meta, duration })
          }
        }
      },
    }
  }

  private log(
    level: 'warn' | 'error' | 'info',
    message: string,
    { actionId, ...meta }: Record<string, unknown> = {},
  ): void {
    if (!this.options.silent) {
      const timestamp = new Date().toISOString()
      const metadata = {
        traceID: this.instanceId,
        trace: {
          instanceId: this.instanceId,
          jobId: this.jobId,
          actionId,
          logId: randomBytes(16).toString('hex'),
        },
        ...this.meta,
        ...Object.entries(meta).reduce(
          (acc, [key, value]) => ({ ...acc, [key]: this.getParser(key).parse(value) }),
          {},
        ),
      }
      console[level](JSON.stringify({ timestamp, level, message, metadata }))
    }
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log('info', message, meta)
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('warn', message, meta)
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.log('error', message, meta)
  }
}
