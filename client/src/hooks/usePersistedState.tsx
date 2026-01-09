import { useCallback, useState } from 'react'

function persistToStorage<T>(storageKey: string, value: T): void {
  if (value === undefined) {
    localStorage.removeItem(storageKey)
  } else {
    localStorage.setItem(storageKey, JSON.stringify(value))
  }
}

export function usePersistedState<T>(storageKey: string, defaultValue: T): [T, (newValue: T) => void] {
  const [value, setValue] = useState<T>(() => {
    const storedValue = localStorage.getItem(storageKey)
    try {
      return storedValue ? JSON.parse(storedValue) : defaultValue
    } catch {
      // If users have invalid data in localStorage, fall back to default
      return defaultValue
    }
  })

  const persistAndSetValue = useCallback(
    (newValue: T) => {
      persistToStorage(storageKey, newValue)
      setValue(newValue)
    },
    [storageKey],
  )

  return [value, persistAndSetValue]
}
