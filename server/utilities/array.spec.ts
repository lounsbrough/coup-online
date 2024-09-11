import { Chance } from "chance"
import { shuffle } from "./array"

const chance = new Chance()

describe('array', () => {
  it('should throw if input is not iterable', () => {
    expect(() => shuffle(null)).toThrow()
  })

  it('should shuffle original array', () => {
    const original = Array.from({ length: 100 }, () => chance.natural())
    const shuffled = shuffle(original)
    expect(shuffled).not.toEqual(original)
    expect(shuffled.length).toBe(original.length)
    shuffled.forEach((elementS) => {
      expect(original.find((elementO) => elementO === elementS)).not.toBeNull()
    })
  })
})
