import { describe, it, expect } from 'vitest'
import { compressString, decompressString } from './compression'

describe('compression', () => {
  describe('compressString', () => {
    it('should compress string and output as a base64 string', () => {
      expect(compressString(JSON.stringify({ some: 'object' }))).toBe(
        'eJyrVirOz01VslLKT8pKTS5RqgUANKAF5g==',
      )
    })

    it('should reduce size of string', () => {
      const originalString = JSON.stringify(
        Array.from({ length: 100 }, () => Math.random()),
      )

      const compressedString = compressString(originalString)

      expect(Buffer.byteLength(compressedString, 'utf8')).toBeLessThan(
        Buffer.byteLength(originalString, 'utf8'),
      )
    })
  })

  describe('decompressString', () => {
    it('should decompress base64 string and output original string', () => {
      expect(
        decompressString('eJyrVqrMV7KKVirOzszLq1TSUSpILUlViq0FAGPECBU='),
      ).toBe(JSON.stringify({ yo: ['skinny', 'pete'] }))
    })
  })
})
