import { adminAuth } from './firebase'
import { DecodedIdToken } from 'firebase-admin/auth'

export const verifyIdToken = async (token: string): Promise<DecodedIdToken | null> => {
  try {
    return await adminAuth.verifyIdToken(token)
  } catch {
    return null
  }
}
