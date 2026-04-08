import { vi, describe, it, expect, beforeEach } from 'vitest';
import Chance from 'chance';
import { getValue, setValue } from './storage';

const expectedValkeyStorage: { [key: string]: Buffer } = {};

vi.mock('@valkey/valkey-glide', () => {
  const mockClient = {
    get: vi.fn((key: string) =>
      Promise.resolve(expectedValkeyStorage[key] ?? null),
    ),
    set: vi.fn(
      (
        key: string,
        value: Buffer,
        options?: { expiry?: { type: string; count: number } },
      ) => {
        expectedValkeyStorage[key] = value;
        if (options?.expiry?.count) {
          setTimeout(() => {
            delete expectedValkeyStorage[key];
          }, options.expiry.count * 1000);
        }
        return Promise.resolve('OK');
      },
    ),
  };

  return {
    GlideClient: {
      createClient: vi.fn(() => Promise.resolve(mockClient)),
    },
    Decoder: { Bytes: 'Bytes', String: 'String' },
    TimeUnit: { Seconds: 'Seconds', Milliseconds: 'Milliseconds' },
  };
});

const chance = new Chance();

describe('storage', () => {
  beforeEach(() => {
    for (const key of Object.getOwnPropertyNames(expectedValkeyStorage)) {
      delete expectedValkeyStorage[key];
    }
  });

  describe('getValue', () => {
    it('should return value from valkey for given key', async () => {
      const key = chance.string();
      const expectedValue = Buffer.from(chance.string());
      expectedValkeyStorage[key] = expectedValue;

      expect(await getValue(key)).toBe(expectedValue);
    });
  });

  describe('setValue', () => {
    it('should set value in valkey for given key and expire after expiration time', async () => {
      const key = chance.string();
      const value = Buffer.from(chance.string());

      expect(await setValue(key, value, 0.1)).toBeUndefined();
      expect(expectedValkeyStorage[key]).toBe(value);

      await new Promise((resolve) => {
        setTimeout(resolve, 101);
      });
      expect(expectedValkeyStorage[key]).toBeUndefined();
    });
  });
});
