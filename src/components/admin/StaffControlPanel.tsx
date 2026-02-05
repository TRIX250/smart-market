'use client'

import { useState } from 'react'
import { Users, Lock, Unlock, Shield } from 'lucide-react'

// Mock Staff Data
const STAFF = [
    { id: 1, name: 'Alice M.', role: 'Manager', refunds: true, pricing: true, stock: true },
    { id: 2, name: 'John D.', role: 'Cashier', refunds: false, pricing: false, stock: false },
    { id: 3, name: 'Sarah K.', role: 'Cashier', refunds: true, pricing: false, stock: true },
]

export default function StaffControlPanel() {
    const [users, setUsers] = useState(STAFF)

    const togglePermission = (userId: number, type: 'refunds' | 'pricing' | 'stock') => {
        setUsers(users.map(u =>
            u.id === userId ? { ...u, [type]: !u[type] } : u
        ))
    }

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-3">
                        <Shield className="w-6 h-6 text-blue-500" />
                        Staff Command Center
                    </h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Access Control & Permissions</p>
                </div>
            </div>

            <div className="space-y-4">
                {users.map((user) => (
                    <div key={user.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 gap-4">
                        <div className="flex items-center gap-4 min-w-[200px]">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{user.name}</h4>
                                <p className="text-xs text-slate-500">{user.role}</p>
                            </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            {/* Refunds Toggle */}
                            <button
                                onClick={() => togglePermission(user.id, 'refunds')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${user.refunds ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-500'}`}
                            >
                                {user.refunds ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                Refunds
                            </button>

                            {/* Pricing Toggle */}
                            <button
                                onClick={() => togglePermission(user.id, 'pricing')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${user.pricing ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-white/5 border-white/10 text-slate-500'}`}
                            >
                                {user.pricing ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                Edit Prices
                            </button>

                            {/* Stock Toggle */}
                            <button
                                onClick={() => togglePermission(user.id, 'stock')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${user.stock ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/10 text-slate-500'}`}
                            >
                                {user.stock ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                Manage Stock
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
