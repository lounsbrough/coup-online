import { useEffect, useState } from 'react'
import { useAuthContext } from '../contexts/AuthContext'
import { getBaseUrl } from '../helpers/api'

export function usePremiumStatus() {
    const [isPremium, setIsPremium] = useState<boolean | null>(null)
    const { user } = useAuthContext()

    useEffect(() => {
        const checkStatus = async () => {
            if (!user) {
                setIsPremium(false)
                return
            }

            try {
                const token = await user.getIdToken()
                const response = await fetch(`${getBaseUrl()}/api/user/premium`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (response.ok) {
                    const status = await response.json()
                    setIsPremium(status.isActive)
                } else {
                    setIsPremium(false)
                }
            } catch (error) {
                console.error('Error checking premium status:', error)
                setIsPremium(false)
            }
        }

        checkStatus()
    }, [user])

    return isPremium
}
