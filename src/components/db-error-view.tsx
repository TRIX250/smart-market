'use client'

import { ShieldAlert, RefreshCw } from 'lucide-react'

export function DBErrorView({ error }: { error?: any }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center p-6 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-500">
            <div className="relative">
                <div className="w-24 h-24 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/20">
                    <ShieldAlert className="w-12 h-12 text-orange-500 animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-4 border-[#0f0c29]">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                </div>
            </div>

            <div className="space-y-4 max-w-md">
                <h2 className="text-3xl font-black tracking-tight text-white uppercase">System Offline</h2>
                <p className="text-slate-400 font-medium leading-relaxed">
                    The database cluster is currently unresponsive. This usually happens during maintenance or if the local service stopped.
                </p>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-xs">
                <button
                    onClick={() => window.location.reload()}
                    className="group bg-white text-black px-8 py-4 rounded-2xl font-black hover:bg-blue-500 hover:text-white transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-3"
                >
                    <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                    RETRY CONNECTION
                </button>

                <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-left">Admin Quick Fix:</p>
                    <code className="block text-[11px] text-emerald-400 font-mono bg-emerald-500/5 p-2 rounded border border-emerald-500/10 text-left overflow-x-auto whitespace-nowrap">
                        sudo pg_ctlcluster 18 main start
                    </code>
                </div>
            </div>

            <div className="pt-4 flex flex-col items-center gap-1">
                <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">Error Code: DB_CONNECTION_REFUSED</p>
                {error?.message && (
                    <p className="text-[9px] text-red-500/50 font-mono italic max-w-xs truncate">{error.message}</p>
                )}
            </div>
        </div>
    )
}
