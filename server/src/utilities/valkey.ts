import { GlideClient } from '@valkey/valkey-glide'

export type ValkeyConnectionConfig = {
  host: string;
  port: number;
  useTLS: boolean;
  username?: string;
  password?: string;
};

export const parseValkeyConnectionString = (
  connectionString?: string,
): ValkeyConnectionConfig => {
  if (!connectionString) {
    return {
      host: '127.0.0.1',
      port: 6379,
      useTLS: false,
    }
  }

  const url = new URL(connectionString)
  const username = url.username || undefined
  const password = url.password || undefined

  return {
    host: url.hostname,
    port: Number.parseInt(url.port) || 6379,
    useTLS: url.protocol === 'valkeys:' || url.protocol === 'rediss:',
    ...(username ? { username } : undefined),
    ...(password ? { password } : undefined),
  }
}

export const createValkeyClient = async (
  connectionString?: string,
): Promise<GlideClient> => {
  const config = parseValkeyConnectionString(connectionString)

  return GlideClient.createClient({
    addresses: [{ host: config.host, port: config.port }],
    useTLS: config.useTLS,
    ...(config.password
      ? {
          credentials: {
            username: config.username ?? 'default',
            password: config.password,
          },
        }
      : undefined),
  })
}
