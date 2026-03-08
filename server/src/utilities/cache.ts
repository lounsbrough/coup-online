type CacheEntry<T> = {
  value: T
  expiresAt: number
}

export class TTLCache<T> {
  private readonly cache = new Map<string, CacheEntry<T>>()

  constructor(private readonly ttlMs: number) {
    setInterval(() => this.evictExpired(), ttlMs * 2).unref()
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return undefined
    }
    return entry.value
  }

  set(key: string, value: T): void {
    this.cache.set(key, { value, expiresAt: Date.now() + this.ttlMs })
  }

  invalidate(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private evictExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }
}
