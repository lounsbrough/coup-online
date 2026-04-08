import Valkey from 'iovalkey'
import { createValkeyClient } from './valkey'

let client: Valkey | undefined
const getClient = (): Valkey => {
  client ??= createValkeyClient(process.env.VALKEY_CONNECTION_STRING)
  return client
}

export const getValue = async (key: string): Promise<Buffer | null> => {
  return getClient().getBuffer(key)
}

export const setValue = async (
  key: string,
  value: Buffer,
  lifeInSeconds: number,
) => {
  await getClient().set(key, value, 'PX', Math.round(lifeInSeconds * 1000))
}
