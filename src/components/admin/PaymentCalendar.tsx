'use client'

import { useState, useEffect } from 'react'
import { Calendar, Bell, Clock, User, AlertCircle, Loader2 } from 'lucide-react'
import { getUpcomingPayments, sendPaymentReminders, sendSingleReminder } from '@/app/admin/calendar-actions'
import { toast } from 'sonner'

export default function PaymentCalendar() {
    const [payments, setPayments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [sendingTo, setSendingTo] = useState<string | null>(null)

    const fetchPayments = async () => {
        try {
            const data = await getUpcomingPayments()
            setPayments(data)
        } catch (e) {
            console.error('Failed to fetch payments:', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPayments()
        // Refresh every minute
        const interval = setInterval(fetchPayments, 60000)
        return () => clearInterval(interval)
    }, [])

    const handleSendReminders = async () => {
        setSending(true)
        try {
            const result = await sendPaymentReminders()
            if (result.success) {
                toast.success(`✅ Sent ${result.sent} payment reminder${result.sent !== 1 ? 's' : ''}`)
                fetchPayments()
            } else {
                toast.error('Failed to send reminders')
            }
        } catch (e) {
            toast.error('Error sending reminders')
        } finally {
            setSending(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'expired': return 'bg-red-500/10 text-red-500 border-red-500/20'
            case 'urgent': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            case 'warning': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            default: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        }
    }

    const handleSendSingle = async (userId: string, userEmail: string | null) => {
        setSendingTo(userId)
        try {
            const result = await sendSingleReminder(userId, userEmail)
            if (result.success) {
                toast.success(`🔔 Notification sent to ${result.userEmail}`)
            } else {
                toast.error('Failed to send notification')
            }
        } catch (e) {
            toast.error('Error sending notification')
        } finally {
            setSendingTo(null)
        }
    }

    const urgentPayments = payments.filter(p => p.status === 'urgent' || p.daysRemaining <= 5)

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] p-4 sm:p-5 md:p-6 shadow-2xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl sm:rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-white">Payment Calendar</h2>
                        <p className="text-[9px] sm:text-[10px] text-slate-500 font-black uppercase tracking-widest">Upcoming Renewals</p>
                    </div>
                </div>
                <button
                    onClick={handleSendReminders}
                    disabled={sending || urgentPayments.length === 0}
                    className="w-full sm:w-auto px-3 py-2 sm:px-4 bg-purple-500 disabled:bg-purple-900 hover:bg-purple-400 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg sm:rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
                >
                    <Bell className="w-3 h-3" />
                    {sending ? 'Sending...' : 'Send Reminders'}
                </button>
            </div>

            {/* Urgent Alerts */}
            {urgentPayments.length > 0 && (
                <div className="mb-4 sm:mb-5 md:mb-6 p-3 sm:p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl sm:rounded-2xl">
                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
                        <h3 className="text-[10px] sm:text-xs font-black text-amber-500 uppercase tracking-widest">
                            {urgentPayments.length} User{urgentPayments.length !== 1 ? 's' : ''} Expiring Soon
                        </h3>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-amber-300">
                        Click bell icons or "Send Reminders" to notify users
                    </p>
                </div>
            )}

            {/* Calendar List */}
            <div className="space-y-2 max-h-[250px] sm:max-h-[300px] md:max-h-[350px] overflow-y-auto scrollbar-hide">
                {loading ? (
                    <div className="text-center py-6 sm:py-8 text-slate-500">
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 animate-spin" />
                        <p className="text-[9px] sm:text-[10px]">Loading payment schedule...</p>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 text-slate-500">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 opacity-20" />
                        <p className="text-[9px] sm:text-[10px]">No active subscriptions found</p>
                    </div>
                ) : (
                    payments.map((payment, i) => (
                        <div
                            key={i}
                            className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl border backdrop-blur-md transition-all ${getStatusColor(payment.status)}`}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {/* Clickable Notify Icon */}
                                    <button
                                        onClick={() => handleSendSingle(payment.userId, payment.userEmail)}
                                        disabled={sendingTo === payment.userId}
                                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-purple-500/20 hover:bg-purple-500/30 active:scale-95 flex items-center justify-center transition-all disabled:opacity-50 flex-shrink-0"
                                        title="Send notification"
                                    >
                                        {sendingTo === payment.userId ? (
                                            <Loader2 className="w-3 h-3 text-purple-400 animate-spin" />
                                        ) : (
                                            <Bell className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400" />
                                        )}
                                    </button>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] sm:text-[11px] font-black text-white truncate">
                                            {payment.userEmail || payment.userId.slice(-8).toUpperCase()}
                                        </p>
                                        <p className="text-[8px] sm:text-[9px] opacity-60 uppercase tracking-wider">
                                            {payment.planType}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-[10px] sm:text-[11px] font-black">
                                        {payment.daysRemaining <= 0
                                            ? 'EXP'
                                            : `${payment.daysRemaining}d`
                                        }
                                    </p>
                                    <p className="text-[7px] sm:text-[8px] opacity-60 uppercase tracking-widest">
                                        {new Date(payment.expiryDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Auto-Reminder Info */}
            <div className="mt-4 sm:mt-5 md:mt-6 pt-4 sm:pt-5 md:pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-slate-500">
                    <Bell className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                    <p className="uppercase tracking-widest font-black">
                        Auto-reminders at 5 days before expiry
                    </p>
                </div>
            </div>
        </div>
    )
}
