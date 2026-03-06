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
} from 'firebase/auth'
import { auth, googleProvider, githubProvider } from '../firebase'

type AuthContextType = {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithGitHub: () => Promise<void>
  signOut: () => Promise<void>
  getIdToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => { },
  signInWithGitHub: async () => { },
  signOut: async () => { },
  getIdToken: async () => null,
})

export function AuthContextProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider)
  }, [])

  const signInWithGitHub = useCallback(async () => {
    await signInWithPopup(auth, githubProvider)
  }, [])

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth)
  }, [])

  const getIdToken = useCallback(async () => {
    if (!auth.currentUser) return null
    return auth.currentUser.getIdToken()
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
    getIdToken,
  }), [user, loading, signInWithGoogle, signInWithGitHub, signOut, getIdToken])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
