'use client'

import { useState, useEffect, useCallback } from 'react'
import SystemRadar from './SystemRadar'
import AIDiagnosticAssistant from './AIDiagnosticAssistant'
import { checkSystemHealth, HealthStatus, performFix } from '@/app/admin/health-actions'
import { Loader2, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'

export default function SystemHealthRadarPanel() {
    const [health, setHealth] = useState<HealthStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [scanning, setScanning] = useState(false)

    const fetchHealth = useCallback(async (silent = false) => {
        if (!silent) setScanning(true)
        try {
            const data = await checkSystemHealth()
            setHealth(data)
        } catch (e: any) {
            console.error("Health Check Failed:", e)
        } finally {
            if (!silent) setScanning(false)
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchHealth()
        // Automatic check every 60 seconds as requested
        const interval = setInterval(() => {
            fetchHealth(true)
        }, 60000)
        return () => clearInterval(interval)
    }, [fetchHealth])

    const handleOneClickFix = async (fixType: string) => {
        const promise = performFix(fixType)

        toast.promise(promise, {
            loading: 'AI Fixer executing commands...',
            success: (data) => {
                fetchHealth()
                return data.message
            },
            error: (err) => `Fix Failed: ${err.message}`
        })

        return promise
    }

    if (loading) {
        return (
            <div className="h-[500px] flex flex-col items-center justify-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem]">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Initializing Radar...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 w-full h-full">
            {/* Radar Panel */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[420px]">
                <div className="absolute top-6 left-6 z-10">
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                        System Radar
                        {scanning && <RefreshCcw className="w-3 h-3 text-blue-500 animate-spin" />}
                    </h2>
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-1">Live Monitor</p>
                </div>

                <div className="absolute top-6 right-6 z-10">
                    <button
                        onClick={() => fetchHealth()}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-300 transition"
                    >
                        Scan
                    </button>
                </div>

                <div className="w-full h-full pt-8">
                    <SystemRadar
                        metrics={health?.metrics || []}
                        scanning={scanning}
                    />
                </div>

                <div className="absolute bottom-6 right-6 text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Sync</p>
                    <p className="text-[10px] font-mono text-white/50">
                        {health?.lastCheck ? new Date(health.lastCheck).toLocaleTimeString() : 'N/A'}
                    </p>
                </div>
            </div>

            {/* AI Assistant Panel */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden flex-1">
                {/* Background Decoration */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />

                <AIDiagnosticAssistant
                    metrics={health?.metrics || []}
                    overallStatus={health?.overallStatus || 'healthy'}
                    onFix={handleOneClickFix}
                />
            </div>
        </div>
    )
}
