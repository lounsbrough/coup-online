import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
})

export { stripe }

export const PREMIUM_PRODUCTS = {
  premium_month: {
    name: 'Ad-Free - 1 Month',
    description: 'Remove ads for one month.',
    price: 199,
  },
  premium_year: {
    name: 'Ad-Free - 1 Year',
    description: 'Remove ads for one year.',
    price: 1499,
  },
} as const

export const DONATION_PRODUCTS = {
  donation_fixed_1: {
    name: 'Support Coup Online - $3',
    description: 'Support development and receive 7 days ad-free as a thank-you.',
    price: 300,
  },
  donation_fixed_2: {
    name: 'Support Coup Online - $5',
    description: 'Support development and receive 30 days ad-free as a thank-you.',
    price: 500,
  },
  donation_fixed_3: {
    name: 'Support Coup Online - $10',
    description: 'Support development and receive 90 days ad-free as a thank-you.',
    price: 1000,
  },
} as const

export type CheckoutProductType = 'premium' | 'donation'

export interface CreateCheckoutSessionParams {
  userId: string
  userEmail: string
  productType: CheckoutProductType
  productId: string
  donationAmountCents?: number
  successUrl: string
  cancelUrl: string
}

export async function createCheckoutSession({
  userId,
  userEmail,
  productType,
  productId,
  donationAmountCents,
  successUrl,
  cancelUrl,
}: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
  const metadata: Record<string, string> = {
    userId,
    productType,
    productId,
  }

  const product = productType === 'premium'
    ? PREMIUM_PRODUCTS[productId as keyof typeof PREMIUM_PRODUCTS]
    : productId === 'donation_custom' && donationAmountCents
      ? {
        name: `Support Coup Online - $${(donationAmountCents / 100).toFixed(2)}`,
        description: 'Support development with a custom amount. Includes temporary ad-free time as a thank-you.',
        price: donationAmountCents,
      }
      : DONATION_PRODUCTS[productId as keyof typeof DONATION_PRODUCTS]

  if (!product) {
    throw new Error('Invalid product selection')
  }

  if (productType === 'donation' && productId === 'donation_custom' && donationAmountCents) {
    metadata.donationAmountCents = String(donationAmountCents)
  }

  return stripe.checkout.sessions.create({
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description,
            metadata,
          },
          unit_amount: product.price,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    payment_intent_data: {
      metadata,
    },
  })
}

export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const { userId, productType, productId, donationAmountCents } = session.metadata || {}

  if (!userId || !productType || !productId) {
    console.error('Invalid metadata in checkout session:', session.id)
    return
  }

  if (productType === 'premium') {
    console.log(`Granting premium access for ${productId} to ${userId}`)
    return
  }

  if (productType === 'donation') {
    const amountLog = donationAmountCents ? ` (${donationAmountCents} cents)` : ''
    console.log(`Recording donation ${productId}${amountLog} from ${userId}`)
  }
}

export function constructWebhookEvent(body: string | Buffer, signature: string): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
  return stripe.webhooks.constructEvent(body, signature, webhookSecret)
}
