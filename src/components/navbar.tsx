'use client'

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Menu, X, BarChart3, Package, ShoppingCart } from 'lucide-react'
import { NotificationCenter } from './notification-center'


interface NavbarProps {
    onMenuClick: () => void;
    isOpen: boolean;
}

export function Navbar({ onMenuClick, isOpen }: NavbarProps) {
    return (
        <nav className="border-b border-white/10 bg-white/5 backdrop-blur-xl fixed top-0 left-0 w-full z-[100] py-3">
            <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors"
                        aria-label="Toggle Menu"
                    >
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    <Link href="/dashboard" className="text-xl font-black tracking-tighter flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <span className="hidden sm:inline">SmartMarket<span className="text-blue-500">PRO</span></span>
                    </Link>
                </div>

                <div className="flex items-center gap-3 md:gap-6">
                    <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                        <Link href="/dashboard" className="px-4 py-2 rounded-lg text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all">Dashboard</Link>
                        <Link href="/inventory" className="px-4 py-2 rounded-lg text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all">Inventory</Link>
                        <Link href="/pos" className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] hover:bg-blue-500 transition-all neon-blue font-black uppercase tracking-tighter">POS</Link>
                    </div>

                    <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>

                    <SignedIn>
                        <NotificationCenter />
                        <UserButton
                            appearance={{
                                elements: {
                                    userButtonAvatarBox: "w-9 h-9 border border-white/10"
                                }
                            }}
                            afterSignOutUrl="/"
                        />
                    </SignedIn>
                    <SignedOut>
                        <Link href="/sign-in" className="bg-white text-black px-6 py-2.5 rounded-xl text-xs font-black hover:bg-slate-100 transition shadow-[0_0_20px_rgba(255,255,255,0.4)] neon-white uppercase tracking-widest">
                            Sign In
                        </Link>
                    </SignedOut>
                </div>
            </div>
        </nav>
    )
}
