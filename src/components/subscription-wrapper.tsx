'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter, usePathname } from 'next/navigation'

export function SubscriptionWrapper({
    isValid,
    expiryDate,
    isLoggedIn
}: {
    isValid: boolean,
    expiryDate: Date | null,
    isLoggedIn: boolean
}) {
    const router = useRouter()
    const pathname = usePathname()

    // Grace Period Warning
    useEffect(() => {
        if (isValid && expiryDate) {
            const now = new Date()
            const diff = new Date(expiryDate).getTime() - now.getTime()
            const twoDays = 2 * 24 * 60 * 60 * 1000

            if (diff < twoDays && diff > 0) {
                toast.error("Subscription Expiring Soon", {
                    description: "Your access will be locked in less than 2 days. Please renew.",
                    duration: 8000
                })
            }
        }
    }, [isValid, expiryDate])

    // Redirect Logic
    useEffect(() => {
        const isPublicPath =
            pathname === '/' ||
            pathname === '/subscribe' ||
            pathname.startsWith('/sign-in') ||
            pathname.startsWith('/sign-up') ||
            pathname.startsWith('/welcome');

        if (isLoggedIn && !isValid && !isPublicPath) {
            router.push('/subscribe')
        }
    }, [isValid, isLoggedIn, pathname, router])

    return null
}
