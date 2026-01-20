'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AutoRefreshProps {
    interval?: number // in milliseconds, default 30000 (30 seconds)
}

export function AutoRefresh({ interval = 30000 }: AutoRefreshProps) {
    const router = useRouter()

    useEffect(() => {
        // Set up auto-refresh interval
        const refreshInterval = setInterval(() => {
            router.refresh()
        }, interval)

        // Cleanup on unmount
        return () => clearInterval(refreshInterval)
    }, [interval, router])

    return null // This component doesn't render anything
}
