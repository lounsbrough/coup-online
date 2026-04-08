import Valkey from 'iovalkey'
import { createValkeyClient } from '../src/utilities/valkey'

const processRef = (
  globalThis as unknown as {
    process: { env: Record<string, string | undefined>; exitCode: number };
  }
).process

const migrateStringKey = async ({
  key,
  source,
  destination,
  ttlMs,
}: {
  key: string;
  source: Valkey;
  destination: Valkey;
  ttlMs: number;
}): Promise<boolean> => {
  const value = await source.getBuffer(key)
  if (!value) {
    return false
  }

  if (ttlMs > 0) {
    await destination.set(key, value, 'PX', ttlMs)
  } else if (ttlMs === 0) {
    // PTTL can transiently return 0 right before expiration.
    await destination.set(key, value, 'PX', 1)
  } else {
    console.warn(`Key ${key} has no TTL, migrating without expiry`)
    await destination.set(key, value)
  }

  return true
}

const migrate = async () => {
  const sourceConnectionString = processRef.env.VALKEY_SOURCE_CONNECTION_STRING
  const destinationConnectionString =
    processRef.env.VALKEY_DESTINATION_CONNECTION_STRING

  if (!sourceConnectionString || !destinationConnectionString) {
    throw new Error(
      'Missing required env vars: VALKEY_SOURCE_CONNECTION_STRING and VALKEY_DESTINATION_CONNECTION_STRING',
    )
  }

  if (sourceConnectionString === destinationConnectionString) {
    throw new Error(
      'Source and destination connection strings must be different',
    )
  }

  const source = createValkeyClient(sourceConnectionString)
  const destination = createValkeyClient(destinationConnectionString)
  let cursor = '0'
  let migratedKeys = 0
  let skippedKeys = 0

  try {
    do {
      const [nextCursor, rawKeys] = await source.scan(cursor)
      cursor = String(nextCursor)

      for (const rawKey of rawKeys) {
        const key = String(rawKey)

        const ttlMs = await source.pttl(key)
        if (ttlMs === -2) {
          console.warn(`Key ${key} disappeared during migration, skipping`)
          skippedKeys++
          continue
        }

        const migrated = await migrateStringKey({
          key,
          source,
          destination,
          ttlMs,
        })

        if (!migrated) {
          skippedKeys++
          console.warn(`Skipping missing key ${key} during GET/SET migration`)
          continue
        }

        migratedKeys++
      }

      console.log(
        `Progress: migrated ${migratedKeys} keys (cursor: ${cursor})`,
      )
    } while (cursor !== '0')
  } finally {
    source.disconnect()
    destination.disconnect()
  }

  console.log(
    `Migration complete. Migrated: ${migratedKeys}, skipped: ${skippedKeys}`,
  )
}

migrate().catch((error) => {
  console.error('Valkey migration failed:', error)
  processRef.exitCode = 1
})
