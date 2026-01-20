import { SignUp } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { LayoutGrid, Sparkles, ShieldCheck } from 'lucide-react'

export default function SignUpPage() {
    return (
        <div className="h-screen md:min-h-screen bg-transparent text-white flex flex-col md:flex-row overflow-hidden font-sans relative">
            {/* BACKGROUND DECORATION */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1),transparent_50%)]"></div>
                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.05),transparent_50%)]"></div>
            </div>

            {/* LEFT SIDE: BRANDING */}
            <div className="hidden md:flex md:w-1/2 flex-col justify-center px-12 lg:px-24 z-10 relative">
                <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
                    <div className="flex items-center gap-2">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                            <LayoutGrid className="text-white w-7 h-7" />
                        </div>
                        <div className="text-3xl font-bold tracking-tighter hover:scale-105 transition-transform cursor-default">
                            SmartMarket<span className="text-blue-500 font-black italic">PRO</span>
                        </div>
                    </div>

                    <h1 className="text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-white">
                        Power Up Your <br />
                        <span className="text-blue-500 italic">Business</span> <br />
                        Journey Today.
                    </h1>

                    <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-[2rem] max-w-md relative overflow-hidden group">
                        <div className="relative z-10 flex items-start gap-4">
                            <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30">
                                <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white">PRO 30-Day Trial</h3>
                                <p className="text-slate-400 text-sm mt-1">Every new account starts with full access to PRO features. No credit card required to start.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 pt-4">
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-white">0%</span>
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Entry Fee</span>
                        </div>
                        <div className="h-8 w-px bg-white/10"></div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-white">Instant</span>
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Setup</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: AUTH FORM */}
            <div className="flex-1 flex flex-col justify-center items-center px-4 md:px-0 z-10 overflow-y-auto custom-scrollbar">
                <SignUp
                    routing="path"
                    path="/sign-up"
                    forceRedirectUrl="/dashboard"
                    appearance={{
                        baseTheme: dark,
                        elements: {
                            formButtonPrimary: 'bg-blue-600 hover:bg-blue-500 text-sm normal-case shadow-[0_0_20px_rgba(37,99,235,0.4)]',
                            card: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2.2rem]',
                            headerTitle: 'text-2xl font-bold',
                            headerSubtitle: 'text-slate-400',
                            socialButtonsBlockButton: 'bg-white/5 border-white/10 hover:bg-white/10',
                            socialButtonsBlockButtonText: 'text-white font-medium',
                            formFieldLabel: 'text-slate-400 font-bold uppercase tracking-widest text-[10px]',
                            formFieldInput: 'bg-white/5 border-white/10 text-white focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-500',
                            footerActionLink: 'text-blue-400 hover:text-blue-300 font-bold',
                            identityPreviewText: 'text-white font-bold',
                            identityPreviewEditButtonIcon: 'text-blue-400'
                        }
                    }}
                />
            </div>
        </div>
    )
}
