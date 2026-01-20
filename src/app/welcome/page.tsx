'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    LayoutGrid,
    CheckCircle2,
    Zap,
    Rocket,
    Clock,
    ArrowRight,
    Shield
} from 'lucide-react'
import { toast } from 'sonner'
import { initializeTrial } from '@/app/actions'

export default function WelcomePage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isActivating, setIsActivating] = useState(false)

    const nextStep = async () => {
        if (step < 3) {
            setStep(step + 1)
        } else {
            setIsActivating(true)
            try {
                await initializeTrial()
                router.push('/')
                toast.success("PRO Trial Activated!")
            } catch (error) {
                console.error(error)
                router.push('/') // Proceed anyway
            } finally {
                setIsActivating(false)
            }
        }
    }

    return (
        <div className="min-h-screen bg-transparent text-white flex items-center justify-center px-4 font-sans overflow-hidden">
            {/* BACKGROUND DECORATION */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.15),transparent_50%)]"></div>
            </div>

            <div className="w-full max-w-[500px] z-10">
                <div className="bg-white/5 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">

                    {/* Progress Dots */}
                    <div className="flex justify-center gap-2 mb-10">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-8 bg-blue-500' : 'w-1.5 bg-white/10'}`}></div>
                        ))}
                    </div>

                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500 text-center">
                            <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto">
                                <Rocket className="w-10 h-10 text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black mb-4">Welcome to SmartMarket <span className="text-blue-500">PRO</span></h1>
                                <p className="text-slate-400 leading-relaxed">Your account has been created successfully. We're excited to help you digitalize your store in Rwanda.</p>
                            </div>
                            <button onClick={nextStep} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2">
                                Let's get started <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <Clock className="w-10 h-10 text-blue-400" />
                                </div>
                                <h1 className="text-3xl font-black mb-4">30-Day Free Trial</h1>
                                <p className="text-slate-400">As a new member, you've unlocked 30 days of full PRO access for free.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                    <span className="text-sm font-medium">Real-time Inventory Tracking</span>
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                    <span className="text-sm font-medium">Professional POS Terminal</span>
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                    <span className="text-sm font-medium">Monthly Profit Reports</span>
                                </div>
                            </div>

                            <button onClick={nextStep} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all">
                                See Pricing
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <Shield className="w-10 h-10 text-blue-400" />
                                </div>
                                <h1 className="text-3xl font-black mb-2">Simplicity & Value</h1>
                                <p className="text-slate-400">After your 30-day trial ends, maintain your PRO access for just:</p>
                                <div className="mt-6 inline-block bg-blue-600/10 border border-blue-500/20 px-8 py-4 rounded-[2rem]">
                                    <span className="text-4xl font-black text-blue-400">7,000</span>
                                    <span className="text-sm font-bold ml-1 text-slate-500 tracking-widest uppercase">RWF / Month</span>
                                </div>
                            </div>

                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                <p className="text-xs text-slate-500 leading-relaxed text-center">
                                    You will be notified 2 days before your trial expires. We support MTN MoMo and Airtel Money for easy Rwandan payments.
                                </p>
                            </div>

                            <button
                                onClick={nextStep}
                                disabled={isActivating}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
                            >
                                {isActivating ? "Activating Trial..." : "Activate Trial & Enter Dashboard"}
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
