import { SignIn } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { LayoutGrid, PackageSearch, PieChart } from 'lucide-react'

export default function SignInPage() {
    return (
        <div className="h-screen md:min-h-screen bg-transparent text-white flex flex-col md:flex-row overflow-hidden font-sans relative">
            {/* LEFT SIDE: BRANDING (Hidden on mobile) */}
            <div className="hidden md:flex md:w-1/2 flex-col justify-center px-12 lg:px-24 z-10 relative bg-transparent">
                <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
                    <div className="flex items-center gap-2">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                            <LayoutGrid className="text-white w-7 h-7" />
                        </div>
                        <div className="text-3xl font-bold tracking-tighter">
                            SmartMarket<span className="text-blue-500 font-black italic">PRO</span>
                        </div>
                    </div>

                    <h1 className="text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-white">
                        Real-time Business <br />
                        <span className="text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]">Intelligence</span> <br />
                        for Rwanda.
                    </h1>

                    <div className="space-y-6 max-w-md">
                        <div className="flex items-center gap-4 group">
                            <div className="p-3 bg-white/5 rounded-xl group-hover:bg-blue-600/10 transition-colors">
                                <PackageSearch className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Smart Inventory</h3>
                                <p className="text-slate-300 text-sm">Automated stock tracking and low-stock alerts.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 group">
                            <div className="p-3 bg-white/5 rounded-xl group-hover:bg-blue-600/10 transition-colors">
                                <PieChart className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Profit Analysis</h3>
                                <p className="text-slate-300 text-sm">Instant visual reports on your store's performance.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 group">
                            <div className="p-3 bg-white/5 rounded-xl group-hover:bg-blue-600/10 transition-colors">
                                <LayoutGrid className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Modern POS</h3>
                                <p className="text-slate-300 text-sm">Lightning fast sales processing on any device.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: AUTH FORM */}
            <div className="flex-1 flex flex-col justify-center items-center px-4 md:px-0 z-10 overflow-y-auto custom-scrollbar bg-transparent">
                <SignIn
                    routing="path"
                    path="/sign-in"
                    forceRedirectUrl="/dashboard"
                    appearance={{
                        baseTheme: dark,
                        elements: {
                            formButtonPrimary: 'bg-blue-600 hover:bg-blue-500 text-sm normal-case shadow-[0_0_20px_rgba(37,99,235,0.4)]',
                            card: 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.2rem]',
                            headerTitle: 'text-2xl font-bold',
                            headerSubtitle: 'text-slate-300',
                            socialButtonsBlockButton: 'bg-white/5 border-white/10 hover:bg-white/10',
                            socialButtonsBlockButtonText: 'text-white font-medium',
                            formFieldLabel: 'text-slate-300 font-bold uppercase tracking-widest text-[10px]',
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
