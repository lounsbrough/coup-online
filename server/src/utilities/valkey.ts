import Valkey from 'iovalkey'

const normalizeConnectionString = (connectionString?: string): string => {
  if (!connectionString) return 'redis://127.0.0.1:6379'
  // iovalkey uses rediss:// for TLS; normalize valkeys:// accordingly
  return connectionString.replace(/^valkeys:\/\//, 'rediss://')
}

export const createValkeyClient = (connectionString?: string): Valkey => {
  return new Valkey(normalizeConnectionString(connectionString))
}
