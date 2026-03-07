import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react'
import {
  User,
  AuthProvider,
  OAuthCredential,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  linkWithCredential,
  OAuthProvider,
} from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { auth, googleProvider, githubProvider } from '../firebase'

type SignInResult = { linked: boolean }

type AuthContextType = {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<SignInResult>
  signInWithGitHub: () => Promise<SignInResult>
  signOut: () => Promise<void>
  getIdToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => ({ linked: false }),
  signInWithGitHub: async () => ({ linked: false }),
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

  const pendingCredential = useRef<OAuthCredential | null>(null)

  const signInAndLink = useCallback(async (provider: AuthProvider): Promise<SignInResult> => {
    try {
      const result = await signInWithPopup(auth, provider)
      if (pendingCredential.current) {
        try {
          await linkWithCredential(result.user, pendingCredential.current)
          pendingCredential.current = null
          return { linked: true }
        } catch (linkError) {
          console.error('Failed to link credential:', linkError)
          pendingCredential.current = null
        }
      }
      return { linked: false }
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'auth/account-exists-with-different-credential') {
        const credential = OAuthProvider.credentialFromError(error)
        if (credential) {
          pendingCredential.current = credential
        }
      }
      throw error
    }
  }, [])

  const signInWithGoogle = useCallback(() => signInAndLink(googleProvider), [signInAndLink])
  const signInWithGitHub = useCallback(() => signInAndLink(githubProvider), [signInAndLink])

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
