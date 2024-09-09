import { generateRoomId } from "./identifiers"

describe('identifiers', () => {
   describe('generateRoomId', () => {
      it('should generate a random room id with 6 alpha-numeric characters', () => {
         const [first, second] = [generateRoomId(), generateRoomId()]
         const pattern = /^[A-Z0-9]{6}$/
         expect(first).toMatch(pattern)
         expect(second).toMatch(pattern)
         expect(second).not.toBe(first)
      })
   })
})
