import { deflateSync } from 'node:zlib'
import { inspect } from 'util'

export class Parser<T = Record<string, unknown>> {
  parse(info?: unknown): unknown {
    let str: string

    if (typeof info === 'string') {
      str = info
    } else if (info instanceof Buffer) {
      str = info.toString()
    } else if (!this.isObject(info)) {
      return info
    } else {
      try {
        str = JSON.stringify(info)
      } catch (error) {
        str = inspect(info)
      }
    }

    if (str.length > 1000) {
      str = deflateSync(str).toString('base64')
    }

    return str
  }

  protected isObject(param?: unknown): param is T {
    return typeof param === 'object' && param !== null
  }
}
