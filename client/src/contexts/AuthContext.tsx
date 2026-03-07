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
  deleteUser,
} from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { auth, googleProvider, githubProvider } from '../firebase'
import { getBaseUrl } from '../helpers/api'

type SignInResult = { linked: boolean }

type AuthContextType = {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<SignInResult>
  signInWithGitHub: () => Promise<SignInResult>
  signOut: () => Promise<void>
  deleteAccount: () => Promise<void>
  getIdToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => ({ linked: false }),
  signInWithGitHub: async () => ({ linked: false }),
  signOut: async () => { },
  deleteAccount: async () => { },
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

  const deleteAccount = useCallback(async () => {
    const currentUser = auth.currentUser
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
    if (!auth.currentUser) return null
    return auth.currentUser.getIdToken()
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
    deleteAccount,
    getIdToken,
  }), [user, loading, signInWithGoogle, signInWithGitHub, signOut, deleteAccount, getIdToken])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
