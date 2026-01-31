'use client'

import { useState, useEffect } from 'react'
import { createExpense, getExpenses, deleteExpense } from '@/app/actions'
import { toast } from 'sonner'
import Link from 'next/link'
import { Trash2, Plus, ArrowLeft, DollarSign, Calendar } from 'lucide-react'

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // Form State
    const [category, setCategory] = useState('Other')
    const [customCategory, setCustomCategory] = useState('')
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')

    useEffect(() => {
        loadExpenses()
    }, [])

    const loadExpenses = async () => {
        try {
            const data = await getExpenses()
            setExpenses(data)
        } catch (e) {
            console.error(e)
            toast.error("Failed to load expenses")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!amount || !description) return

        // Validate custom category
        const finalCategory = category === 'Custom' ? customCategory.trim() : category
        if (!finalCategory) {
            toast.error("Please enter a category name")
            return
        }

        setSubmitting(true)
        try {
            await createExpense({
                category: finalCategory,
                amount: parseInt(amount),
                description
            })
            toast.success("Expense logged successfully")
            setAmount('')
            setDescription('')
            setCategory('Other')
            setCustomCategory('') // Reset custom category
            loadExpenses()
        } catch (e) {
            toast.error("Failed to save expense")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this expense?")) return

        try {
            await deleteExpense(id)
            toast.success("Expense deleted")
            loadExpenses()
        } catch (e: any) {
            toast.error(e.message || "Failed to delete expense")
        }
    }

    const categories = ['Rent', 'Electricity', 'Salary', 'Restock', 'Transport', 'Other']

    // Calculate Month Total
    const currentMonth = new Date().getMonth()
    const monthTotal = expenses
        .filter(e => new Date(e.createdAt).getMonth() === currentMonth)
        .reduce((sum, e) => sum + e.amount, 0)

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
            <div className="flex items-center gap-3 md:gap-4">
                <Link href="/" className="p-2 rounded-xl hover:bg-white/10 transition">
                    <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                </Link>
                <div>
                    <h1 className="text-xl md:text-3xl font-bold tracking-tight">Expense Tracker</h1>
                    <p className="text-slate-400 text-xs md:text-sm">Manage store operational costs</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {/* FORM SECTION */}
                <div className="md:col-span-1 space-y-4 md:space-y-6">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-xl">
                        <h2 className="font-bold text-base md:text-lg mb-3 md:mb-4 flex items-center gap-2">
                            <Plus className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                            Log New Expense
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs uppercase font-bold text-slate-400">Category</label>
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-sm outline-none focus:border-blue-500/50 transition"
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    <option value="Custom">Custom / Create New</option>
                                </select>
                            </div>

                            {/* Conditional Custom Category Input */}
                            {category === 'Custom' && (
                                <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <label className="text-xs uppercase font-bold text-blue-400">New Category Name</label>
                                    <input
                                        type="text"
                                        value={customCategory}
                                        onChange={e => setCustomCategory(e.target.value)}
                                        placeholder="e.g. Marketing, Maintenance"
                                        className="w-full bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-sm outline-none focus:border-blue-500 transition text-blue-100 placeholder:text-blue-500/30"
                                        autoFocus
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs uppercase font-bold text-slate-400">Amount (Rwf)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-white/5 border border-white/10 p-3 pl-10 rounded-xl text-sm outline-none focus:border-blue-500/50 transition font-mono"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs uppercase font-bold text-slate-400">Description</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="e.g. Paid electricity bill"
                                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-sm outline-none focus:border-blue-500/50 transition"
                                />
                            </div>

                            <button
                                disabled={submitting}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
                            >
                                {submitting ? 'Saving...' : 'Add Expense'}
                            </button>
                        </form>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-xl">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">This Month's Total</p>
                        <p className="text-2xl md:text-3xl font-black text-rose-500">
                            Rwf {monthTotal.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* LIST SECTION */}
                <div className="md:col-span-2">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl">
                        <div className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center">
                            <h2 className="font-bold text-base md:text-lg">Recent History</h2>
                            <span className="text-xs text-slate-400 bg-white/5 px-2 md:px-3 py-1 rounded-full">
                                {expenses.length} Records
                            </span>
                        </div>

                        <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto no-scrollbar">
                            {expenses.length === 0 && !loading && (
                                <div className="p-12 text-center text-slate-500 italic">
                                    No expenses logged yet.
                                </div>
                            )}

                            {expenses.map((expense) => (
                                <div key={expense.id} className="p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-white/5 transition group gap-3 sm:gap-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                                            <DollarSign className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm break-words line-clamp-2">{expense.description}</p>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                                <span className="bg-white/5 px-2 py-0.5 rounded text-slate-400">{expense.category}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(expense.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                        <span className="font-mono font-bold text-white text-sm md:text-base">
                                            -{expense.amount.toLocaleString()}
                                        </span>
                                        <button
                                            onClick={() => handleDelete(expense.id)}
                                            className="p-2 rounded-lg text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                            title="Delete Expense"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
