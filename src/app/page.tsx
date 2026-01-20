import { auth } from "@clerk/nextjs/server";
import { prisma } from '@/lib/prisma'
import DashboardView from "./dashboard-view";
import Link from 'next/link';
import { SignUpButton, SignInButton } from "@clerk/nextjs";
import { AutoRefresh } from '@/components/AutoRefresh';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const { userId } = await auth();

  // 1. IF LOGGED IN: Smart Redirect based on subscription or admin status
  if (userId) {
    const { checkAccess } = await import('./subscription/actions');
    const access = await checkAccess();

    // TRICK EXCEPTION: Admin always goes to System Dashboard
    if (access.isAdmin) {
      redirect('/dashboard');
    }

    // IF PAID (or Trial): Go to Dashboard
    if (access.isValid) {
      redirect('/dashboard');
    } else {
      // IF NOT PAID: Go to Subscribe page
      redirect('/subscribe');
    }
  }

  // 2. IF GUEST: Show your Supermarket Landing Page
  return (
    <div className="flex flex-col items-center justify-center pt-20 pb-32 px-4 text-center">
      <div className="max-w-4xl space-y-10">
        <div className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] md:text-xs font-bold tracking-widest uppercase">
          Retail Intelligence v2026
        </div>
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[1.1]">
          Store management <br />
          <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-500 bg-clip-text text-transparent">
            made personal.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Process sales, track FEFO expiry, and log shrinkage.
          Sign up to save your store's information securely.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <SignUpButton mode="modal">
            <button className="bg-white text-black px-10 py-4 rounded-2xl font-black text-lg hover:bg-slate-200 transition shadow-2xl active:scale-[0.98] neon-white uppercase tracking-tighter">
              Start Managing Free
            </button>
          </SignUpButton>
          <SignInButton mode="modal">
            <button className="bg-white/5 border border-white/10 px-10 py-4 rounded-2xl font-black text-lg hover:bg-white/10 transition active:scale-[0.98] shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] text-blue-400 neon-blue uppercase tracking-tighter">
              Explore Features
            </button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
}