'use client'

import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer,
    PolarRadiusAxis
} from 'recharts'
import { motion } from 'framer-motion'
import { Activity, Zap } from 'lucide-react'
import { SystemMetric } from '@/app/admin/health-actions'

interface SystemRadarProps {
    metrics: SystemMetric[]
    scanning: boolean
}

export default function SystemRadar({ metrics, scanning }: SystemRadarProps) {
    // Transform metrics for Recharts
    // Recharts Radar expects an array of objects
    const data = metrics.map(m => ({
        subject: m.name,
        A: m.value, // value 0-100 (latency needs normalization if > 100)
        fullMark: 100
    }))

    // Normalize latency for visualization (e.g. 0-500ms -> 100-0 score)
    // Actually, let's just trust the value passed is "Health Score" 0-100 for simplicity in visualization
    // effectively: 100 is best, 0 is worst.
    // We should adjust health-actions to return a 'score' for visual consistency if needed, 
    // but looking at 'value', DB latency is raw ms. Let's visual-hack it here.
    const visualData = metrics.map(m => {
        let score = m.value
        // Inverse logic for Latency: Lower is better
        if (m.name === 'DB Latency') {
            score = Math.max(0, 100 - (m.value / 2)) // 200ms = 0 score
        }
        return {
            subject: m.name,
            A: Math.min(100, Math.max(0, score)),
            fullMark: 100
        }
    })

    return (
        <div className="relative w-full h-[400px] flex items-center justify-center">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full" />

            {/* Scanning Line Overlay */}
            {scanning && (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="absolute inset-0 z-0 pointer-events-none"
                >
                    <div className="w-1/2 h-full absolute right-1/2 bg-gradient-to-l from-transparent via-blue-500/10 to-transparent skew-x-12 opacity-50" />
                </motion.div>
            )}

            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={visualData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                    <Radar
                        name="System Health"
                        dataKey="A"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        isAnimationActive={true}
                    />
                </RadarChart>
            </ResponsiveContainer>

            {/* Central Pulse */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 animate-ping opacity-20 rounded-full" />
                    <div className="w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,1)] flex items-center justify-center">
                        <Zap className="w-3 h-3 text-white fill-white" />
                    </div>
                </div>
            </div>

            {/* Status indicators */}
            <div className="absolute bottom-4 left-4 flex gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-300">LIVE MONITORING</span>
                </div>
            </div>
        </div>
    )
}
