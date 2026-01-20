'use client'

import { useEffect } from 'react'
import { ShieldAlert, RefreshCw } from 'lucide-react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global Error Caught:", error)
    }, [error])

    const isPrismaError = error.message?.includes("Prisma") ||
        error.message?.includes("database") ||
        error.message?.includes("localhost:5432");

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] text-white p-6 text-center">
            <div className="bg-white/5 backdrop-blur-xl p-12 rounded-[3rem] border border-white/10 shadow-2xl max-w-xl w-full space-y-8">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 mx-auto">
                    <ShieldAlert className="w-12 h-12 text-red-500" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-black uppercase tracking-tight">
                        {isPrismaError ? "Database Offline" : "System Error"}
                    </h1>
                    <p className="text-slate-400 font-medium leading-relaxed">
                        {isPrismaError
                            ? "We're having trouble connecting to the database. Please ensure your local PostgreSQL server is running."
                            : "Something went wrong while processing this page. Our team has been notified."}
                    </p>
                </div>

                {isPrismaError && (
                    <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-3">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-left">Admin Instruction:</p>
                        <code className="block text-xs text-emerald-400 font-mono text-left bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 whitespace-pre-wrap">
                            sudo pg_ctlcluster 18 main start
                        </code>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => reset()}
                        className="bg-white text-black px-8 py-4 rounded-2xl font-black hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-5 h-5" />
                        RETRY PAGE
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-black hover:bg-slate-700 transition-all active:scale-95"
                    >
                        GO HOME
                    </button>
                </div>

                <div className="pt-4 opacity-30">
                    <p className="text-[10px] font-mono uppercase tracking-widest truncate max-w-sm mx-auto">
                        {error.digest || "ERROR_RUNTIME_FAILURE"}
                    </p>
                </div>
            </div>
        </div>
    )
}
