import { randomBytes } from 'crypto'
import mockdate from 'mockdate'
import { Parser } from '../../src/index.js'
import { Logger } from '../../src/logger.js'
import { ForwardedError } from '../../src/parsers/error.js'

vi.mock('crypto')

mockdate.set('2022-01-01T00:00:00.000Z')

beforeEach(() => {
  vi.mocked<(size: number) => Buffer>(randomBytes).mockReturnValue(Buffer.from('toto'))
  vi.spyOn(console, 'info').mockImplementation(() => undefined)
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

describe('create', () => {
  it('should return instance of logger', () => {
    const logger = Logger.create('instanceId', {}, { app: 'test', env: 'test', version: '1' })
    expect(logger).toBeInstanceOf(Logger)
  })

  it('should return logger with options', () => {
    const logger = Logger.create('instanceId', { silent: false }, { app: 'test', env: 'test', version: '1' })
    expect(logger).toBeInstanceOf(Logger)
  })
})

describe('constructor', () => {
  it('should create job ID', () => {
    const logger = new Logger('instanceId', {}, { app: 'test', env: 'test', version: '1' })
    expect(logger.jobId).toBe('746f746f')
  })

  it('should add meta', () => {
    vi.spyOn(Logger.prototype, 'addMeta')
    const logger = new Logger('instanceId', {}, { app: 'test', env: 'test', version: '1', prop: 'value' })
    expect(logger.addMeta).toHaveBeenCalledWith({ prop: 'value' })
    expect(logger['meta']).toEqual({ app: 'test', env: 'test', version: '1', prop: 'value' })
  })
})

describe('child', () => {
  it('should return new child Logger', () => {
    const logger = new Logger('instanceId', {}, { app: 'test', env: 'test', version: '1', prop: 'value' })
    const child = logger.child()
    expect(child).toBeInstanceOf(Logger)
    expect(child['instanceId']).toBe('instanceId')
    expect(child['meta']).toEqual({ app: 'test', env: 'test', version: '1', prop: 'value' })
  })
})

describe('getParser', () => {
  it('should get parser', () => {
    class MockParser extends Parser {}
    const logger = new Logger('instanceId', {}, { app: 'test', env: 'test', version: '1' })
    logger.setParser('toto', new MockParser())
    expect(logger['getParser']('toto')).toBeInstanceOf(MockParser)
  })

  it('should default parser if no parser exists', () => {
    const logger = new Logger('instanceId', {}, { app: 'test', env: 'test', version: '1' })
    expect(logger['getParser']('toto')).toBeInstanceOf(Parser)
  })
})

describe('setParser', () => {
  it('should set parser', () => {
    class MockParser extends Parser {}
    const logger = new Logger('instanceId', {}, { app: 'test', env: 'test', version: '1' })
    logger.setParser('toto', new MockParser())
    expect(logger['parsers']['toto']).toBeInstanceOf(MockParser)
  })
})

describe('addMeta', () => {
  it('should add meta', () => {
    const logger = new Logger('instanceId', {}, { app: 'test', env: 'test', version: '1' })
    logger.addMeta({ prop: 'value' })
    expect(logger['meta']).toEqual({ app: 'test', env: 'test', version: '1', prop: 'value' })
  })
})

describe('action', () => {
  it('should log info for action meta', () => {
    const logger = new Logger('instanceId', {}, { app: 'test', env: 'test', version: '1' })
    logger['info'] = vi.fn()
    logger.action('app_start', { prop: 'value' })
    expect(logger.info).toHaveBeenCalledWith('app_start', { prop: 'value', actionId: '746f746f' })
  })

  it('should return action', () => {
    const logger = new Logger('instanceId', {}, { app: 'test', env: 'test', version: '1' })
    const result = logger.action('app_start', { prop: 'value' })
    expect(result).toEqual({ success: expect.any(Function), skip: expect.any(Function), failure: expect.any(Function) })
  })

  it('should log success', () => {
    const logger = new Logger('instanceId', {}, { app: 'test', env: 'test', version: '1' })
    logger['info'] = vi.fn()
    const actions = logger.action('app_start', { prop: 'value' })
    actions.success({ prop2: 'value2' })
    expect(logger.info).toHaveBeenCalledWith('app_start_success', {
      prop: 'value',
      prop2: 'value2',
      actionId: '746f746f',
      duration: 0,
    })
  })

  it('should log skip', () => {
    const logger = new Logger('instanceId', {}, { app: 'test', env: 'test', version: '1' })
    logger['info'] = vi.fn()
    const actions = logger.action('app_start', { prop: 'value' })
    actions.skip('reason', { prop2: 'value2' })
    expect(logger.info).toHaveBeenCalledWith('app_start_skip', {
      cause: 'reason',
      prop: 'value',
      prop2: 'value2',
      actionId: '746f746f',
      duration: 0,
    })
  })

  it('should log failure', () => {
    const logger = new Logger('instanceId', {}, { app: 'test', env: 'test', version: '1' })
    logger['error'] = vi.fn()
    const actions = logger.action('app_start', { prop: 'value' })
    actions.failure(new Error('500'), { prop2: 'value2' })
    expect(logger.error).toHaveBeenCalledWith('app_start_failure', {
      error: new Error('500'),
      prop: 'value',
      prop2: 'value2',
      actionId: '746f746f',
      duration: 0,
    })
  })

  it('should should return forwarded error on failure', () => {
    const logger = new Logger('instanceId', {}, { app: 'test', env: 'test', version: '1' })
    const actions = logger.action('app_start', { prop: 'value' })
    const error = actions.failure(new Error('500'), { prop2: 'value2' })
    expect(error).toBeInstanceOf(ForwardedError)
    expect(error.message).toBe('500')
    expect(error.path).toBe('app_start')
  })
})

describe('actions', () => {
  it('should log info for action meta', () => {
    const logger = new Logger('instanceId', {}, { app: 'test', env: 'test', version: '1' })
    logger['info'] = vi.fn()
    logger.actions('app_start', [{ id: 'id', meta: { prop: 'value' } }])
    expect(logger.info).toHaveBeenCalledWith('app_start', { prop: 'value', actionId: '746f746f' })
  })

  it('should return action', () => {
    const logger = new Logger('instanceId', {}, { app: 'test', env: 'test', version: '1' })
    const result = logger.actions('app_start', [{ id: 'id', meta: { prop: 'value' } }])
    expect(result).toEqual({ end: expect.any(Function) })
  })

  it('should log success', () => {
    const logger = new Logger('instanceId', {}, { app: 'test', env: 'test', version: '1' })
    logger['info'] = vi.fn()
    const actions = logger.actions('app_start', [{ id: 'id', meta: { prop: 'value' } }])
    actions.end([{ id: 'id', meta: { prop2: 'value2' } }])
    expect(logger.info).toHaveBeenCalledWith('app_start_success', {
      prop: 'value',
      prop2: 'value2',
      actionId: '746f746f',
      duration: 0,
    })
  })

  it('should log failure', () => {
    const logger = new Logger('instanceId', {}, { app: 'test', env: 'test', version: '1' })
    logger['error'] = vi.fn()
    const actions = logger.actions('app_start', [{ id: 'id', meta: { prop: 'value' } }])
    actions.end([{ id: 'id', meta: { prop2: 'value2' }, error: new Error('500') }])
    expect(logger.error).toHaveBeenCalledWith('app_start_failure', {
      error: new Error('500'),
      prop: 'value',
      prop2: 'value2',
      actionId: '746f746f',
      duration: 0,
    })
  })
})

describe('log', () => {
  it('should do nothing if silent', () => {
    const logger = new Logger('instanceId', { silent: true }, { app: 'test', env: 'test', version: '1' })
    logger.addMeta({ prop1: 'value1' })
    logger['log']('info', 'app_start')
    expect(console.info).not.toHaveBeenCalled()
  })

  it('should log info message without meta', () => {
    const logger = new Logger('instanceId', {}, { app: 'test', env: 'test', version: '1' })
    logger.addMeta({ prop1: 'value1' })
    logger['log']('info', 'app_start')
    expect(console.info).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2022-01-01T00:00:00.000Z',
        level: 'info',
        message: 'app_start',
        metadata: {
          traceID: 'instanceId',
          trace: { instanceId: 'instanceId', jobId: '746f746f', logId: '746f746f' },
          app: 'test',
          env: 'test',
          version: '1',
          prop1: 'value1',
        },
      }),
    )
  })

  it('should log info message and meta', () => {
    const logger = new Logger('instanceId', {}, { app: 'test', env: 'test', version: '1' })
    logger.addMeta({ prop1: 'value1' })
    logger['log']('info', 'app_start', { prop2: 'value2' })
    expect(console.info).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2022-01-01T00:00:00.000Z',
        level: 'info',
        message: 'app_start',
        metadata: {
          traceID: 'instanceId',
          trace: { instanceId: 'instanceId', jobId: '746f746f', logId: '746f746f' },
          app: 'test',
          env: 'test',
          version: '1',
          prop1: 'value1',
          prop2: 'value2',
        },
      }),
    )
  })

  it('should log warn message and meta', () => {
    const logger = new Logger('instanceId', {}, { app: 'test', env: 'test', version: '1' })
    logger.addMeta({ prop1: 'value1' })
    logger['log']('warn', 'app_start', { prop2: 'value2' })
    expect(console.warn).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2022-01-01T00:00:00.000Z',
        level: 'warn',
        message: 'app_start',
        metadata: {
          traceID: 'instanceId',
          trace: { instanceId: 'instanceId', jobId: '746f746f', logId: '746f746f' },
          app: 'test',
          env: 'test',
          version: '1',
          prop1: 'value1',
          prop2: 'value2',
        },
      }),
    )
  })

  it('should log error message and meta', () => {
    const logger = new Logger('instanceId', {}, { app: 'test', env: 'test', version: '1' })
    logger.addMeta({ prop1: 'value1' })
    logger['log']('error', 'app_start', { prop2: 'value2' })
    expect(console.error).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2022-01-01T00:00:00.000Z',
        level: 'error',
        message: 'app_start',
        metadata: {
          traceID: 'instanceId',
          trace: { instanceId: 'instanceId', jobId: '746f746f', logId: '746f746f' },
          app: 'test',
          env: 'test',
          version: '1',
          prop1: 'value1',
          prop2: 'value2',
        },
      }),
    )
  })
})

describe('info', () => {
  it('should log message and meta', () => {
    const logger = new Logger('instanceId', {}, { app: 'test', env: 'test', version: '1' })
    logger.addMeta({ prop1: 'value1' })
    logger.info('app_start', { prop2: 'value2' })
    expect(console.info).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2022-01-01T00:00:00.000Z',
        level: 'info',
        message: 'app_start',
        metadata: {
          traceID: 'instanceId',
          trace: { instanceId: 'instanceId', jobId: '746f746f', logId: '746f746f' },
          app: 'test',
          env: 'test',
          version: '1',
          prop1: 'value1',
          prop2: 'value2',
        },
      }),
    )
  })
})

describe('warn', () => {
  it('should log message and meta', () => {
    const logger = new Logger('instanceId', {}, { app: 'test', env: 'test', version: '1' })
    logger.addMeta({ prop1: 'value1' })
    logger.warn('app_start', { prop2: 'value2' })
    expect(console.warn).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2022-01-01T00:00:00.000Z',
        level: 'warn',
        message: 'app_start',
        metadata: {
          traceID: 'instanceId',
          trace: { instanceId: 'instanceId', jobId: '746f746f', logId: '746f746f' },
          app: 'test',
          env: 'test',
          version: '1',
          prop1: 'value1',
          prop2: 'value2',
        },
      }),
    )
  })
})

describe('error', () => {
  it('should log message and meta', () => {
    const logger = new Logger('instanceId', {}, { app: 'test', env: 'test', version: '1' })
    logger.addMeta({ prop1: 'value1' })
    logger.error('app_start', { prop2: 'value2' })
    expect(console.error).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2022-01-01T00:00:00.000Z',
        level: 'error',
        message: 'app_start',
        metadata: {
          traceID: 'instanceId',
          trace: { instanceId: 'instanceId', jobId: '746f746f', logId: '746f746f' },
          app: 'test',
          env: 'test',
          version: '1',
          prop1: 'value1',
          prop2: 'value2',
        },
      }),
    )
  })
})
