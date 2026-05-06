/**
 * Premium subscription status
 */
export type UserPremiumStatus = {
  isActive: boolean;
  expiresAt?: string; // ISO timestamp when premium/grace period expires
};

export type PaymentProductId =
  | 'premium_month'
  | 'premium_year'
  | 'donation_fixed_1'
  | 'donation_fixed_2'
  | 'donation_fixed_3'
  | 'donation_custom';

export type PaymentProductCategory = 'premium' | 'donation';

/**
 * Payment product for Stripe
 */
export type PaymentProduct = {
  id: string;
  stripeProductId: string;
  stripePriceId: string;
  name: string;
  description: string;
  category: PaymentProductCategory;
  type: PaymentProductId;
  price: number; // in cents
  currency: string;
  metadata?: Record<string, string>;
};

export type MonetizationHistoryEntry = {
  id: string;
  productId: PaymentProductId;
  category: PaymentProductCategory;
  amountCents: number;
  currency: string;
  description: string;
  createdAt: string;
  expiresAt?: string;
};
