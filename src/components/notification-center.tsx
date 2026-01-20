'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Check, Loader2 } from 'lucide-react'
import { getUserNotifications, markNotificationAsRead } from '@/app/actions'
import { toast } from 'sonner'

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const fetchNotifications = async (isFirstLoad = false) => {
        const data = await getUserNotifications()

        // Check for new notifications to trigger browser alert
        if (!isFirstLoad && data.length > notifications.length) {
            const latest = data[0];
            if (!latest.isRead) {
                // Show browser notification if permitted
                if (Notification.permission === 'granted') {
                    new Notification(latest.title, {
                        body: latest.message,
                        icon: '/icon-192.png'
                    });
                }
                // Show toast anyway
                toast.success(latest.title, {
                    description: latest.message,
                });
            }
        }
        setNotifications(data)
    }

    const requestPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                toast.success("Notifications Enabled", {
                    description: "You'll now receive alerts even when the menu is closed."
                });
            }
        }
    }

    useEffect(() => {
        fetchNotifications(true)
        const interval = setInterval(() => fetchNotifications(false), 30000)
        return () => clearInterval(interval)
    }, [notifications.length])

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        await markNotificationAsRead(id)
        setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n))
    }

    const unreadCount = notifications.filter(n => !n.isRead).length

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors border border-white/5"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full animate-pulse border-2 border-slate-950">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="
                        fixed md:absolute top-[80px] md:top-full right-4 md:right-0 mt-2
                        w-[calc(100vw-2rem)] md:w-80 lg:w-96 
                        max-h-[70vh] md:max-h-[500px] 
                        bg-[#0f172a]/95 backdrop-blur-2xl 
                        border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] 
                        z-[100] overflow-hidden flex flex-col 
                        transform origin-top-right transition-all duration-300 ease-out 
                        animate-in fade-in zoom-in-95
                    ">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.03]">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="bg-blue-500/10 text-blue-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                            {unreadCount} New
                                        </span>
                                    )}
                                </div>
                                {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && (
                                    <button
                                        onClick={requestPermission}
                                        className="text-[9px] font-black uppercase text-blue-500 hover:text-blue-400 text-left transition-colors"
                                    >
                                        Enable Browser Alerts
                                    </button>
                                )}
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="overflow-y-auto custom-scrollbar flex-1">
                            {notifications.length === 0 ? (
                                <div className="py-12 px-8 text-center space-y-3">
                                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center mx-auto opacity-20">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <p className="text-slate-500 text-[11px] font-medium italic">Your inbox is empty</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`p-4 hover:bg-white/[0.02] transition-all cursor-default group relative ${!n.isRead ? 'bg-blue-500/[0.03]' : ''}`}
                                        >
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                                                        <p className={`text-xs font-black truncate ${!n.isRead ? 'text-white' : 'text-slate-400'}`}>
                                                            {n.title}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-3 group-hover:text-slate-300 transition-colors">
                                                        {n.message}
                                                    </p>
                                                    <p className="text-[9px] text-slate-600 mt-2 font-black uppercase tracking-tighter flex items-center gap-1.5">
                                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                        {new Date(n.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                                {!n.isRead && (
                                                    <button
                                                        onClick={(e) => handleMarkAsRead(n.id, e)}
                                                        className="shrink-0 p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all transform hover:scale-110"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="p-3 bg-white/[0.01] border-t border-white/5 text-center">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                    SmartMarket Intelligent Alerts
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
