import zlib from 'zlib'

export const compressString = (string: string) =>
  zlib.deflateSync(string).toString('base64')

export const decompressString = (string: string) =>
  zlib.inflateSync(Buffer.from(string, 'base64')).toString()
