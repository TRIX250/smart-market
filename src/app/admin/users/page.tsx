'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { getAllUsers } from '@/app/actions'
import { Loader2, Users, Search, Crown, CheckCircle2, Clock, XCircle, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { RemindButton } from './RemindButton'
import { SubscriptionBadge } from '@/lib/subscription-utils'
import { toast } from 'sonner'

interface UserRecord {
    userId: string
    isSubscribed: boolean
    planStatus: string
    expiryDate: Date | null
    email?: string
    fullName?: string
}

import { DeleteUserModal } from '@/components/DeleteUserModal'

export default function UserManagementPage() {
    const [users, setUsers] = useState<UserRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    // Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<{ id: string, name: string } | null>(null)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getAllUsers()
                setUsers(data as any)
            } catch (error) {
                console.error('Failed to fetch users', error)
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
    }, [])

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.userId.toLowerCase().includes(search.toLowerCase())
    )

    const calculateDaysLeft = (expiryDate: Date | null) => {
        if (!expiryDate) return null
        const diff = new Date(expiryDate).getTime() - Date.now()
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
        return days
    }

    const confirmDelete = async () => {
        if (!userToDelete) return;

        const { deleteUser } = await import('@/app/actions')
        try {
            const res = await deleteUser(userToDelete.id)
            if (res.success) {
                // Remove user from local state immediately
                setUsers(users.filter(u => u.userId !== userToDelete.id))
                toast.success('User deleted permanently')
                setDeleteModalOpen(false)
                setUserToDelete(null)
            }
        } catch (e: any) {
            toast.error('Delete failed: ' + e.message)
        }
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <DeleteUserModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                userName={userToDelete?.name || 'User'}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-500">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">User Management</h1>
                        <p className="text-slate-500 text-sm">Monitor all registered SmartMarket PRO accounts</p>
                    </div>
                </div>

                <div className="relative group w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name, email or ID..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Member Info</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Plan</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Access Life</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
                                    Loading user database...
                                </td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                                    No users matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((u) => {
                                const daysLeft = calculateDaysLeft(u.expiryDate)
                                const isExpired = daysLeft !== null && daysLeft <= 0
                                const isPro = u.planStatus === 'ACTIVE' && !isExpired

                                return (
                                    <tr key={u.userId} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center font-bold text-xs text-slate-400 group-hover:border-blue-500/50 transition-colors">
                                                    {(u.fullName || 'U').substring(0, 1)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-white">{u.fullName || 'Unknown User'}</div>
                                                    <div className="text-[10px] text-slate-500">{u.email || 'No email found'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {isPro ? (
                                                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    PRO MEMBER
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-white/5">
                                                    FREE ACCOUNT
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <Crown className={`w-4 h-4 ${isPro ? 'text-amber-500' : 'text-slate-700'}`} />
                                                <span className={`text-xs font-bold ${isPro ? 'text-white' : 'text-slate-500'}`}>
                                                    {u.planStatus}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {daysLeft !== null ? (
                                                isExpired ? (
                                                    <div className="flex items-center gap-1.5 text-red-500 text-xs font-bold">
                                                        <XCircle className="w-4 h-4" />
                                                        Expired
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5">
                                                        <SubscriptionBadge expiryDate={u.expiryDate} />
                                                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                                                    </div>
                                                )
                                            ) : (
                                                <span className="text-slate-600 text-xs italic">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={async () => {
                                                        if (confirm(`Manually unlock PRO for ${u.fullName}?`)) {
                                                            const { manualUnlock } = await import('@/app/actions')
                                                            const res = await manualUnlock(u.userId)
                                                            if (res.success) {
                                                                alert('User unlocked successfully!')
                                                                window.location.reload()
                                                            }
                                                        }
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-tight hover:bg-emerald-500/20 transition border border-emerald-500/20"
                                                >
                                                    Manual Unlock
                                                </button>
                                                <RemindButton userId={u.userId} userName={u.fullName || 'User'} />
                                                <button
                                                    onClick={() => {
                                                        setUserToDelete({ id: u.userId, name: u.fullName || 'Unknown User' })
                                                        setDeleteModalOpen(true)
                                                    }}
                                                    className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition border border-red-500/20"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center mt-4">
                <Link
                    href="/admin/approvals"
                    className="text-slate-500 hover:text-white transition text-xs flex items-center gap-2 uppercase font-black tracking-[0.2em]"
                >
                    ← Back to Approvals
                </Link>
            </div>
        </div>
    )
}
