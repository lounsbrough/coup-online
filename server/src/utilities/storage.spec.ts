import * as redis from 'redis'
import Chance from "chance"
import { getValue, setValue } from "./storage"

const expectedRedisStorage: { [key: string]: string } = {}

jest.mock('redis', () => {
  const mockRedisClient = {
    on: jest.fn().mockReturnThis(),
    connect: jest.fn(),
    get: jest.fn((key: string) => Promise.resolve(expectedRedisStorage[key])),
    set: jest.fn((key: string, value: string, options?: redis.SetOptions) => {
      expectedRedisStorage[key] = value
      if (options?.EX) {
        setTimeout(() => {
          delete expectedRedisStorage[key]
        }, options.EX * 1000)
      }
      return Promise.resolve('OK')
    }),
  }
  mockRedisClient.connect.mockResolvedValue(mockRedisClient)

  return {
    createClient: jest.fn(() => mockRedisClient)
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
      const expectedValue = chance.string()
      expectedRedisStorage[key] = expectedValue

      expect(await getValue(key)).toBe(expectedValue)
    })
  })

  describe('setValue', () => {
    it('should set value in redis for given key and expire after expiration time', async () => {
      const key = chance.string()
      const value = chance.string()

      expect(await setValue(key, value, 0.1)).toBeUndefined()
      expect(expectedRedisStorage[key]).toBe(value)

      await new Promise((resolve) => { setTimeout(resolve, 101) })
      expect(expectedRedisStorage[key]).toBeUndefined()
    })
  })
})
