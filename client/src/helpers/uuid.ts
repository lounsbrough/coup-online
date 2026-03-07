export const generateUUID = (): string => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }
  // Fallback for non-secure contexts (e.g. local access for testing)
  return '10000000-1000-4000-8000-100000000000'.replaceAll(/[018]/g, (c) =>
    (+c ^ (globalThis.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16)
  )
}
