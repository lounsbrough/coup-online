import {
  createContext,
  useContext,
} from 'react'
import { User } from 'firebase/auth'

type AuthContextType = {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  deleteAccount: () => Promise<void>
  getIdToken: () => Promise<string | null>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => { },
  signOut: async () => { },
  deleteAccount: async () => { },
  getIdToken: async () => null,
})

export const useAuthContext = () => useContext(AuthContext)
