'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface DeleteUserModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
    userName: string
}

export function DeleteUserModal({ isOpen, onClose, onConfirm, userName }: DeleteUserModalProps) {
    const [inputValue, setInputValue] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setInputValue('')
            setLoading(false)
        }
    }, [isOpen])

    if (!isOpen) return null

    const isMatch = inputValue === 'DELETE'

    return (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex justify-center items-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#1a1a2e] border border-[#30363d] p-6 rounded-xl w-full max-w-[400px] text-center text-white shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <span className="text-xl">⚠️</span>
                    </div>
                </div>

                <h3 className="text-xl font-bold mb-2">Confirm Deletion</h3>

                <p className="text-slate-400 text-sm mb-6">
                    Type <span className="text-[#ff4d4d] font-bold">"DELETE"</span> to confirm deleting <strong className="text-white">{userName}</strong> and ALL their data. This cannot be undone.
                </p>

                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder='Type DELETE here...'
                    className="w-full p-3 mb-6 bg-[#0f0f1a] border border-[#444] rounded-lg text-white outline-none focus:border-[#00d2ff] focus:ring-1 focus:ring-[#00d2ff] transition-all font-mono text-center placeholder:text-slate-600"
                    autoFocus
                />

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-5 py-2.5 text-slate-400 hover:text-white transition font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            setLoading(true)
                            await onConfirm()
                            setLoading(false)
                        }}
                        disabled={!isMatch || loading}
                        className="bg-gradient-to-br from-[#00d2ff] to-[#3a7bd5] text-white font-bold py-2.5 px-6 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-95"
                    >
                        {loading ? 'Deleting...' : 'OK'}
                    </button>
                </div>
            </div>
        </div>
    )
}
