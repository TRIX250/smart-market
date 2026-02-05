'use client'

import { useState, useEffect } from 'react'
import { getAdminStats } from '@/app/actions'
import {
    Users,
    ShieldCheck,
    Clock,
    Banknote,
    ArrowRight,
    Loader2,
    TrendingUp,
    LayoutDashboard,
    ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import SystemHealthRadarPanel from '@/components/admin/SystemHealthRadarPanel'
import EmpireTracker from '@/components/admin/EmpireTracker'
import DevGodMode from '@/components/admin/DevGodMode'
import PaymentCalendar from '@/components/admin/PaymentCalendar'

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const verifyAdmin = async () => {
            try {
                // We fetch stats, which throws if not admin.
                // If we really wanted to check admin status explicitly, 
                // we could call a specific action, but getAdminStats does double duty.
                const data = await getAdminStats()
                setStats(data)
            } catch (e: any) {
                console.error("Admin Access Denied:", e)
                // Redirect if unauthorized
                if (e.message?.includes('Unauthorized')) {
                    window.location.href = '/'
                }
            } finally {
                setLoading(false)
            }
        }
        verifyAdmin()
    }, [])

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        )
    }

    const cards = [
        {
            title: 'Pending Approvals',
            value: stats?.pendingApprovals || 0,
            icon: Clock,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            link: '/admin/approvals',
            description: 'New payment requests waiting'
        },
        {
            title: 'Active PRO Users',
            value: stats?.activePro || 0,
            icon: ShieldCheck,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            link: '/admin/users',
            description: 'Currently active subscriptions'
        },
        {
            title: 'Total Revenue',
            value: `${(stats?.totalRevenue || 0).toLocaleString()} RWF`,
            icon: Banknote,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            link: '/admin/approvals',
            description: 'Sum of all approved payments'
        },
        {
            title: 'Total Database Users',
            value: stats?.totalUsers || 0,
            icon: Users,
            color: 'text-slate-400',
            bg: 'bg-slate-400/10',
            border: 'border-slate-400/20',
            link: '/admin/users',
            description: 'All-time registered users'
        }
    ]

    return (
        <div className="max-w-[1600px] mx-auto pb-20">
            <DevGodMode />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-red-500/20 p-4 rounded-3xl text-red-500 ring-1 ring-red-500/30">
                        <LayoutDashboard className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white italic">Admin Master Panel</h1>
                        <p className="text-slate-500 text-sm font-medium">Control center for SmartMarket PRO subscriptions</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">System Secure</span>
                </div>
            </div>

            {/* Empire Tracker */}
            <div className="mb-8">
                <EmpireTracker
                    activeShops={stats?.activePro || 12}
                    monthlyRevenue={stats?.totalRevenue || 0}
                />
            </div>

            {/* Approvals Quick Peek */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl mb-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <Clock className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-black text-white">Critical Tasks: Approvals</h2>
                    </div>
                    <Link href="/admin/approvals" className="text-xs font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition flex items-center gap-2">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="space-y-4">
                    {stats?.pendingApprovals > 0 ? (
                        <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-white mb-1">Incoming Payments</h4>
                                <p className="text-xs text-slate-500">There are {stats.pendingApprovals} requests waiting for your verification.</p>
                            </div>
                            <Link
                                href="/admin/approvals"
                                className="px-4 py-2 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-400 transition shadow-lg shadow-amber-950/20"
                            >
                                Review Now
                            </Link>
                        </div>
                    ) : (
                        <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                            <ShieldCheck className="w-10 h-10 text-emerald-500/20 mx-auto mb-4" />
                            <p className="text-slate-600 text-sm font-medium">All caught up! No pending payments.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Calendar - Below Approvals */}
            <div className="mb-8">
                <PaymentCalendar />
            </div>

            {/* System Health Radar */}
            <div className="mb-8">
                <SystemHealthRadarPanel />
            </div>
        </div>
    )
}
