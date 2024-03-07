import { AppParser } from '../../../src/parsers/app.js'

describe('parse', () => {
  it('should return undefined if payload is undefined', () => {
    const result = new AppParser().parse()
    expect(result).toBeUndefined()
  })

  it('should return undefined if payload is null', () => {
    const result = new AppParser().parse(null)
    expect(result).toBeUndefined()
  })

  it('should return undefined if payload is not an object', () => {
    const result = new AppParser().parse(5)
    expect(result).toBeUndefined()
  })

  it('should return name and version as string', () => {
    const result = new AppParser().parse({ name: 'name', version: 1, env: 'dev' })
    expect(result).toEqual({ app: 'name', version: '1', env: 'dev' })
  })
})
