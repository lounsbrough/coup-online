import { useEffect, useState } from 'react'
import { useAuthContext } from '../contexts/AuthContext'
import { getBaseUrl } from '../helpers/api'

export function useDisplayName() {
  const { user } = useAuthContext()
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user?.uid) {
      setDisplayName(null)
      return
    }

    setLoading(true)
    fetch(`${getBaseUrl()}/api/users/${user.uid}/displayName`)
      .then((res) => res.json())
      .then((data) => {
        setDisplayName(data.displayName ?? null)
      })
      .catch(() => {
        setDisplayName(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [user?.uid])

  const saveDisplayName = async (name: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not signed in' }

    try {
      const token = await user.getIdToken()
      const res = await fetch(`${getBaseUrl()}/api/users/displayName`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName: name,
          ...(user.photoURL && { photoURL: user.photoURL }),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        return { success: false, error: data.error }
      }

      const data = await res.json()
      setDisplayName(data.displayName)
      return { success: true }
    } catch {
      return { success: false, error: 'Failed to save display name' }
    }
  }

  return { displayName, loading, saveDisplayName, setDisplayName }
}
