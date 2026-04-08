import { GlideClient, Decoder, TimeUnit } from '@valkey/valkey-glide'
import { createValkeyClient } from './valkey'

let clientPromise: Promise<GlideClient> | undefined
const getClientPromise = (): Promise<GlideClient> => {
  clientPromise ??= createValkeyClient(process.env.VALKEY_CONNECTION_STRING)
  return clientPromise
}

export const getValue = async (key: string): Promise<Buffer | null> => {
  const result = await (
    await getClientPromise()
  ).get(key, { decoder: Decoder.Bytes })
  if (!result) return null
  return Buffer.isBuffer(result) ? result : Buffer.from(result as Uint8Array)
}

export const setValue = async (
  key: string,
  value: Buffer,
  lifeInSeconds: number,
) => {
  await (
    await getClientPromise()
  ).set(key, value, {
    expiry: { type: TimeUnit.Seconds, count: lifeInSeconds },
  })
}
