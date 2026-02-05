'use client'

import { useState, useEffect, useRef } from 'react'
import { Terminal, Activity, Wifi, X, RefreshCw, Database, Zap, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { flushDevCache, rebootDevServer, getSystemAnomalies, getRealSystemLogs, getTrafficMetrics } from '@/app/admin/dev-actions'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

export default function DevGodMode() {
    const { user } = useUser()
    const [isOpen, setIsOpen] = useState(false)
    const [authorized, setAuthorized] = useState(false)
    const [activeTab, setActiveTab] = useState<'terminal' | 'radar' | 'network'>('terminal')

    // Secret Key Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl + Shift + D
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault()
                toggleDevMode()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [user])

    const toggleDevMode = () => {
        const email = user?.emailAddresses[0]?.emailAddress
        if (email === 'ishimwet822@gmail.com') {
            setAuthorized(true)
            setIsOpen(prev => !prev)
            if (!isOpen) toast.success('GOD MODE ACTIVATED')
        } else {
            toast.error('ACCESS DENIED: Master Admin Only')
        }
    }

    if (!isOpen || !authorized) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl"
                    onClick={() => setIsOpen(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-[900px] h-[650px] bg-gradient-to-b from-[#0f172a]/90 to-[#1e1b4b]/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                <span className="text-sm font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                                    Dev-God Command Center
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 font-mono hidden md:inline-block">CTRL+SHIFT+D to close</span>
                                <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="px-6 py-4">
                            <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                                <TabButton
                                    active={activeTab === 'terminal'}
                                    onClick={() => setActiveTab('terminal')}
                                    icon={Terminal}
                                    label="Terminal"
                                />
                                <TabButton
                                    active={activeTab === 'radar'}
                                    onClick={() => setActiveTab('radar')}
                                    icon={Database}
                                    label="Radar"
                                />
                                <TabButton
                                    active={activeTab === 'network'}
                                    onClick={() => setActiveTab('network')}
                                    icon={Wifi}
                                    label="Traffic"
                                />
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden relative px-6 pb-6">
                            <div className="h-full w-full rounded-3xl overflow-hidden ring-1 ring-white/10 bg-black/20">
                                {activeTab === 'terminal' && <DevTerminal />}
                                {activeTab === 'radar' && <SystemAnomalyRadar />}
                                {activeTab === 'network' && <NetworkTrafficSniffer />}
                            </div>
                        </div>

                        {/* Footer / Quick Actions */}
                        <div className="p-6 border-t border-white/10 bg-black/20 backdrop-blur-md">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Emergency Controls</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <ActionButton
                                    label="Flush Cache"
                                    icon={RefreshCw}
                                    color="text-amber-400"
                                    bg="bg-amber-500/10"
                                    hover="hover:bg-amber-500/20"
                                    onClick={async () => {
                                        toast.promise(flushDevCache(), {
                                            loading: 'Flushing Cache...',
                                            success: 'Cache Cleared',
                                            error: 'Failed'
                                        })
                                    }}
                                />
                                <ActionButton
                                    label="Reboot Core"
                                    icon={Zap}
                                    color="text-red-400"
                                    bg="bg-red-500/10"
                                    hover="hover:bg-red-500/20"
                                    onClick={() => {
                                        toast.custom((t) => (
                                            <div className="bg-[#0f172a] border border-white/10 p-4 rounded-2xl shadow-2xl w-[350px] flex flex-col gap-3 relative overflow-hidden">
                                                {/* Ambient Glow */}
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[50px] -z-10" />

                                                <div className="flex items-center gap-3 text-red-400">
                                                    <div className="p-2 bg-red-500/10 rounded-lg">
                                                        <Zap className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-white">Initiate Core Reboot?</h4>
                                                        <p className="text-[10px] text-slate-400">Downtime estimated: ~2.4s</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => toast.dismiss(t)}
                                                        className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-400 transition"
                                                    >
                                                        ABORT
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            toast.dismiss(t)
                                                            toast.promise(rebootDevServer(), {
                                                                loading: 'Rebooting System...',
                                                                success: 'System Online',
                                                                error: 'Reboot Failed'
                                                            })
                                                        }}
                                                        className="flex-1 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-xs font-bold text-red-400 border border-red-500/20 transition shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                                                    >
                                                        CONFIRM REBOOT
                                                    </button>
                                                </div>
                                            </div>
                                        ), { duration: 10000 })
                                    }}
                                />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-center gap-2 p-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white/10 text-white shadow-lg shadow-black/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
        >
            <Icon className="w-3 h-3" />
            {label}
        </button>
    )
}

export function ActionButton({ label, icon: Icon, color, bg, hover, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border border-white/5 transition-all ${bg} ${hover} ${color}`}
        >
            <Icon className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </button>
    )
}

// --- Sub Components ---

function DevTerminal() {
    const [logs, setLogs] = useState<string[]>([])
    const scrollRef = useRef<HTMLDivElement>(null)

    const fetchLogs = async () => {
        try {
            const realLogs = await getRealSystemLogs()
            // We append and keep only the last 50
            setLogs(realLogs)
        } catch (e) {
            console.error("Terminal sync failed:", e)
        }
    }

    useEffect(() => {
        fetchLogs()
        const interval = setInterval(fetchLogs, 3000) // Poll real logs every 3 seconds
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [logs])

    return (
        <div className="h-full flex flex-col font-mono text-xs">
            <div className="p-3 bg-white/5 border-b border-white/5 text-[10px] text-slate-400 flex justify-between font-bold">
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> terminal://smart-market-dev</span>
                <span className="text-purple-400">zsh</span>
            </div>
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-1.5 text-slate-300 scrollbar-hide font-medium">
                {logs.map((log, i) => {
                    const isQuery = log.includes('QUERY')
                    const isWarn = log.includes('WARN')

                    return (
                        <div key={i} className={`${isQuery ? 'text-blue-400' : isWarn ? 'text-amber-400' : 'text-slate-300'}`}>
                            <span className="opacity-50 mr-2">{log.split(' : ')[0]}</span>
                            <span className="opacity-100">{log.split(' : ')[1]}</span>
                        </div>
                    )
                })}
                <div className="animate-pulse">_</div>
            </div>
        </div>
    )
}

function SystemAnomalyRadar() {
    const [blips, setBlips] = useState<{ id: string, type: string, angle: number, dist: number, severity: 'low' | 'high', detail?: string }[]>([])
    const [isScanning, setIsScanning] = useState(false)

    const fetchAnomalies = async () => {
        setIsScanning(true)
        try {
            const data = await getSystemAnomalies()
            setBlips(data)
        } catch (e) {
            console.error("Radar scanning failed:", e)
        } finally {
            setIsScanning(false)
        }
    }

    useEffect(() => {
        fetchAnomalies()
        const interval = setInterval(fetchAnomalies, 5000) // Scan every 5 seconds
        return () => clearInterval(interval)
    }, [])

    const handleRepair = (id: string) => {
        setBlips(prev => prev.filter(b => b.id !== id))
        toast.success(`Anomaly neutralized and patched.`)
    }

    return (
        <div className="h-full flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                    <h3 className="text-[10px] font-black text-white italic tracking-[0.2em] uppercase">
                        Neural Pulse Detection
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500/20 border border-emerald-500" />
                    <span className="text-[8px] font-mono text-emerald-500 uppercase">Sweep Active</span>
                </div>
            </div>

            <div className="flex-1 flex gap-8 items-start">
                {/* Visual Radar - Smaller and Centered in its col */}
                <div className="relative aspect-square w-48 border border-emerald-500/20 rounded-full bg-emerald-500/5 flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.05)]">
                    {/* Concentric Circles */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 transition-opacity">
                        <div className="w-[100%] h-[100%] rounded-full border border-emerald-500" />
                        <div className="absolute w-[75%] h-[75%] rounded-full border border-emerald-500" />
                        <div className="absolute w-[50%] h-[50%] rounded-full border border-emerald-500" />
                        <div className="absolute w-[25%] h-[25%] rounded-full border border-emerald-500" />
                    </div>

                    {/* Axis Lines */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <div className="w-full h-px bg-emerald-500" />
                        <div className="w-px h-full bg-emerald-500" />
                    </div>

                    {/* Rotating Sweep */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        className="absolute inset-x-1/2 inset-y-0 w-1/2 origin-left bg-gradient-to-r from-emerald-500/40 to-transparent pointer-events-none"
                    />

                    {/* Blips */}
                    {blips.map((blip) => (
                        <motion.div
                            key={blip.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 2, delay: (blip.angle / 360) * 4 }}
                            className={`absolute w-2.5 h-2.5 rounded-full shadow-[0_0_15px_currentColor] z-10 ${blip.severity === 'high' ? 'text-red-500 bg-red-500' : 'text-amber-400 bg-amber-400'}`}
                            style={{
                                transformOrigin: 'center',
                                left: `calc(50% + ${(blip.dist / 2)}% * ${Math.cos(blip.angle * Math.PI / 180)})`,
                                top: `calc(50% + ${(blip.dist / 2)}% * ${Math.sin(blip.angle * Math.PI / 180)})`,
                            }}
                        />
                    ))}

                    <div className="absolute bottom-2 right-2 text-[8px] font-mono text-emerald-500 uppercase tracking-tighter animate-pulse">
                        {isScanning ? 'Pulse Emitting...' : 'Pulse Echo Received'}
                    </div>
                </div>

                {/* Bug List */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[350px] scrollbar-hide py-2">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Detected Objects</div>
                    {blips.length === 0 ? (
                        <div className="p-8 text-center border border-dashed border-emerald-500/20 rounded-2xl bg-emerald-500/5">
                            <ShieldCheck className="w-8 h-8 text-emerald-500/20 mx-auto mb-2" />
                            <p className="text-[10px] text-emerald-500 uppercase font-black tracking-[0.2em]">System Nominal: No Threats</p>
                        </div>
                    ) : (
                        blips.map((blip) => (
                            <div key={blip.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full animate-ping ${blip.severity === 'high' ? 'bg-red-500' : 'bg-amber-400'}`} />
                                    <div>
                                        <div className="text-[10px] font-black text-white italic tracking-wider">{blip.type}</div>
                                        <div className="text-[8px] font-mono text-slate-500 uppercase">POS: {blip.angle}° / RNG: {blip.dist}KM</div>
                                        {blip.detail && <div className="text-[7px] text-emerald-500/60 font-mono mt-1">{blip.detail}</div>}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRepair(blip.id)}
                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] transition-all border ${blip.severity === 'high'
                                        ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white'
                                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                                        }`}
                                >
                                    Repair Link
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

function NetworkTrafficSniffer() {
    const [points, setPoints] = useState<number[]>([20, 25, 30, 15, 40, 35, 20, 45, 30, 25, 35, 10, 50, 40, 30, 20, 25, 40, 35, 20])
    const [metrics, setMetrics] = useState({ latency: 0, requestsPerSec: 0 })

    const fetchMetrics = async () => {
        try {
            const data = await getTrafficMetrics()
            setMetrics({ latency: data.latency, requestsPerSec: data.requestsPerSec })

            // Add new point and scroll
            setPoints(prev => {
                const newPoint = Math.min(50, Math.max(5, data.requestsPerSec))
                return [...prev.slice(1), newPoint]
            })
        } catch (e) {
            console.error("Traffic sync failed", e)
        }
    }

    useEffect(() => {
        const interval = setInterval(fetchMetrics, 1000)
        return () => clearInterval(interval)
    }, [])

    // Generate SVG path for smooth line
    const generatePath = () => {
        const width = 100
        const step = width / (points.length - 1)

        let d = `M0,${50 - points[0]} `
        for (let i = 1; i < points.length; i++) {
            d += `L${i * step},${50 - points[i]} `
        }
        return d
    }

    const areaPath = `${generatePath()} V50 H0 Z`

    return (
        <div className="h-full flex flex-col gap-4 p-6">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-50">
                    <Wifi className="w-12 h-12 text-white/5" />
                </div>

                <div className="flex items-center justify-between mb-2 z-10 relative">
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Live Traffic Feed</h3>
                        <p className="text-[9px] text-emerald-500 font-mono animate-pulse">● SIGNAL LOCKED: LOCALHOST:3000</p>
                    </div>
                </div>

                {/* Live Graph */}
                <div className="relative h-48 w-full mt-4">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                        {/* Grid Lines */}
                        <line x1="0" y1="12.5" x2="100" y2="12.5" stroke="rgba(255,255,255,0.05)" strokeWidth="0.1" />
                        <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="0.1" />
                        <line x1="0" y1="37.5" x2="100" y2="37.5" stroke="rgba(255,255,255,0.05)" strokeWidth="0.1" />

                        <defs>
                            <linearGradient id="trafficGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
                                <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                            </linearGradient>
                        </defs>

                        <motion.path
                            d={areaPath}
                            fill="url(#trafficGradient)"
                            className="transition-all duration-300 ease-linear"
                        />
                        <motion.path
                            d={generatePath()}
                            fill="none"
                            stroke="#60a5fa"
                            strokeWidth="0.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-all duration-300 ease-linear drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]"
                        />
                    </svg>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-500/5 blur-xl" />
                    <div className="text-3xl font-black text-white z-10">{metrics.requestsPerSec}</div>
                    <div className="text-[9px] uppercase tracking-[0.2em] text-blue-400 z-10 font-bold mt-1">Req / Sec</div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-500/5 blur-xl" />
                    <div className="text-3xl font-black text-emerald-400 z-10">{metrics.latency}ms</div>
                    <div className="text-[9px] uppercase tracking-[0.2em] text-emerald-500 z-10 font-bold mt-1">Latency</div>
                </div>
            </div>
        </div>
    )
}


