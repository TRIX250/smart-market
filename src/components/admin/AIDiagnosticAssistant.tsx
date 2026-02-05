'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Bot, HelpCircle, CheckCircle, AlertTriangle, XCircle, Wrench, RefreshCw } from 'lucide-react'
import { SystemMetric } from '@/app/admin/health-actions'
import { useState } from 'react'

interface AIDiagnosticAssistantProps {
    metrics: SystemMetric[]
    overallStatus: 'healthy' | 'degraded' | 'critical'
    onFix: (fixType: string) => Promise<any>
}

export default function AIDiagnosticAssistant({ metrics, overallStatus, onFix }: AIDiagnosticAssistantProps) {
    const [fixing, setFixing] = useState<string | null>(null)

    const getDiagnostics = () => {
        const issues = metrics.filter(m => m.status !== 'good')
        if (issues.length === 0) {
            // Random Marketing Tip if healthy
            const marketingTips = [
                "Sales are low today. Suggest a 10% discount on 'House Espresso' to boost traffic.",
                "It's raining. Push a notification for 'Warm Hot Chocolate' to local users.",
                "Inventory High: 'Blueberry Muffin'. Run a 'Buy 1 Get 1 Free' for the next hour.",
                "Peak Hour approaching. Ensure 'Iced Latte' stock is at max capacity."
            ]
            const randomTip = marketingTips[Math.floor(Math.random() * marketingTips.length)]

            return {
                title: "System Optimized",
                advice: "All technical systems are green.",
                recommendation: `marketing_tip: ${randomTip}`,
                icon: CheckCircle,
                color: "text-emerald-500",
                bg: "bg-emerald-500/10"
            }
        }

        const firstIssue = issues[0]
        let advice = ""
        let fixType = ""
        let fixLabel = ""

        if (firstIssue.name === 'DB Latency') {
            advice = "The database response time is higher than normal. This could delay payment processing for new users."
            fixType = "cache_clear"
            fixLabel = "Purge DB Cache"
        } else if (firstIssue.name === 'Local Network') {
            advice = "Hotspot bandwidth low. Move your PC closer to the router or restart the 192.168.43.45 gateway."
            fixType = "network_reset"
            fixLabel = "Rebind Network"
        } else if (firstIssue.name === 'MoMo API') {
            advice = "The MTN/Airtel USSD gateway is unresponsive. Check your merchant server's internet connection."
            fixType = "network_reset"
            fixLabel = "Reset API Link"
        } else {
            advice = firstIssue.message
            fixType = "cache_clear"
            fixLabel = "Quick Optimization"
        }

        return {
            title: `${firstIssue.name} Alert`,
            advice,
            recommendation: `Step-by-Step Fix: Click '${fixLabel}' to attempt an automated resolution or reset your local environment.`,
            icon: AlertTriangle,
            status: firstIssue.status,
            fixType,
            fixLabel,
            color: firstIssue.status === 'critical' ? "text-red-500" : "text-amber-500",
            bg: firstIssue.status === 'critical' ? "bg-red-500/10" : "bg-amber-500/10"
        }
    }

    const diagnostic = getDiagnostics()

    const handleFix = async (type: string) => {
        setFixing(type)
        try {
            await onFix(type)
        } finally {
            setFixing(null)
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 relative">
                    <Bot className="w-5 h-5" />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#030617]"
                    />
                </div>
                <h2 className="text-xl font-black text-white">AI Bug Doctor</h2>
            </div>

            <div className={`p-6 rounded-3xl ${diagnostic.bg} border border-white/5 mb-6 backdrop-blur-md relative overflow-hidden group`}>
                {/* Glow effect */}
                <div className={`absolute -inset-10 opacity-20 blur-2xl transition-all duration-1000 group-hover:opacity-30 ${diagnostic.color.replace('text', 'bg')}`} />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <diagnostic.icon className={`w-5 h-5 ${diagnostic.color}`} />
                        <h3 className={`font-black uppercase tracking-widest text-[12px] ${diagnostic.color}`}>
                            {diagnostic.title}
                        </h3>
                    </div>
                    <p className="text-slate-200 text-sm font-medium mb-4 leading-relaxed italic">
                        "{diagnostic.advice}"
                    </p>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                            {diagnostic.recommendation.startsWith('marketing_tip:') ? 'AI Marketing Suggestion' : 'Prescriptive Fix'}
                        </h4>
                        <p className={`text-xs font-bold leading-relaxed ${diagnostic.recommendation.startsWith('marketing_tip:') ? 'text-purple-300' : 'text-white'}`}>
                            {diagnostic.recommendation.replace('marketing_tip: ', '')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-auto space-y-3">
                {diagnostic.fixType && (
                    <button
                        onClick={() => handleFix(diagnostic.fixType as string)}
                        disabled={!!fixing}
                        className="w-full py-4 bg-blue-500 hover:bg-blue-400 disabled:bg-blue-900 border border-blue-400/20 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest text-white transition shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    >
                        {fixing ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Wrench className="w-4 h-4" />
                        )}
                        {fixing ? 'Applying Patch...' : `Fix with One Click: ${diagnostic.fixLabel}`}
                    </button>
                )}

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${overallStatus === 'healthy' ? 'bg-emerald-500' : overallStatus === 'degraded' ? 'bg-amber-500' : 'bg-red-500'} animate-pulse`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Heartbeat</span>
                    </div>
                    <span className="text-[10px] font-black text-white/50">{overallStatus.toUpperCase()}</span>
                </div>
            </div>
        </div>
    )
}
