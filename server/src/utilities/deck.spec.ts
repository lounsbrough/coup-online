import { describe, it, expect } from 'vitest'
import { Influences } from '../../../shared/types/game'
import { getCountOfEachInfluence, createDeckForPlayerCount } from './deck'

describe('getCountOfEachInfluence', () => {
  it('should return correct count for given player count', () => {
    expect(getCountOfEachInfluence(0)).toBe(3)
    expect(getCountOfEachInfluence(1)).toBe(3)
    expect(getCountOfEachInfluence(2)).toBe(3)
    expect(getCountOfEachInfluence(3)).toBe(3)
    expect(getCountOfEachInfluence(4)).toBe(3)
    expect(getCountOfEachInfluence(5)).toBe(3)
    expect(getCountOfEachInfluence(6)).toBe(3)
    expect(getCountOfEachInfluence(7)).toBe(4)
    expect(getCountOfEachInfluence(8)).toBe(4)
    expect(getCountOfEachInfluence(9)).toBe(5)
    expect(getCountOfEachInfluence(10)).toBe(5)
  })

  it('should throw error for invalid player count', () => {
    expect(() => getCountOfEachInfluence(-1)).toThrow(
      'Invalid player count: -1',
    )
    expect(() => getCountOfEachInfluence(11)).toThrow(
      'Invalid player count: 11',
    )
  })
})

describe('createDeckForPlayerCount', () => {
  it.each(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((playerCount) => ({ playerCount })),
  )(
    'should return a deck with correct number of each influence for $playerCount players',
    ({ playerCount }) => {
      const deck = createDeckForPlayerCount(playerCount)
      const expectedInfluences = Object.values(Influences).filter((i) => i !== Influences.Inquisitor)
      const counts = Object.fromEntries(
        expectedInfluences.map((influence) => [influence, 0]),
      )

      deck.forEach((card) => {
        counts[card]++
      })

      expectedInfluences.forEach((influence) => {
        expect(counts[influence]).toBe(getCountOfEachInfluence(playerCount))
      })
    },
  )

  it('should include Inquisitor and exclude Ambassador when useInquisitor is set', () => {
    const deck = createDeckForPlayerCount(4, { useInquisitor: true })
    expect(deck).toContain(Influences.Inquisitor)
    expect(deck).not.toContain(Influences.Ambassador)
  })

  it('should include Ambassador and exclude Inquisitor by default', () => {
    const deck = createDeckForPlayerCount(4)
    expect(deck).toContain(Influences.Ambassador)
    expect(deck).not.toContain(Influences.Inquisitor)
  })
})
