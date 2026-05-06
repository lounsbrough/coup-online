import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { Coffee, Favorite, WorkspacePremium } from '@mui/icons-material'
import { useSearchParams } from 'react-router'
import { MonetizationHistoryEntry } from '@shared'
import { useAuthContext } from '../../contexts/AuthContext'
import { useNotificationsContext } from '../../contexts/NotificationsContext'
import { useTranslationContext } from '../../contexts/TranslationsContext'
import { getBaseUrl } from '../../helpers/api'
import { usePremiumStatus } from '../../hooks/usePremiumStatus'

type SupportMonetizationButtonProps = {
  size?: 'small' | 'medium' | 'large'
  variant?: 'text' | 'outlined' | 'contained'
}

export default function SupportMonetizationButton({
  size = 'small',
  variant = 'contained',
}: SupportMonetizationButtonProps) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState(0)
  const [customAmount, setCustomAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [history, setHistory] = useState<MonetizationHistoryEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuthContext()
  const { showNotification } = useNotificationsContext()
  const { t } = useTranslationContext()
  const isPremium = usePremiumStatus()
  const paymentSuccess = searchParams.get('payment_success')

  useEffect(() => {
    if (paymentSuccess !== 'true' || isPremium === null) {
      return
    }

    showNotification({
      id: 'payment-success-return',
      message: isPremium ? t('supportPaymentReturnSuccess') : t('supportPaymentReturnPending'),
      severity: isPremium ? 'success' : 'info',
    })

    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.delete('payment_success')
    setSearchParams(nextSearchParams, { replace: true })
  }, [isPremium, paymentSuccess, searchParams, setSearchParams, showNotification, t])

  useEffect(() => {
    const loadHistory = async () => {
      if (!open || !user || tab !== 1) {
        return
      }

      setHistoryLoading(true)
      try {
        const token = await user.getIdToken()
        const response = await fetch(`${getBaseUrl()}/api/user/monetization-history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to load monetization history')
        }

        const nextHistory = await response.json() as MonetizationHistoryEntry[]
        setHistory(nextHistory)
      } catch (error) {
        console.error('Error fetching monetization history:', error)
        setHistory([])
      } finally {
        setHistoryLoading(false)
      }
    }

    loadHistory()
  }, [open, tab, user])

  const requireUser = async () => {
    if (!user) {
      showNotification({
        id: 'monetization-login',
        message: t('supportLoginRequired'),
        severity: 'info',
      })
      return null
    }

    return user.getIdToken()
  }

  const createCheckout = async (payload: Record<string, unknown>) => {
    const token = await requireUser()
    if (!token) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`${getBaseUrl()}/api/payments/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...payload,
          successUrl: `${window.location.origin}?payment_success=true`,
          cancelUrl: window.location.href,
        }),
      })

      if (!response.ok) {
        throw new Error('Unable to create checkout session')
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      showNotification({
        id: 'monetization-checkout-error',
        message: t('supportCheckoutError'),
        severity: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePremium = async () => {
    await createCheckout({
      productType: 'premium',
      productId: 'premium_month',
    })
  }

  const handleDonation = async (tier: 1 | 2 | 3) => {
    const productId = {
      1: 'donation_fixed_1',
      2: 'donation_fixed_2',
      3: 'donation_fixed_3',
    }[tier]

    await createCheckout({
      productType: 'donation',
      productId,
    })
  }

  const handleCustomDonation = async () => {
    const parsed = Number.parseFloat(customAmount)
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 500) {
      showNotification({
        id: 'donate-custom-invalid',
        message: t('supportCustomAmountValidation'),
        severity: 'warning',
      })
      return
    }

    await createCheckout({
      productType: 'donation',
      productId: 'donation_custom',
      donationAmountCents: Math.round(parsed * 100),
    })
  }

  const withoutPricePrefix = (value: unknown) => {
    // CTA strings often start with "$x ·" or "$x -"; hide that in history rows.
    return String(value ?? '').replace(/^\s*\$[^\s]+\s*[·-]\s*/, '')
  }

  const formatAmountPaid = (amountCents: number) =>
    `$${(amountCents / 100).toFixed(2).replace('.00', '')}`

  const getAdFreeDurationText = (days: number) => {
    return `${t('supportDurationDay', { count: days })} ${t('supportAdFree')}`
  }

  const getHistoryDescription = (entry: MonetizationHistoryEntry) => {
    switch (entry.productId) {
      case 'premium_month':
        return withoutPricePrefix(t('supportPremiumMonthlyCta'))
      case 'donation_fixed_1':
        return getAdFreeDurationText(7)
      case 'donation_fixed_2':
        return getAdFreeDurationText(30)
      case 'donation_fixed_3':
        return getAdFreeDurationText(90)
      case 'donation_custom':
        return t('supportCustomDonateCta')
      default:
        if (entry.category === 'donation') {
          return t('supportCustomDonateCta')
        }

        return String(entry.description)
    }
  }

  if (!import.meta.env.VITE_ENABLE_PAYMENTS) {
    return null
  }

  return (
    <>
      <Tooltip title={t('supportMonetizationTooltip')}>
        <span>
          <Button
            size={size}
            variant={variant}
            startIcon={<Favorite />}
            onClick={() => setOpen(true)}
          >
            {t('supportGoAdFreeButton')}
          </Button>
        </span>
      </Tooltip>

      <Dialog open={open} onClose={() => { setOpen(false); setTab(0) }} maxWidth="sm" fullWidth>
        <DialogTitle>
            <Box display="flex" alignItems="center">
                <Typography flexGrow={1} textAlign="center" variant='h5'>
                    <Favorite sx={{ verticalAlign: 'middle', mr: 1 }} />
                    <span style={{ verticalAlign: 'middle' }}>{t('supportMonetizationTitle')}</span>
                </Typography>
            </Box>
        </DialogTitle>
        <Tabs
          value={tab}
          onChange={(_, newTab) => setTab(newTab)}
          centered
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTabs-flexContainer': {
              justifyContent: 'center',
            },
          }}
        >
          <Tab label={t('supportTabSupport')} />
          <Tab label={t('supportTabHistory')} />
        </Tabs>
        <DialogContent>
          {tab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {t('supportMonetizationDescription')}
              </Typography>

              <Button
                fullWidth
                variant="contained"
                startIcon={<WorkspacePremium />}
                onClick={handlePremium}
                disabled={isSubmitting}
              >
                {isSubmitting ? t('supportStartingCheckout') : t('supportPremiumMonthlyCta')}
              </Button>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button fullWidth variant="outlined" startIcon={<Coffee />} onClick={() => handleDonation(1)} disabled={isSubmitting}>
                  {`${formatAmountPaid(300)} · ${getAdFreeDurationText(7)}`}
                </Button>
                <Button fullWidth variant="outlined" startIcon={<Favorite />} onClick={() => handleDonation(2)} disabled={isSubmitting}>
                  {`${formatAmountPaid(500)} · ${getAdFreeDurationText(30)}`}
                </Button>
                <Button fullWidth variant="outlined" startIcon={<Favorite sx={{ color: 'red' }} />} onClick={() => handleDonation(3)} disabled={isSubmitting}>
                  {`${formatAmountPaid(1000)} · ${getAdFreeDurationText(90)}`}
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TextField
                  size="small"
                  type="number"
                  label={t('supportCustomAmountLabel')}
                  value={customAmount}
                  onChange={(event) => setCustomAmount(event.target.value)}
                  inputProps={{ min: 1, max: 500, step: 1 }}
                />
                <Button fullWidth variant="contained" onClick={handleCustomDonation} disabled={isSubmitting}>
                  {t('supportCustomDonateCta')}
                </Button>
              </Box>
            </Box>
          )}
          {tab === 1 && (
            <Box sx={{ pt: 2 }}>
              {historyLoading ? (
                <Typography color="text.secondary">{t('supportHistoryLoading')}</Typography>
              ) : history.length ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {history.map((entry) => (
                    <Box
                      key={entry.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        px: 1.5,
                        py: 1,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.5 }}>
                        {formatAmountPaid(entry.amountCents)}
                      </Typography>
                      <Typography variant="body2">{getHistoryDescription(entry)}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(entry.createdAt).toLocaleDateString()}
                        {entry.expiresAt ? ` · ${t('supportHistoryActiveUntil')} ${new Date(entry.expiresAt).toLocaleDateString()}` : ''}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">{t('supportHistoryEmpty')}</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => { setOpen(false); setTab(0) }}>{t('close')}</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
