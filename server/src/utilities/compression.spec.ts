import zlib from 'node:zlib'
import { describe, it, expect } from 'vitest'
import { compressString, decompressString } from './compression'

describe('compression', () => {
  describe('compressString', () => {
    it('should compress string and output as a Buffer', () => {
      const result = compressString(JSON.stringify({ some: 'object' }))
      expect(Buffer.isBuffer(result)).toBe(true)
      expect(result).toEqual(zlib.deflateSync(JSON.stringify({ some: 'object' })))
    })

    it('should reduce size of string', () => {
      const originalString = JSON.stringify(
        Array.from({ length: 100 }, () => Math.random()),
      )

      const compressedBuffer = compressString(originalString)

      expect(compressedBuffer.byteLength).toBeLessThan(
        Buffer.byteLength(originalString, 'utf8'),
      )
    })
  })

  describe('decompressString', () => {
    it('should decompress Buffer and output original string', () => {
      const original = JSON.stringify({ yo: ['skinny', 'pete'] })
      const compressed = zlib.deflateSync(original)
      expect(decompressString(compressed)).toBe(original)
    })

    it('should decompress legacy base64-encoded data', () => {
      const original = JSON.stringify({ yo: ['skinny', 'pete'] })
      const legacyBase64 = zlib.deflateSync(original).toString('base64')
      expect(decompressString(Buffer.from(legacyBase64))).toBe(original)
    })
  })
})
