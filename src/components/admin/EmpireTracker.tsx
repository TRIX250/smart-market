'use client'

import { motion } from 'framer-motion'
import { Store, CreditCard, CalendarClock } from 'lucide-react'

interface EmpireTrackerProps {
    activeShops: number
    monthlyRevenue: number
}

export default function EmpireTracker({ activeShops, monthlyRevenue }: EmpireTrackerProps) {
    // Calculate "Next Payday" - Assuming end of current month for simplicity
    const today = new Date()
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    const daysLeft = Math.ceil((lastDayOfMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    return (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white/5 backdrop-blur-3xl border border-white/10 p-8">
            {/* Background Gradients */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px]" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
                {/* Active Shops */}
                <div className="flex flex-col items-center justify-center text-center p-4 border-r border-white/5 last:border-0">
                    <div className="mb-3 p-3 bg-white/5 rounded-2xl">
                        <Store className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="text-4xl font-black mb-1">{activeShops}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Active Shops</div>
                </div>

                {/* Monthly Revenue */}
                <div className="flex flex-col items-center justify-center text-center p-4 border-r border-white/5 last:border-0">
                    <div className="mb-3 p-3 bg-white/5 rounded-2xl">
                        <CreditCard className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="text-4xl font-black mb-1">{(monthlyRevenue || 0).toLocaleString()} <span className="text-sm font-bold text-white/50">RWF</span></div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Collected Revenue Stream</div>
                </div>

                {/* Next Payday */}
                <div className="flex flex-col items-center justify-center text-center p-4">
                    <div className="mb-3 p-3 bg-white/5 rounded-2xl">
                        <CalendarClock className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="text-4xl font-black mb-1">{daysLeft} <span className="text-sm font-bold text-white/50">Days</span></div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Until Next Payday</div>
                </div>
            </div>
        </div>
    )
}
