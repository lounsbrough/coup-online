import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { MonetizationHistoryEntry } from '../../../shared/types/monetization'

const storedValues: Record<string, Buffer> = {}
const historyEntries: MonetizationHistoryEntry[] = []
let generatedDocId = 'generated-history-id'
let savedEntry: MonetizationHistoryEntry | undefined

const mockHistoryCollection = {
  doc: vi.fn(() => ({
    id: generatedDocId,
    set: vi.fn(async (entry: MonetizationHistoryEntry) => {
      savedEntry = entry
      historyEntries.unshift(entry)
    }),
  })),
  orderBy: vi.fn(() => ({
    limit: vi.fn(() => ({
      get: vi.fn(async () => ({
        docs: historyEntries.map((entry) => ({
          data: () => entry,
        })),
      })),
    })),
  })),
}

vi.mock('../firebase', () => ({
  firestore: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        collection: vi.fn(() => mockHistoryCollection),
      })),
    })),
  },
}))

vi.mock('./storage', () => ({
  getValue: vi.fn(async (key: string) => storedValues[key] ?? null),
  setValue: vi.fn(async (key: string, value: Buffer) => {
    storedValues[key] = value
  }),
}))

import { setValue } from './storage'
import {
  getBaseDate,
  grantPremiumAccess,
  recordMonetizationHistory,
} from './monetization'

describe('monetization', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
    vi.clearAllMocks()

    for (const key of Object.keys(storedValues)) {
      delete storedValues[key]
    }

    historyEntries.length = 0
    generatedDocId = 'generated-history-id'
    savedEntry = undefined
  })

  describe('getBaseDate', () => {
    it('should return the current time when expiresAt is missing', () => {
      expect(getBaseDate().toISOString()).toBe('2026-01-01T00:00:00.000Z')
    })

    it('should return the current time when expiresAt is invalid or in the past', () => {
      expect(getBaseDate('not-a-date').toISOString()).toBe('2026-01-01T00:00:00.000Z')
      expect(getBaseDate('2025-12-31T00:00:00.000Z').toISOString()).toBe('2026-01-01T00:00:00.000Z')
    })

    it('should return the existing future expiration date when it is still active', () => {
      expect(getBaseDate('2026-02-01T00:00:00.000Z').toISOString()).toBe('2026-02-01T00:00:00.000Z')
    })
  })

  describe('grantPremiumAccess', () => {
    it('should start a new premium period from now when no current status exists', async () => {
      const status = await grantPremiumAccess('user-1', 'premium_month')

      expect(status).toEqual({
        isActive: true,
        expiresAt: '2026-01-31T00:00:00.000Z',
      })
      expect(setValue).toHaveBeenCalledWith(
        'premium-status:user-1',
        Buffer.from(JSON.stringify(status)),
        2_592_000,
      )
    })

    it('should extend from the current expiry when the user is already active', async () => {
      storedValues['premium-status:user-2'] = Buffer.from(JSON.stringify({
        isActive: true,
        expiresAt: '2026-01-10T00:00:00.000Z',
      }))

      const status = await grantPremiumAccess('user-2', 'donation_fixed_2')

      expect(status).toEqual({
        isActive: true,
        expiresAt: '2026-02-09T00:00:00.000Z',
      })
    })

    it('should use the custom donation ladder when granting premium time', async () => {
      const status = await grantPremiumAccess('user-3', 'donation_custom', 1_000)
      const expectedExpiry = new Date('2026-01-01T00:00:00.000Z')
      expectedExpiry.setDate(expectedExpiry.getDate() + 90)

      expect(status.expiresAt).toBe(expectedExpiry.toISOString())
    })
  })

  describe('recordMonetizationHistory', () => {
    it('should persist and return a history entry using a Firestore-generated ID', async () => {
      generatedDocId = 'history-doc-123'

      const history = await recordMonetizationHistory(
        'user-4',
        'donation_fixed_2',
        500,
        'usd',
        '2026-01-31T00:00:00.000Z',
      )

      expect(savedEntry).toEqual({
        id: 'history-doc-123',
        productId: 'donation_fixed_2',
        category: 'donation',
        amountCents: 500,
        currency: 'usd',
        description: 'Donation - 30 days ad-free',
        createdAt: '2026-01-01T00:00:00.000Z',
        expiresAt: '2026-01-31T00:00:00.000Z',
      })
      expect(history).toEqual([savedEntry])
    })

    it('should format custom donation descriptions with the provided amount', async () => {
      generatedDocId = 'history-doc-custom'

      await recordMonetizationHistory('user-5', 'donation_custom', 2_500, 'usd', undefined, 2_500)

      expect(savedEntry?.description).toBe('Custom donation - $25.00')
    })
  })
})
