import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

if (!getApps().length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined

  initializeApp({
    ...(serviceAccount && { credential: cert(serviceAccount) }),
    projectId: process.env.FIREBASE_PROJECT_ID,
  })
}

export const adminAuth = getAuth()
export const firestore = getFirestore()
