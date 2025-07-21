import { getCountOfEachInfluence } from "./deck"

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
