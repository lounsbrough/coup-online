import { Influences } from "../../../shared/types/game"
import { getCountOfEachInfluence, createDeckForPlayerCount } from "./deck"

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
    expect(() => getCountOfEachInfluence(-1)).toThrow("Invalid player count: -1")
    expect(() => getCountOfEachInfluence(11)).toThrow("Invalid player count: 11")
  })
})

describe('createDeckForPlayerCount', () => {
  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    .map(playerCount => ({playerCount}))
  )('should return a deck with correct number of each influence for $playerCount players', ({ playerCount }) => {
    const deck = createDeckForPlayerCount(playerCount)
    const counts = Object.fromEntries(Object.values(Influences).map(influence => [influence, 0]))

    deck.forEach(card => { counts[card]++ })

    Object.values(counts).forEach(count => {
      expect(count).toBe(getCountOfEachInfluence(playerCount))
    })
  })
})
