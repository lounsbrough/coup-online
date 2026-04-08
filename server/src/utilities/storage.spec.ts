import { vi, describe, it, expect, beforeEach } from 'vitest'
import Chance from 'chance'
import { getValue, setValue } from './storage'

const expectedValkeyStorage: { [key: string]: Buffer } = {}

vi.mock('iovalkey', () => {
  const mockClient = {
    getBuffer: vi.fn((key: string) =>
      Promise.resolve(expectedValkeyStorage[key] ?? null),
    ),
    set: vi.fn((key: string, value: Buffer, mode?: string, count?: number) => {
      expectedValkeyStorage[key] = value
      if (mode?.toUpperCase() === 'EX' && count !== undefined) {
        setTimeout(() => {
          delete expectedValkeyStorage[key]
        }, count * 1000)
      } else if (mode?.toUpperCase() === 'PX' && count !== undefined) {
        setTimeout(() => {
          delete expectedValkeyStorage[key]
        }, count)
      }
      return Promise.resolve('OK')
    }),
  }

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: vi.fn(function (this: any) {
      return mockClient
    }),
  }
})

const chance = new Chance()

describe('storage', () => {
  beforeEach(() => {
    for (const key of Object.getOwnPropertyNames(expectedValkeyStorage)) {
      delete expectedValkeyStorage[key]
    }
  })

  describe('getValue', () => {
    it('should return value from valkey for given key', async () => {
      const key = chance.string()
      const expectedValue = Buffer.from(chance.string())
      expectedValkeyStorage[key] = expectedValue

      expect(await getValue(key)).toBe(expectedValue)
    })
  })

  describe('setValue', () => {
    it('should set value in valkey for given key and expire after expiration time', async () => {
      const key = chance.string()
      const value = Buffer.from(chance.string())

      expect(await setValue(key, value, 0.1)).toBeUndefined()
      expect(expectedValkeyStorage[key]).toBe(value)

      await new Promise((resolve) => {
        setTimeout(resolve, 101)
      })
      expect(expectedValkeyStorage[key]).toBeUndefined()
    })
  })
})
