import { IAction, IActions, ILogger } from './types.js'

export class MockedLogger<T extends string = ''> implements ILogger<T> {
  jobId = 'jobId'
  child = vi.fn().mockReturnThis()
  setParser = vi.fn()
  addMeta = vi.fn()
  switchTransport = vi.fn()
  action = vi.fn().mockReturnValue({
    success: vi.fn(),
    skip: vi.fn(),
    failure: vi.fn().mockImplementation((error) => error),
  })
  actions = vi.fn().mockReturnValue({
    end: vi.fn(),
  })
  info = vi.fn()
  warn = vi.fn()
  error = vi.fn()
}

export function mockAction<T extends string = ''>(logger: ILogger<T>): IAction {
  const action = {
    success: vi.fn(),
    skip: vi.fn(),
    failure: vi.fn().mockImplementation((error) => error),
  }
  logger.action = vi.fn().mockReturnValue(action)
  return action
}

export function mockActions<T extends string = ''>(logger: ILogger<T>): IActions {
  const actions = { end: vi.fn() }
  logger.actions = vi.fn().mockReturnValue(actions)
  return actions
}
