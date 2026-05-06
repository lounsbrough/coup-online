import { Application, Request, RequestHandler, Response } from 'express'
import type Stripe from 'stripe'
import { PaymentProductId } from '../../../shared/types/monetization'
import { adminAuth } from '../firebase'
import { verifyIdToken } from '../auth'
import {
  CheckoutProductType,
  constructWebhookEvent,
  createCheckoutSession,
  handleCheckoutSessionCompleted,
} from '../utilities/stripe'
import {
  getUserMonetizationHistory,
  getUserPremiumStatus,
  grantPremiumAccess,
  recordMonetizationHistory,
} from '../utilities/monetization'

type RequestWithRawBody = Request & { rawBody?: Buffer }

const isPaymentProductId = (value: string): value is PaymentProductId => {
  return [
    'premium_month',
    'premium_year',
    'donation_fixed_1',
    'donation_fixed_2',
    'donation_fixed_3',
    'donation_custom',
  ].includes(value)
}

export const registerMonetizationControllers = ({
  app,
  apiLimiter,
  genericErrorMessage,
}: {
  app: Application
  apiLimiter: RequestHandler
  genericErrorMessage: string
}) => {
  app.post('/api/payments/checkout', apiLimiter, async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'unauthorized' })
        return
      }

      const token = authHeader.split('Bearer ')[1]
      const decoded = await verifyIdToken(token)
      if (!decoded) {
        res.status(401).json({ error: 'unauthorized' })
        return
      }

      const { productType, productId, donationAmountCents, successUrl, cancelUrl } = req.body as {
        productType?: CheckoutProductType | string
        productId?: string
        donationAmountCents?: number | string
        successUrl?: string
        cancelUrl?: string
      }

      let normalizedDonationAmountCents: number | undefined

      if (!productType || !productId || !successUrl || !cancelUrl) {
        res.status(400).json({ error: 'Missing required parameters' })
        return
      }

      if (productType !== 'premium' && productType !== 'donation') {
        res.status(400).json({ error: 'Invalid product type' })
        return
      }

      if (productType === 'donation' && productId === 'donation_custom') {
        const amount = Number(donationAmountCents)
        if (!Number.isInteger(amount) || amount < 100 || amount > 50000) {
          res.status(400).json({ error: 'Invalid custom donation amount' })
          return
        }

        normalizedDonationAmountCents = amount
      }

      const user = await adminAuth.getUser(decoded.uid)
      const session = await createCheckoutSession({
        userId: decoded.uid,
        userEmail: user.email || '',
        productType,
        productId,
        ...(normalizedDonationAmountCents !== undefined ? { donationAmountCents: normalizedDonationAmountCents } : {}),
        successUrl,
        cancelUrl,
      })

      res.json({ sessionId: session.id, url: session.url })
    } catch (error) {
      console.error('Error creating checkout session:', error)
      res.status(500).json({ error: genericErrorMessage })
    }
  })

  app.post('/api/payments/webhook', async (req: Request, res: Response) => {
    try {
      const rawBody = (req as RequestWithRawBody).rawBody
      const signatureHeader = req.headers['stripe-signature']
      const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader
      if (!signature) {
        res.status(400).json({ error: 'Missing signature' })
        return
      }
      if (!rawBody) {
        res.status(400).json({ error: 'Missing raw webhook body' })
        return
      }

      const event = constructWebhookEvent(rawBody, signature)

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session)

        const { userId, productId, donationAmountCents } = session.metadata || {}
        if (userId && productId && isPaymentProductId(productId)) {
          const premiumStatus = await grantPremiumAccess(
            userId,
            productId,
            donationAmountCents ? Number.parseInt(donationAmountCents, 10) : undefined,
          )
          await recordMonetizationHistory(
            userId,
            productId,
            session.amount_total ?? (donationAmountCents ? Number.parseInt(donationAmountCents, 10) : 0),
            session.currency || 'usd',
            premiumStatus.expiresAt,
            donationAmountCents ? Number.parseInt(donationAmountCents, 10) : undefined,
          )
        }
      }

      res.json({ received: true })
    } catch (error) {
      console.error('Error processing webhook:', error)
      res.status(400).json({ error: 'webhook error' })
    }
  })

  app.get('/api/user/premium', apiLimiter, async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'unauthorized' })
        return
      }

      const token = authHeader.split('Bearer ')[1]
      const decoded = await verifyIdToken(token)
      if (!decoded) {
        res.status(401).json({ error: 'unauthorized' })
        return
      }

      const premiumStatus = await getUserPremiumStatus(decoded.uid)
      res.json(premiumStatus)
    } catch (error) {
      console.error('Error fetching premium status:', error)
      res.status(500).json({ error: genericErrorMessage })
    }
  })

  app.get('/api/user/monetization-history', apiLimiter, async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'unauthorized' })
        return
      }

      const token = authHeader.split('Bearer ')[1]
      const decoded = await verifyIdToken(token)
      if (!decoded) {
        res.status(401).json({ error: 'unauthorized' })
        return
      }

      const history = await getUserMonetizationHistory(decoded.uid)
      res.json(history)
    } catch (error) {
      console.error('Error fetching monetization history:', error)
      res.status(500).json({ error: genericErrorMessage })
    }
  })
}
