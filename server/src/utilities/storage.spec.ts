import { vi, describe, it, expect, beforeEach } from 'vitest'
import * as redis from 'redis'
import Chance from 'chance'
import { getValue, setValue } from './storage'

const expectedRedisStorage: { [key: string]: Buffer } = {}

vi.mock('redis', () => {
  const mockRedisClient = {
    on: vi.fn().mockReturnThis(),
    connect: vi.fn(),
    withTypeMapping: vi.fn().mockReturnThis(),
    get: vi.fn((key: string) => Promise.resolve(expectedRedisStorage[key] ?? null)),
    set: vi.fn((key: string, value: Buffer, options?: redis.SetOptions) => {
      expectedRedisStorage[key] = value
      if (options?.EX) {
        setTimeout(() => {
          delete expectedRedisStorage[key]
        }, (options.EX as number) * 1000)
      }
      return Promise.resolve('OK')
    }),
  }
  mockRedisClient.connect.mockResolvedValue(mockRedisClient)

  return {
    createClient: vi.fn(() => mockRedisClient),
    RESP_TYPES: { BLOB_STRING: 36 },
  }
})

const chance = new Chance()

describe('storage', () => {
  beforeEach(() => {
    for (const key of Object.getOwnPropertyNames(expectedRedisStorage)) {
      delete expectedRedisStorage[key]
    }
  })

  describe('getValue', () => {
    it('should return value from redis for given key', async () => {
      const key = chance.string()
      const expectedValue = Buffer.from(chance.string())
      expectedRedisStorage[key] = expectedValue

      expect(await getValue(key)).toBe(expectedValue)
    })
  })

  describe('setValue', () => {
    it('should set value in redis for given key and expire after expiration time', async () => {
      const key = chance.string()
      const value = Buffer.from(chance.string())

      expect(await setValue(key, value, 0.1)).toBeUndefined()
      expect(expectedRedisStorage[key]).toBe(value)

      await new Promise((resolve) => {
        setTimeout(resolve, 101)
      })
      expect(expectedRedisStorage[key]).toBeUndefined()
    })
  })
})
