import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  deleteUser,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { getBaseUrl } from '../helpers/api'

type AuthContextType = {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  deleteAccount: () => Promise<void>
  getIdToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => { },
  signOut: async () => { },
  deleteAccount: async () => { },
  getIdToken: async () => null,
})

export function AuthContextProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!auth) throw new Error('Firebase auth is not configured')
    await signInWithPopup(auth, googleProvider)
  }, [])

  const signOut = useCallback(async () => {
    if (!auth) return
    await firebaseSignOut(auth)
  }, [])

  const deleteAccount = useCallback(async () => {
    const currentUser = auth?.currentUser
    if (!currentUser) return

    const token = await currentUser.getIdToken()
    const response = await fetch(`${getBaseUrl()}/api/users/account`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      throw new Error('Failed to delete account')
    }

    try {
      await deleteUser(currentUser)
    } catch {
      // Server already deleted the Firebase auth user, so this may fail — that's fine
    }

    setUser(null)
  }, [])

  const getIdToken = useCallback(async () => {
    if (!auth?.currentUser) return null
    return auth.currentUser.getIdToken()
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    signInWithGoogle,
    signOut,
    deleteAccount,
    getIdToken,
  }), [user, loading, signInWithGoogle, signOut, deleteAccount, getIdToken])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
