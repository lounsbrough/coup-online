import { useEffect } from 'react'
import { usePremiumStatus } from '../../hooks/usePremiumStatus'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

const ADSENSE_SCRIPT_ID = 'adsense-auto-ads-script'
const ADSENSE_CLIENT = 'ca-pub-6012532314500062'

export default function AdSenseManager() {
  const isPremium = usePremiumStatus()

  useEffect(() => {
    if (isPremium === null) {
      return
    }

    const existingScript = document.getElementById(ADSENSE_SCRIPT_ID)

    // Skip ad loading in local development.
    if (window.location.hostname === 'localhost') {
      existingScript?.remove()
      return
    }

    if (isPremium) {
      existingScript?.remove()
      return
    }

    if (!existingScript) {
      const script = document.createElement('script')
      script.id = ADSENSE_SCRIPT_ID
      script.async = true
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`
      script.crossOrigin = 'anonymous'
      document.head.appendChild(script)
    }
  }, [isPremium])

  return null
}
