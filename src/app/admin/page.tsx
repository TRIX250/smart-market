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
        <div className="space-y-10 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <Link
                        key={i}
                        href={card.link}
                        className={`group p-6 rounded-[2rem] border ${card.border} ${card.bg} hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden`}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
                            <card.icon className="w-24 h-24" />
                        </div>

                        <div className={`p-3 rounded-2xl ${card.color} bg-white/5 w-fit mb-4 group-hover:bg-white/10 transition-colors`}>
                            <card.icon className="w-6 h-6" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-slate-300 text-xs font-black uppercase tracking-widest mb-1">{card.title}</h3>
                            <div className="text-3xl font-black text-white mb-2">{card.value}</div>
                            <p className="text-slate-400 text-[10px] font-medium leading-tight">{card.description}</p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] uppercase font-black tracking-widest text-white/50 group-hover:text-white transition-colors">
                            Manage
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions / Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Approvals Quick Peek */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <Clock className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-black text-white">Critical Tasks</h2>
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

                {/* Growth Peek */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-black text-white">System Insights</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                            <p className="text-[10px] uppercase font-black text-slate-500 mb-2">PRO Conversion</p>
                            <div className="text-2xl font-black text-white">
                                {stats?.totalUsers > 0
                                    ? Math.round((stats.activePro / stats.totalUsers) * 100)
                                    : 0}%
                            </div>
                            <p className="text-slate-600 text-[10px] mt-1 italic">Users with active plan</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                            <p className="text-[10px] uppercase font-black text-slate-500 mb-2">Revenue Potential</p>
                            <div className="text-2xl font-black text-blue-400">
                                +15K
                            </div>
                            <p className="text-slate-600 text-[10px] mt-1 italic">Per new monthly sub</p>
                        </div>
                    </div>

                    <Link
                        href="/admin/users"
                        className="mt-6 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white transition"
                    >
                        <Users className="w-4 h-4" /> Open User Database
                    </Link>

                    <button
                        onClick={async () => {
                            if (confirm('Reset all negative stock quantities to 0? This cannot be undone.')) {
                                try {
                                    const { resetNegativeStock } = await import('@/app/actions');
                                    const result = await resetNegativeStock();
                                    if (result.success) {
                                        alert(`✅ Reset ${result.count} products with negative stock`);
                                    }
                                } catch (e: any) {
                                    alert('❌ Error: ' + e.message);
                                }
                            }
                        }}
                        className="mt-3 w-full py-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-orange-400 hover:text-orange-300 transition"
                    >
                        <ShieldCheck className="w-4 h-4" /> Reset Negative Stock
                    </button>
                </div>
            </div>
        </div>
    )
}
