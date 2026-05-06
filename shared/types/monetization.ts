/**
 * Premium subscription status
 */
export type UserPremiumStatus = {
    isActive: boolean;
    tier: 'premium_month' | 'premium_year' | 'donor_grace'; // Donor grace is temporary ad-free from donations
    expiresAt?: string; // ISO timestamp when premium/grace period expires
};

/**
 * Payment product for Stripe
 */
export type PaymentProduct = {
    id: string;
    stripeProductId: string;
    stripePriceId: string;
    name: string;
    description: string;
    type: 'premium_month' | 'premium_year' | 'donation' | 'donation_custom';
    price: number; // in cents
    currency: string;
    metadata?: Record<string, string>;
};

export type MonetizationHistoryEntry = {
    id: string;
    productId: string;
    category: 'premium' | 'donation';
    amountCents: number;
    currency: string;
    description: string;
    createdAt: string;
    expiresAt?: string;
};
