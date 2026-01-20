'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, SignOutButton } from '@clerk/nextjs'
import {
    BarChart3,
    Package,
    ShoppingCart,
    TrendingUp,
    FileText,
    ArrowDownToLine,
    Trash2,
    LogOut,
    X,
    ShieldAlert,
    Users,
    Clock,
    Crown,
    LayoutDashboard,
    Shield
} from 'lucide-react'
import { getPendingCount } from '@/app/actions'
import { SubscriptionBadge } from '@/lib/subscription-utils'
import { Calculator } from './Calculator'

interface SidebarProps {
    userId: string | null;
    isOpen?: boolean;
    onClose?: () => void;
    access: {
        isValid: boolean;
        expiryDate: Date | null;
        isLoggedIn: boolean;
        planStatus: string;
        isAdmin: boolean;
    };
    toggleCalculator: () => void;
}

export function Sidebar({ userId, isOpen, onClose, access, toggleCalculator }: SidebarProps) {
    const pathname = usePathname()
    const { user, isLoaded } = useUser()
    const [pendingCount, setPendingCount] = useState(0)

    const isForceAdmin = user?.emailAddresses?.some(e => e.emailAddress === 'ishimwet822@gmail.com') || user?.username === 'trick_market';

    useEffect(() => {
        if (isForceAdmin) {
            getPendingCount().then(setPendingCount)
            const interval = setInterval(() => {
                getPendingCount().then(setPendingCount)
            }, 30000)
            return () => clearInterval(interval)
        }
    }, [isForceAdmin])

    if (!userId || !isLoaded) return null;

    const isActive = (path: string) => pathname === path

    const daysRemaining = access.expiryDate
        ? Math.max(0, Math.ceil((new Date(access.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
                w-72 border-r border-white/10 p-6 flex flex-col gap-8 bg-white/5 backdrop-blur-xl
                fixed lg:relative lg:self-stretch top-[80px] bottom-0 lg:top-auto lg:bottom-auto lg:h-auto shrink-0 print:hidden overflow-y-auto lg:overflow-visible no-scrollbar transition-all duration-300 ease-in-out z-[90] shadow-2xl lg:shadow-none
                ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full lg:translate-x-0 opacity-0 lg:opacity-100'}
            `}>
                <div className="flex items-center justify-between lg:justify-start gap-3 px-2">
                    <div className="flex items-center gap-3">
                        {user?.imageUrl ? (
                            <img
                                src={user.imageUrl}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover border border-white/10"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg text-white">
                                {user?.firstName?.substring(0, 1) || 'U'}
                                {user?.lastName?.substring(0, 1) || 'S'}
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="font-bold text-sm truncate text-white">
                                {user?.fullName || user?.username || 'Shop Admin'}
                            </p>
                            {isForceAdmin ? (
                                <p className="text-[9px] text-amber-500 uppercase tracking-tighter font-black flex items-center gap-1">
                                    <Crown className="w-2.5 h-2.5" /> Master Admin
                                </p>
                            ) : (
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">User Account</p>
                            )}
                        </div>
                    </div>

                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6 flex-1 pr-2 overflow-y-auto no-scrollbar">
                    {/* ADMIN SECTION */}
                    {isForceAdmin && (
                        <nav className="flex flex-col gap-1" onClick={onClose}>
                            <Link href="/admin" className="px-3 mb-2 text-[10px] uppercase tracking-widest font-black text-red-500/80 flex items-center gap-2 hover:text-red-400 transition-colors">
                                <ShieldAlert className="w-3 h-3" /> ADMIN PANEL
                            </Link>
                            <Link
                                href="/admin"
                                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${isActive('/admin') ? 'bg-red-500/10 text-red-400 font-bold border border-red-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <LayoutDashboard className="w-4 h-4" /> System Dashboard
                            </Link>
                            <Link
                                href="/admin/approvals"
                                className={`flex items-center justify-between px-3 py-2 rounded-xl transition ${isActive('/admin/approvals') ? 'bg-red-500/10 text-red-400 font-bold border border-red-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4" /> Pending Approvals
                                </div>
                                {pendingCount > 0 && (
                                    <span className="bg-red-600 text-[10px] font-black px-1.5 py-0.5 rounded-full text-white animate-pulse">
                                        {pendingCount}
                                    </span>
                                )}
                            </Link>
                            <Link
                                href="/admin/users"
                                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${isActive('/admin/users') ? 'bg-red-500/10 text-red-400 font-bold border border-red-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Users className="w-4 h-4" /> User Management
                            </Link>

                            <div className="mx-3 mt-4 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                                <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1">Team Access URL</p>
                                <p className="text-[10px] font-mono text-white/70 break-all select-all">
                                    {typeof window !== 'undefined' ? window.location.origin : 'http://192.168.43.45:3000'}
                                </p>
                            </div>
                        </nav>
                    )}

                    <nav className="flex flex-col gap-1" onClick={onClose}>
                        <p className="px-3 mb-2 text-[10px] uppercase tracking-widest font-bold text-slate-600">Main Menu</p>
                        <Link
                            href="/dashboard"
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${isActive('/dashboard') ? 'bg-blue-600/10 text-blue-400 font-bold border border-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <BarChart3 className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link
                            href="/inventory"
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${isActive('/inventory') ? 'bg-blue-600/10 text-blue-400 font-bold border border-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Package className="w-4 h-4" /> Inventory
                        </Link>
                        <Link
                            href="/dashboard/expenses"
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${isActive('/dashboard/expenses') ? 'bg-blue-600/10 text-blue-400 font-bold border border-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <FileText className="w-4 h-4" /> Expense Tracker
                        </Link>

                        <Link
                            href="/pos"
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${isActive('/pos') ? 'bg-blue-600/10 text-blue-400 font-bold border border-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <ShoppingCart className="w-4 h-4" /> POS Terminal
                        </Link>
                    </nav>

                    <nav className="flex flex-col gap-1" onClick={onClose}>
                        <p className="px-3 mb-2 text-[10px] uppercase tracking-widest font-bold text-slate-600">Reports & Logs</p>
                        <Link
                            href="/reports/sales"
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${isActive('/reports/sales') ? 'bg-blue-600/10 text-blue-400 font-bold border border-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <FileText className="w-4 h-4" /> Sales Report
                        </Link>
                        <Link
                            href="/inventory/waste"
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${isActive('/inventory/waste') ? 'bg-blue-600/10 text-blue-400 font-bold border border-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Trash2 className="w-4 h-4" /> Waste Logs
                        </Link>
                    </nav>

                    <nav className="flex flex-col gap-1" onClick={onClose}>
                        <p className="px-3 mb-2 text-[10px] uppercase tracking-widest font-bold text-slate-600">Quick Access & Exports</p>
                        <Link href="/dashboard#analytics" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition">
                            <TrendingUp className="w-4 h-4" /> Analytics
                        </Link>

                        <Link href="/inventory" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 transition group">
                            <div className="p-1 rounded bg-emerald-500/10 group-hover:bg-emerald-500/20 transition">
                                <ArrowDownToLine className="w-3 h-3 text-emerald-500" />
                            </div>
                            Inventory Exports
                        </Link>
                        <Link href="/reports/sales" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 transition group">
                            <div className="p-1 rounded bg-emerald-500/10 group-hover:bg-emerald-500/20 transition">
                                <ArrowDownToLine className="w-3 h-3 text-emerald-500" />
                            </div>
                            Sales Exports
                        </Link>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleCalculator();
                            }}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition group"
                        >
                            <div className="p-1 rounded bg-blue-500/10 group-hover:bg-blue-500/20 transition">
                                <BarChart3 className="w-3 h-3 text-blue-500" />
                            </div>
                            Calculator
                        </button>
                    </nav>
                </div>


                <div className="mt-auto border-t border-white/5 pt-6 space-y-4">
                    {!isForceAdmin && (
                        <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">
                                Subscription
                            </p>
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                                <Shield className="w-3.5 h-3.5 text-blue-500" />
                                <SubscriptionBadge expiryDate={access.expiryDate} />
                            </div>
                        </div>
                    )}

                    <SignOutButton>
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition group">
                            <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                            <span className="text-sm font-bold">Sign Out</span>
                        </button>
                    </SignOutButton>
                </div>
            </aside>
        </>
    )
}
