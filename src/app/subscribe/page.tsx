'use client'

import { useState, useEffect, useTransition } from 'react'
import { Shield, Loader2, Smartphone, CheckCircle2, Clock, CheckCircle, Copy, PhoneCall } from 'lucide-react'
import { toast } from 'sonner'
import { submitPayment, getPaymentStatus } from '@/app/actions'
import { useRouter } from 'next/navigation'

export default function SubscribePage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [statusLoading, setStatusLoading] = useState(true)
    const [transactionId, setTransactionId] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [simSelection, setSimSelection] = useState<'SIM 1' | 'SIM 2'>('SIM 1')
    const [pendingRequest, setPendingRequest] = useState<any>(null)
    const [isSubmitted, setIsSubmitted] = useState(false)

    useEffect(() => {
        const fetchStatus = async () => {
            const status = await getPaymentStatus()
            if (status && status.status === 'PENDING') {
                setPendingRequest(status)
            }
            setStatusLoading(false)
        }
        fetchStatus()
    }, [])

    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const getCarrier = (num: string) => {
        if (!num) return null;
        const prefix = num.substring(0, 3);
        if (['078', '079', '072'].includes(prefix)) return 'MTN MoMo';
        if (['073'].includes(prefix)) return 'Airtel Money';
        return null;
    }

    const carrier = getCarrier(phoneNumber);
    const ussdCode = "*182*8*1*1957217*7000#";

    const handleCall = () => {
        navigator.clipboard.writeText(ussdCode);
        toast.success("Code Copied!", {
            description: "Now just paste the code and press call."
        });
        setTimeout(() => {
            window.location.href = 'tel:*182*8*1*1957217*7000#';
        }, 800);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const target = e.target as HTMLFormElement
        const formData = new FormData(target)

        const transactionIdVal = formData.get('transactionId') as string
        if (!transactionIdVal || transactionIdVal.trim().length < 5) {
            toast.error("Please enter a valid Transaction ID")
            return
        }

        const fileInput = target.querySelector('input[type="file"]') as HTMLInputElement
        if (!fileInput?.files?.[0]) {
            toast.error("Please upload a screenshot of your payment")
            return
        }

        setIsSubmitted(false)
        startTransition(async () => {
            try {
                const res = await submitPayment(formData)
                if (res.success) {
                    if (res.message === 'Already approved.') {
                        toast.success("Account already active!")
                        router.push('/dashboard')
                        return
                    }
                    setIsSubmitted(true)
                    toast.success("Submission Received", {
                        description: "Verifying your transaction..."
                    })
                    const newStatus = await getPaymentStatus()
                    if (newStatus?.status === 'APPROVED') {
                        router.push('/dashboard')
                    }
                } else {
                    toast.error(res.message || "Failed to submit request.")
                }
            } catch (err: any) {
                toast.error("CRITICAL ERROR: " + err.message)
            }
        })
    }

    if (statusLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        )
    }

    if (isSubmitted) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4 md:p-6 bg-transparent font-sans">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] max-w-lg w-full text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />
                    <div className="mb-6 md:mb-8 inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-emerald-500/10 text-emerald-500 ring-4 ring-emerald-500/5">
                        <CheckCircle className="w-10 h-10 md:w-12 md:h-12" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-white mb-3 md:mb-4 tracking-tight">Submission Successful!</h1>
                    <p className="text-slate-300 mb-6 md:mb-8 text-sm md:text-base leading-relaxed">
                        Your request is now waiting for approval from Admin <span className="text-emerald-400 font-bold">ishimwet822@gmail.com</span>.
                    </p>
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 md:p-6 rounded-2xl mb-6 md:mb-8">
                        <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold mb-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">Estimated Time</span>
                        </div>
                        <p className="text-slate-400 text-xs md:text-sm font-medium">
                            Please wait up to <span className="text-white font-bold">30 minutes</span> for manual verification.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (pendingRequest) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4 md:p-6 bg-transparent font-sans">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] max-w-lg w-full text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
                    <div className="mb-6 md:mb-8 inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
                        <Clock className="w-8 h-8 md:w-10 md:h-10" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-white mb-2 md:mb-3 tracking-tight">Verification in Progress</h1>
                    <p className="text-slate-400 mb-4 md:mb-6 text-[10px] md:text-sm font-medium leading-relaxed">
                        We've received your payment details (ID: <span className="text-white font-mono">{pendingRequest.transactionId}</span>).
                    </p>
                    <div className="bg-amber-500/5 border border-amber-500/10 p-5 md:p-6 rounded-2xl mb-6 md:mb-8">
                        <p className="text-amber-200 text-sm font-black uppercase tracking-widest">
                            Waiting for Admin Approval
                        </p>
                        <p className="text-slate-500 text-[10px] md:text-xs mt-2 italic font-medium">
                            Our team is matching your Transaction ID with our MoMo records. This usually takes 5-30 minutes.
                        </p>
                    </div>
                    <p className="text-[10px] text-slate-600 italic font-bold">
                        You'll gain full access as soon as Ishimwe verifies it.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-2 md:p-6 bg-transparent font-sans">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] max-w-lg w-full text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

                <div className="mb-2 md:mb-6 inline-flex items-center justify-center w-10 h-10 md:w-20 md:h-20 rounded-xl md:rounded-3xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                    <Smartphone className="w-5 h-5 md:w-10 md:h-10" />
                </div>

                <h1 className="text-lg md:text-3xl font-black text-white mb-0.5 md:mb-2 tracking-tight">Activate PRO</h1>
                <p className="text-slate-400 mb-3 md:mb-6 text-[10px] md:text-sm leading-tight font-medium">
                    {isMobile ? "Choose your provider and pay 7,000 RWF." : "Follow instructions on your phone to pay 7,000 RWF."}
                </p>

                {/* DEVICE SPECIFIC FLOW */}
                {!isMobile ? (
                    /* PC/DESKTOP FLOW */
                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-3xl mb-6 text-left relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Shield className="w-16 h-16" />
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex -space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-yellow-400 border-2 border-slate-900 flex items-center justify-center overflow-hidden shadow-lg">
                                    <img src="/mtn-momo.png" alt="MTN" className="w-full h-full object-cover" />
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-red-600 border-2 border-slate-900 flex items-center justify-center overflow-hidden shadow-lg">
                                    <img src="/airtel-money.png" alt="Airtel" className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">Official Payment</h3>
                                <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">MTN & Airtel Support</p>
                            </div>
                        </div>

                        <p className="text-slate-400 text-xs font-medium mb-4 leading-relaxed">
                            To activate, dial the following code on your phone:
                        </p>

                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between group/code hover:border-blue-500/30 transition-all shadow-inner">
                            <span className="text-blue-400 font-black text-sm md:text-xl tracking-widest leading-none">
                                {ussdCode}
                            </span>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(ussdCode);
                                    toast.success("Code copied to clipboard!");
                                }}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-4 py-4 border-t border-white/5">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 font-black text-xs">1</div>
                                <span className="text-[8px] font-bold text-slate-500 uppercase">Dial Code</span>
                            </div>
                            <div className="w-12 h-px bg-white/5" />
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 font-black text-xs">2</div>
                                <span className="text-[8px] font-bold text-slate-500 uppercase">Input ID Below</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* MOBILE FLOW */
                    <div className="space-y-3 mb-4">
                        <div className="grid grid-cols-1 gap-2">
                            {/* MTN BUTTON */}
                            <button
                                onClick={handleCall}
                                className="group relative w-full bg-yellow-400 hover:bg-yellow-300 p-3 rounded-xl flex items-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-yellow-400/10"
                            >
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center overflow-hidden">
                                    <img src="/mtn-momo.png" alt="MTN" className="w-full h-full object-cover" />
                                </div>
                                <div className="text-left">
                                    <p className="text-black font-black text-xs leading-tight">Pay with MTN MoMo</p>
                                    <p className="text-black/60 text-[9px] font-bold uppercase tracking-wider">Dial {ussdCode}</p>
                                </div>
                                <div className="ml-auto w-6 h-6 rounded-full bg-black/5 flex items-center justify-center">
                                    <PhoneCall className="w-3 h-3 text-black" />
                                </div>
                            </button>

                            {/* AIRTEL BUTTON */}
                            <button
                                onClick={() => {
                                    toast.info("Airtel Payment Coming Soon", {
                                        description: "Please use MTN MoMo for now or contact support."
                                    });
                                }}
                                className="group relative w-full bg-red-600 hover:bg-red-500 p-3 rounded-xl flex items-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-red-600/10"
                            >
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center overflow-hidden">
                                    <img src="/airtel-money.png" alt="Airtel" className="w-full h-full object-cover" />
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-black text-xs leading-tight">Pay with Airtel Money</p>
                                    <p className="text-white/60 text-[9px] font-bold uppercase tracking-wider">Coming Soon</p>
                                </div>
                                <div className="ml-auto w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                                    <Clock className="w-3 h-3 text-white" />
                                </div>
                            </button>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex items-center justify-center gap-2">
                            <Copy className="w-3 h-3 text-slate-500" />
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(ussdCode);
                                    toast.success("Code Copied!");
                                }}
                                className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-colors"
                            >
                                Copy Code
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="space-y-1.5 text-left">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-[9px] uppercase font-black tracking-widest text-slate-500">Transaction ID</label>
                            <span className="text-[8px] text-blue-500 font-bold">REQUIRED</span>
                        </div>
                        <input
                            type="text"
                            name="transactionId"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="Input the ID from your MoMo SMS"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono text-sm shadow-inner"
                            required
                        />
                    </div>

                    <div className="space-y-1.5 text-left">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-[9px] uppercase font-black tracking-widest text-slate-500">Payment Screenshot</label>
                            <span className="text-[8px] text-slate-500 font-bold">OPTIONAL</span>
                        </div>
                        <input
                            type="file"
                            name="screenshot"
                            accept="image/*"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-slate-400 text-[10px] file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[9px] file:font-black file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-white text-black font-black py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 shadow-xl hover:bg-slate-200 active:scale-[0.98] mt-1 uppercase text-xs tracking-widest neon-white"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        {isPending ? 'Verifying...' : 'Activate PRO'}
                    </button>

                    <div className="flex items-center justify-center gap-1.5 opacity-40">
                        <Shield className="w-2.5 h-2.5 text-emerald-500" />
                        <span className="text-[8px] font-black tracking-tighter uppercase text-slate-400">Encrypted</span>
                    </div>
                </form>
            </div>
        </div>
    )
}


