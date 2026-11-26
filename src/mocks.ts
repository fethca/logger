import type { Mock } from 'vitest'
import { IAction, IActions, ILogger } from './types.js'

export class MockedLogger<T extends string = ''> implements ILogger<T> {
  jobId = 'jobId'
  child: Mock = vi.fn().mockReturnThis()
  setParser: Mock = vi.fn()
  addMeta: Mock = vi.fn()
  switchTransport: Mock = vi.fn()
  action: Mock = vi.fn().mockReturnValue({
    success: vi.fn(),
    skip: vi.fn(),
    failure: vi.fn().mockImplementation((error) => error),
  })
  actions: Mock = vi.fn().mockReturnValue({
    end: vi.fn(),
  })
  info: Mock = vi.fn()
  warn: Mock = vi.fn()
  error: Mock = vi.fn()
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
