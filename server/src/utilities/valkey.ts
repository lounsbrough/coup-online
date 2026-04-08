import Valkey from 'iovalkey'

const normalizeConnectionString = (connectionString?: string): string => {
  if (!connectionString) return 'redis://127.0.0.1:6379'
  // Normalize Valkey-specific schemes to standard Redis/TLS equivalents
  return connectionString
    .replace(/^valkeys:\/\//, 'rediss://')
    .replace(/^valkey:\/\//, 'redis://')
}

export const createValkeyClient = (connectionString?: string): Valkey => {
  return new Valkey(normalizeConnectionString(connectionString))
}
