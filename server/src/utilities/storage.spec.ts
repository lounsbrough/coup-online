import * as redis from 'redis'
import Chance from "chance"
import { getValue, setValue } from "./storage"

jest.mock('redis')

const mockRedis = jest.mocked(redis)

const chance = new Chance()

describe('storage', () => {
  const expectedRedisStorage: { [key: string]: string } = {}
  const mockRedisClient = {} as redis.RedisClientType
  mockRedisClient.on = jest.fn().mockReturnValue(mockRedisClient)
  mockRedisClient.connect = jest.fn().mockResolvedValue(mockRedisClient)
  mockRedisClient.get = jest.fn().mockImplementation((key: string) => Promise.resolve(expectedRedisStorage[key]))
  mockRedisClient.set = jest.fn().mockImplementation((key: string, value: string, options: redis.SetOptions) => {
    expectedRedisStorage[key] = value
    setTimeout(() => { delete expectedRedisStorage[key] }, options.EX * 1000)
    return Promise.resolve()
  })
  mockRedis.createClient.mockReturnValue(mockRedisClient)

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
