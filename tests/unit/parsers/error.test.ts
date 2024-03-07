import { ErrorParser, ForwardedError, IAxiosError } from '../../../src/parsers/error.js'

describe('parse', () => {
  it('should return parsed forwarded error if error is a ForwardedError', () => {
    const parser = new ErrorParser()
    parser['parseForwardedError'] = vi.fn().mockReturnValue('forwarded error')
    expect(parser.parse(new ForwardedError('cause', undefined))).toBe('forwarded error')
  })

  it('should return parsed axios error if error is an AxiosError', () => {
    const error = {
      isAxiosError: true,
      message: 'message',
      stack: 'stack',
      config: { baseURL: 'akeneo.com', url: '/api', method: 'get' },
      response: { statusText: 'OK', status: 200, data: 'Toto' },
    }
    const parser = new ErrorParser()
    parser['parseAxiosError'] = vi.fn().mockReturnValue('axios error')
    expect(parser.parse(error)).toBe('axios error')
  })

  it('should return parsed native error if error is a native error', () => {
    const parser = new ErrorParser()
    parser['parseNativeError'] = vi.fn().mockReturnValue('native error')
    expect(parser.parse(new Error('message'))).toBe('native error')
  })

  it('should return parsed error if error is an unknown error', () => {
    const parser = new ErrorParser()
    parser['parseError'] = vi.fn().mockReturnValue('error')
    expect(parser.parse('error')).toBe('error')
  })

  it('should return parsed error if error is undefined', () => {
    const parser = new ErrorParser()
    parser['parseError'] = vi.fn().mockReturnValue('error')
    expect(parser.parse(undefined)).toBe('error')
  })

  it('should return parsed error if error is null', () => {
    const parser = new ErrorParser()
    parser['parseError'] = vi.fn().mockReturnValue('error')
    expect(parser.parse(null)).toBe('error')
  })
})

describe('parseForwardedError', () => {
  it('should parse error cause', () => {
    const parser = new ErrorParser()
    parser.parse = vi.fn().mockReturnValue({})
    parser['parseForwardedError'](new ForwardedError('cause', new Error('message')))
    expect(parser.parse).toHaveBeenCalledWith(new Error('message'))
  })

  it('should return path and parsed error cause if parsed error cause is defined', () => {
    const error = new ForwardedError(
      'path',
      new ForwardedError('subpath', new ForwardedError('subsubpath', new Error('message')))
    )
    const parser = new ErrorParser()
    const result = parser['parseForwardedError'](error)
    expect(result).toEqual({ path: 'path.subpath.subsubpath', type: 'Error', message: 'message' })
  })

  it('should return parsed error if parsed error cause is not defined', () => {
    const parser = new ErrorParser()
    const result = parser['parseForwardedError'](new ForwardedError('path', undefined))
    expect(result).toEqual({ path: 'path', type: 'UnknownError' })
  })
})

describe('parseAxiosError', () => {
  it('should use default type if config is missing', () => {
    const error: IAxiosError = { isAxiosError: true }
    const result = new ErrorParser()['parseAxiosError'](error)
    expect(result.type).toBe('AxiosError')
  })

  it('should use default type if url infos are missing from config', () => {
    const error: IAxiosError = { isAxiosError: true, config: {} }
    const result = new ErrorParser()['parseAxiosError'](error)
    expect(result.type).toBe('AxiosError')
  })

  it('should infer type from url', () => {
    const error: IAxiosError = {
      isAxiosError: true,
      config: { baseURL: 'akeneo.com', url: '/api' },
    }
    const result = new ErrorParser()['parseAxiosError'](error)
    expect(result.type).toBe('PimError')
  })

  it('should use error message', () => {
    const error: IAxiosError = {
      isAxiosError: true,
      message: 'message',
    }
    const result = new ErrorParser()['parseAxiosError'](error)
    expect(result.message).toBe('message')
  })

  it('should use error code if response is missing', () => {
    const error: IAxiosError = { isAxiosError: true, code: 'ETIMEOUT' }
    const result = new ErrorParser()['parseAxiosError'](error)
    expect(result.data.message).toBe('ETIMEOUT')
  })

  it('should use error code if status text is missing from response', () => {
    const error: IAxiosError = { isAxiosError: true, code: 'ETIMEOUT', response: {} }
    const result = new ErrorParser()['parseAxiosError'](error)
    expect(result.data.message).toBe('ETIMEOUT')
  })

  it('should use response status text', () => {
    const error: IAxiosError = { isAxiosError: true, response: { statusText: 'Not found' } }
    const result = new ErrorParser()['parseAxiosError'](error)
    expect(result.data.message).toBe('Not found')
  })

  it('should not use code if response is missing', () => {
    const error: IAxiosError = { isAxiosError: true, code: 'ETIMEOUT' }
    const result = new ErrorParser()['parseAxiosError'](error)
    expect(result.data.code).toBeUndefined()
  })

  it('should not use code if status code is missing from response', () => {
    const error: IAxiosError = { isAxiosError: true, code: 'ETIMEOUT', response: {} }
    const result = new ErrorParser()['parseAxiosError'](error)
    expect(result.data.code).toBeUndefined()
  })

  it('should use response status code', () => {
    const error: IAxiosError = { isAxiosError: true, response: { status: '400' } }
    const result = new ErrorParser()['parseAxiosError'](error)
    expect(result.data.code).toBe('400')
  })

  it('should not use body if response is missing', () => {
    const error: IAxiosError = { isAxiosError: true, code: 'ETIMEOUT' }
    const result = new ErrorParser()['parseAxiosError'](error)
    expect(result.data.body).toBeUndefined()
  })

  it('should not use body if status code is missing from response', () => {
    const error: IAxiosError = { isAxiosError: true, code: 'ETIMEOUT', response: {} }
    const result = new ErrorParser()['parseAxiosError'](error)
    expect(result.data.body).toBeUndefined()
  })

  it('should use parsed response data', () => {
    const error: IAxiosError = { isAxiosError: true, response: { data: { prop: 'value' } } }
    const result = new ErrorParser()['parseAxiosError'](error)
    expect(result.data.body).toBe('{"prop":"value"}')
  })

  it('should not use url if config in missing', () => {
    const error: IAxiosError = { isAxiosError: true }
    const result = new ErrorParser()['parseAxiosError'](error)
    expect(result.config.url).toBeUndefined()
  })

  it('should not use url if url infos are missing from config', () => {
    const error: IAxiosError = { isAxiosError: true, config: {} }
    const result = new ErrorParser()['parseAxiosError'](error)
    expect(result.config.url).toBeUndefined()
  })

  it('should join url from config url infos', () => {
    const error: IAxiosError = {
      isAxiosError: true,
      config: { baseURL: 'akeneo.com', url: '/api' },
    }
    const result = new ErrorParser()['parseAxiosError'](error)
    expect(result.config.url).toBe('akeneo.com/api')
  })
})

describe('parseNativeError', () => {
  it('should use error constructor name as default type', () => {
    const result = new ErrorParser()['parseNativeError'](new Error('message'))
    expect(result.type).toBe('Error')
  })

  it('should infer type from stack', () => {
    const error = new Error('message')
    error.stack = 'aws-sdk'
    const result = new ErrorParser()['parseNativeError'](error)
    expect(result.type).toBe('AWSError')
  })

  it('should use message', () => {
    const result = new ErrorParser()['parseNativeError'](new Error('message'))
    expect(result.message).toBe('message')
  })

  it('should not use stack trace if error is not a TypeError', () => {
    const result = new ErrorParser()['parseNativeError'](new Error('message'))
    expect(result.stack).toBeUndefined()
  })

  it('should use stack trace if error is a TypeError', () => {
    const error = new TypeError('message')
    error.stack = 'stack trace'
    const result = new ErrorParser()['parseNativeError'](error)
    expect(result.stack).toBe('stack trace')
  })
})

describe('parseError', () => {
  it('should return unknown error', () => {
    const result = new ErrorParser()['parseError']('error')
    expect(result).toEqual({ type: 'UnknownError', message: 'error' })
  })
})

describe('getType', () => {
  it('should return type according to containing string', () => {
    expect(new ErrorParser()['getType']('aws-sdk')).toBe('AWSError')
  })

  it('should return undefined if type is not found', () => {
    expect(new ErrorParser()['getType']('toto')).toBeUndefined()
  })

  it('should return undefined if containing string is undefined', () => {
    expect(new ErrorParser()['getType']()).toBeUndefined()
  })
})

describe('ForwardedError', () => {
  it('should set message', () => {
    const error = new ForwardedError('path', new Error('message'))
    expect(error.message).toBe('message')
  })

  it('should set path', () => {
    const error = new ForwardedError('path', new Error('message'))
    expect(error.path).toBe('path')
  })

  it('should set message if path is another ForwaredError', () => {
    const error = new ForwardedError(
      'path',
      new ForwardedError('subpath', new ForwardedError('subsubpath', new Error('message')))
    )
    expect(error.message).toBe('message')
  })

  it('should set path if root is another ForwaredError', () => {
    const error = new ForwardedError(
      'path',
      new ForwardedError('subpath', new ForwardedError('subsubpath', new Error('message')))
    )
    expect(error.path).toBe('path.subpath.subsubpath')
  })
})
