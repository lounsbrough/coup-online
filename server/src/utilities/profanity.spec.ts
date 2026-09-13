import { describe, expect, it } from 'vitest'
import { containsProfanity } from './profanity'

describe('profanity', () => {
  it('whitelists regex-approved mama variants', () => {
    expect(containsProfanity('mama')).toBe(false)
    expect(containsProfanity('MAMA')).toBe(false)
    expect(containsProfanity(' Mama ')).toBe(false)
    expect(containsProfanity('Mama 🧸')).toBe(false)
  })

  it('does not whitelist non-matching names', () => {
    expect(containsProfanity('mama shit')).toBe(true)
  })

  it('still detects profane words', () => {
    expect(containsProfanity('shit')).toBe(true)
  })
})
