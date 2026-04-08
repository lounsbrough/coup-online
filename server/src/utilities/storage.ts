import { GlideClient, Decoder, TimeUnit } from '@valkey/valkey-glide';

const createValkeyClient = (): Promise<GlideClient> => {
  const connectionString = process.env.VALKEY_CONNECTION_STRING;
  let host = '127.0.0.1';
  let port = 6379;
  let useTLS = false;

  let username: string | undefined;
  let password: string | undefined;
  if (connectionString) {
    const url = new URL(connectionString);
    host = url.hostname;
    port = Number.parseInt(url.port) || 6379;
    useTLS = url.protocol === 'valkeys:' || url.protocol === 'rediss:';
    username = url.username || undefined;
    password = url.password || undefined;
  }

  return GlideClient.createClient({
    addresses: [{ host, port }],
    useTLS,
    ...(password
      ? { credentials: { username: username ?? 'default', password } }
      : undefined),
  });
};

let clientPromise: Promise<GlideClient> | undefined;
const getClientPromise = (): Promise<GlideClient> => {
  clientPromise ??= createValkeyClient();
  return clientPromise;
};

export const getValue = async (key: string): Promise<Buffer | null> => {
  const result = await (
    await getClientPromise()
  ).get(key, { decoder: Decoder.Bytes });
  if (!result) return null;
  return Buffer.isBuffer(result) ? result : Buffer.from(result as Uint8Array);
};

export const setValue = async (
  key: string,
  value: Buffer,
  lifeInSeconds: number,
) => {
  await (
    await getClientPromise()
  ).set(key, value, {
    expiry: { type: TimeUnit.Seconds, count: lifeInSeconds },
  });
};
