import { firestore } from '../firebase'
import { MonetizationHistoryEntry } from '../../../shared/types/monetization'
import { getValue, setValue } from './storage'

const premiumStatusKey = (userId: string) => `premium-status:${userId}`
const USERS_COLLECTION = 'users'
const MONETIZATION_HISTORY_COLLECTION = 'monetizationHistory'

export type PremiumStatus = {
  isActive: boolean
  expiresAt?: string
}

const getProductDescription = (productId: string, donationAmountCents?: number): string => {
  switch (productId) {
    case 'premium_month':
      return 'Ad-free - 1 month'
    case 'premium_year':
      return 'Ad-free - 1 year'
    case 'donation_fixed_1':
      return 'Donation - 7 days ad-free'
    case 'donation_fixed_2':
      return 'Donation - 30 days ad-free'
    case 'donation_fixed_3':
      return 'Donation - 90 days ad-free'
    case 'donation_custom':
      return donationAmountCents
        ? `Custom donation - $${(donationAmountCents / 100).toFixed(2)}`
        : 'Custom donation'
    default:
      return productId
  }
}

const productDurationDays: Record<string, number> = {
  premium_month: 30,
  premium_year: 365,
  donation_fixed_1: 7,
  donation_fixed_2: 30,
  donation_fixed_3: 90,
}

const getCustomDonationDurationDays = (donationAmountCents: number): number => {
  // Keep the existing value ladder while still supporting smaller custom amounts.
  if (donationAmountCents >= 2500) return 365
  if (donationAmountCents >= 1000) return 90
  if (donationAmountCents >= 500) return 30
  return 7
}

const getBaseDate = (expiresAt?: string): Date => {
  if (!expiresAt) return new Date()

  const parsed = new Date(expiresAt)
  if (Number.isNaN(parsed.getTime()) || parsed.getTime() < Date.now()) {
    return new Date()
  }

  return parsed
}

export const getUserPremiumStatus = async (userId: string): Promise<PremiumStatus> => {
  const value = await getValue(premiumStatusKey(userId))
  if (!value) {
    return { isActive: false }
  }

  const status = JSON.parse(value.toString()) as PremiumStatus
  if (!status.expiresAt) {
    return status
  }

  if (new Date(status.expiresAt).getTime() <= Date.now()) {
    return { isActive: false }
  }

  return status
}

export const getUserMonetizationHistory = async (userId: string): Promise<MonetizationHistoryEntry[]> => {
  const snapshot = await firestore
    .collection(USERS_COLLECTION)
    .doc(userId)
    .collection(MONETIZATION_HISTORY_COLLECTION)
    .orderBy('createdAt', 'desc')
    .limit(25)
    .get()

  return snapshot.docs.map((doc) => doc.data() as MonetizationHistoryEntry)
}

export const recordMonetizationHistory = async (
  userId: string,
  productId: string,
  amountCents: number,
  currency = 'usd',
  expiresAt?: string,
  donationAmountCents?: number,
): Promise<MonetizationHistoryEntry[]> => {
  const entry: MonetizationHistoryEntry = {
    id: `${Date.now()}-${productId}`,
    productId,
    category: productId.startsWith('premium') ? 'premium' : 'donation',
    amountCents,
    currency,
    description: getProductDescription(productId, donationAmountCents),
    createdAt: new Date().toISOString(),
    ...(expiresAt ? { expiresAt } : {}),
  }

  await firestore
    .collection(USERS_COLLECTION)
    .doc(userId)
    .collection(MONETIZATION_HISTORY_COLLECTION)
    .doc(entry.id)
    .set(entry)

  return getUserMonetizationHistory(userId)
}

export const grantPremiumAccess = async (
  userId: string,
  productId: string,
  donationAmountCents?: number,
): Promise<PremiumStatus> => {
  const isCustomDonation = productId === 'donation_custom'
  const durationDays = isCustomDonation && donationAmountCents
    ? getCustomDonationDurationDays(donationAmountCents)
    : productDurationDays[productId]

  if (!durationDays) {
    throw new Error(`Unsupported premium product: ${productId}`)
  }

  const currentStatus = await getUserPremiumStatus(userId)
  const nextExpiration = getBaseDate(currentStatus.expiresAt)
  nextExpiration.setDate(nextExpiration.getDate() + durationDays)

  const status: PremiumStatus = {
    isActive: true,
    expiresAt: nextExpiration.toISOString(),
  }

  const ttlSeconds = Math.max(60, Math.ceil((nextExpiration.getTime() - Date.now()) / 1000))
  await setValue(premiumStatusKey(userId), Buffer.from(JSON.stringify(status)), ttlSeconds)

  return status
}