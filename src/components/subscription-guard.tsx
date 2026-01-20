'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useRouter, usePathname } from 'next/navigation'

export function SubscriptionGuard({
    children,
    isValid,
    expiryDate,
    isLoggedIn
}: {
    children: React.ReactNode,
    isValid: boolean,
    expiryDate: Date | null,
    isLoggedIn: boolean
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [isRedirecting, setIsRedirecting] = useState(false)

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

    // Strict Access Control
    const isPublicPath =
        pathname === '/' ||
        pathname === '/subscribe' ||
        pathname.startsWith('/sign-in') ||
        pathname.startsWith('/sign-up') ||
        pathname.startsWith('/welcome');

    // Check immediately (during render/hydration) if possible, or effect
    const shouldBlock = isLoggedIn && !isValid && !isPublicPath

    useEffect(() => {
        if (shouldBlock) {
            setIsRedirecting(true)
            router.push('/subscribe')
        } else {
            setIsRedirecting(false)
        }
    }, [shouldBlock, router])

    if (shouldBlock || isRedirecting) {
        // Block content rendering while redirecting
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent text-slate-500">
                <p className="animate-pulse font-black uppercase tracking-widest text-[10px]">Checking Access...</p>
            </div>
        )
    }

    return <>{children}</>
}
