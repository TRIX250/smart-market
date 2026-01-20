import { ClerkProvider, UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import './globals.css'
import { Toaster } from 'sonner'
import Link from 'next/link'

export const metadata = {
  title: 'SmartMarket Manager',
  description: 'Web-Based Inventory & Financial Management',
  manifest: '/manifest.json',
}

import { checkAccess } from './subscription/actions'
import { SubscriptionGuard } from '@/components/subscription-guard'
import {
  Mail,
  Phone,
  User,
  Package,
  ShoppingCart,
  BarChart3,
  Trash2,
  FileText,
  TrendingUp,
  MapPin,
  Users,
  ShieldAlert
} from 'lucide-react'

import { LayoutWrapper } from '@/components/layout-wrapper'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'
import { NotificationSound } from '@/components/notification-sound'
import { LiveBackground } from '@/components/live-background'
import { auth } from '@clerk/nextjs/server'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let userId: string | null = null;

  try {
    const authData = await auth();
    userId = authData.userId;
  } catch (e) {
    console.warn("RootLayout auth check failed (env vars missing?):", e);
  }

  const access = await checkAccess(userId);

  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <html lang="en">
        <body className="text-white antialiased flex flex-col min-h-screen">
          <LiveBackground>
            <Toaster position="top-center" richColors theme="dark" />
            <ServiceWorkerRegister />
            <NotificationSound />

            {/* GUARD: Wraps entire app to enforce subscription */}
            <SubscriptionGuard isValid={access.isValid} expiryDate={access.expiryDate} isLoggedIn={access.isLoggedIn}>

              <LayoutWrapper userId={userId} access={access}>
                {children}
              </LayoutWrapper>

              {/* REFINED FOOTER SECTION */}
              {/* COMPACT FOOTER SECTION */}
              <footer className="mt-12 border-t border-white/10 bg-white/5 backdrop-blur-xl py-10 print:hidden">
                <div className="container mx-auto px-4 md:px-8">
                  <div className="flex flex-col lg:flex-row justify-between gap-10 lg:gap-20">
                    {/* BRAND & SUPPORT */}
                    <div className="space-y-4 max-w-xs">
                      <div className="text-xl font-black tracking-tighter flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-white" />
                        </div>
                        SmartMarket<span className="text-blue-500">PRO</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        Real-time business intelligence for local retail management in Rwanda.
                      </p>
                      <div className="flex flex-wrap gap-4 pt-2">
                        <a href="mailto:ishimwet822@gmail.com" className="text-[10px] font-bold text-blue-400 hover:text-white transition flex items-center gap-2 bg-blue-400/5 px-3 py-1.5 rounded-lg border border-blue-400/10">
                          <Mail className="w-3 h-3" /> ishimwet822@gmail.com
                        </a>
                        <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-2 bg-emerald-400/5 px-3 py-1.5 rounded-lg border border-emerald-400/10">
                          <Phone className="w-3 h-3" /> 0793570492
                        </div>
                      </div>
                    </div>

                    {/* LINK GROUPS */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8">
                      {/* Management */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Management</h4>
                        <ul className="space-y-2 text-xs font-bold">
                          <li><Link href="/inventory" className="text-slate-300 hover:text-white transition flex items-center gap-2">
                            <Package className="w-3 h-3" /> Stock</Link></li>
                          <li><Link href="/pos" className="text-slate-300 hover:text-white transition flex items-center gap-2">
                            <ShoppingCart className="w-3 h-3" /> Terminal</Link></li>
                          <li><Link href="/dashboard/expenses" className="text-slate-300 hover:text-white transition flex items-center gap-2">
                            <FileText className="w-3 h-3" /> Expenses</Link></li>
                        </ul>
                      </div>

                      {/* Analytics */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Analytics</h4>
                        <ul className="space-y-2 text-xs font-bold">
                          <li><Link href="/reports/sales" className="text-slate-300 hover:text-white transition flex items-center gap-2">
                            <FileText className="w-3 h-3" /> Sales</Link></li>
                          <li><Link href="/reports/profit" className="text-slate-300 hover:text-emerald-400 transition flex items-center gap-2">
                            <TrendingUp className="w-3 h-3 text-emerald-500" /> Profit</Link></li>
                          <li><Link href="/inventory/waste" className="text-slate-300 hover:text-red-400 transition flex items-center gap-2">
                            <Trash2 className="w-3 h-3 text-red-500" /> Shrinkage</Link></li>
                        </ul>
                      </div>

                      {/* Support & Admin */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System</h4>
                        <ul className="space-y-2 text-xs font-bold">
                          <li><Link href="/dashboard" className="text-slate-300 hover:text-white transition flex items-center gap-2">
                            <BarChart3 className="w-3 h-3" /> Analytics</Link></li>
                          {access.isAdmin && (
                            <li>
                              <Link href="/admin/approvals" className="text-red-400 hover:text-red-300 transition flex items-center gap-2">
                                <ShieldAlert className="w-3 h-3" /> Control Center
                              </Link>
                            </li>
                          )}
                          <li className="text-[9px] text-slate-600 font-black italic pt-2">v2.0 PRO Edition</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM BAR */}
                  <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <div>© 2026 SmartMarket Manager. All rights reserved.</div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-500" /> Thierry</span>
                      <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-500" /> Nadjim</span>
                      <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-500" /> Danny</span>
                    </div>
                  </div>
                </div>
              </footer>
            </SubscriptionGuard>
          </LiveBackground>
        </body>
      </html>
    </ClerkProvider>
  )
}