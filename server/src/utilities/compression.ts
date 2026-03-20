import zlib from 'node:zlib'

export const compressString = (string: string): Buffer =>
  zlib.deflateSync(string)

export const decompressString = (compressed: Buffer): string => {
  try {
    return zlib.inflateSync(compressed).toString()
  } catch {
    // Legacy: data was stored as base64 string before Buffer migration
    return zlib.inflateSync(Buffer.from(compressed.toString(), 'base64')).toString()
  }
}
