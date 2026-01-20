'use client'

import { useState } from 'react'
import { Bell, Loader2 } from 'lucide-react'
import { sendNotification } from '@/app/actions'
import { toast } from 'sonner'

export function RemindButton({ userId, userName }: { userId: string, userName: string }) {
    const [loading, setLoading] = useState(false)

    const handleRemind = async () => {
        setLoading(true)
        try {
            const res = await sendNotification(
                userId,
                'Subscription Reminder',
                `Hi ${userName}, your subscription for SmartMarket PRO is about to expire. Please renew to avoid losing access to premium features.`
            )
            if (res.success) {
                toast.success(`Reminder sent to ${userName}`)
            }
        } catch (error) {
            toast.error('Failed to send reminder')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleRemind}
            disabled={loading}
            className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition disabled:opacity-50"
            title="Send Subscription Reminder"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
        </button>
    )
}
