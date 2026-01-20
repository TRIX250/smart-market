'use client'

import { useState, useEffect, useRef } from 'react'
import { approvePayment, rejectPayment, getPendingPayments } from '@/app/actions'
import { toast } from 'sonner'
import { Loader2, CheckCircle, XCircle, Clock, ExternalLink, ShieldAlert, Bell } from 'lucide-react'
import Link from 'next/link'

interface Payment {
    id: string
    userId: string
    userEmail?: string | null
    transactionId: string
    screenshotUrl?: string | null
    amount: number
    createdAt: Date
    status: string
}

export default function ApprovalsPage() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [actionId, setActionId] = useState<string | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const previousCount = useRef(0)

    const fetchPayments = async () => {
        try {
            const data = await getPendingPayments()
            if (data.length > previousCount.current && !loading) {
                try {
                    new Audio('/notification.mp3').play().catch(() => {
                        // Fallback if local file missing
                        audioRef.current?.play().catch(e => console.log('Audio error:', e))
                    })
                } catch (e) { }
                alert('New Payment Request Received!')
                toast.info('New payment request received!', {
                    icon: <Bell className="w-4 h-4 text-blue-500" />
                })
            }
            setPayments(data as any)
            previousCount.current = data.length
        } catch (error) {
            console.error('Failed to fetch payments', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
        fetchPayments()
        const interval = setInterval(fetchPayments, 15000) // Poll every 15s
        return () => clearInterval(interval)
    }, [])

    const handleApprove = async (id: string) => {
        if (!confirm('Approve this payment and activate PRO?')) return
        setActionId(id)
        try {
            const res = await approvePayment(id)
            if (res.success) {
                toast.success('Subscription activated!')
                fetchPayments()
            }
        } catch (error) {
            toast.error('Error approving payment')
        } finally {
            setActionId(null)
        }
    }

    const handleReject = async (id: string) => {
        if (!confirm('Reject this payment request?')) return
        setActionId(id)
        try {
            const res = await rejectPayment(id)
            if (res.success) {
                toast.error('Payment rejected')
                fetchPayments()
            }
        } catch (error) {
            toast.error('Error rejecting payment')
        } finally {
            setActionId(null)
        }
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-red-500/10 p-3 rounded-2xl text-red-500">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Pending Approvals</h1>
                        <p className="text-slate-500 text-sm">Review and activate manual MoMo payments</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Updates Active</span>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">User Email</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Transaction ID</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Proof</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Date Received</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
                                    Scanning database...
                                </td>
                            </tr>
                        ) : payments.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                                    No pending requests found.
                                </td>
                            </tr>
                        ) : (
                            payments.map((p) => (
                                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-sm text-white">{p.userEmail || 'Unknown'}</div>
                                        <div className="text-[10px] text-slate-600 font-mono mt-0.5">{p.userId}</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-amber-500 font-bold text-sm">
                                        {p.transactionId}
                                    </td>
                                    <td className="px-6 py-4">
                                        {p.screenshotUrl ? (
                                            <a
                                                href={p.screenshotUrl}
                                                target="_blank"
                                                className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition"
                                            >
                                                View Screenshot
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        ) : (
                                            <span className="text-slate-600 text-[10px]">No File</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500">
                                        {new Date(p.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleReject(p.id)}
                                                disabled={!!actionId}
                                                className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition disabled:opacity-50"
                                                title="Reject"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleApprove(p.id)}
                                                disabled={!!actionId}
                                                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20 disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {actionId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                                Approve
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center">
                <Link
                    href="/admin/users"
                    className="text-slate-500 hover:text-white transition text-xs flex items-center gap-2 uppercase font-black tracking-[0.2em]"
                >
                    User Management Panel →
                </Link>
            </div>
        </div>
    )
}
