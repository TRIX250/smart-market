import { useState, useEffect } from 'react'
import { Activity, AlertOctagon, CheckCircle2, TrendingDown, Loader2 } from 'lucide-react'
import { getInventoryInsights } from '@/app/actions'

export default function InventoryPredictionTable() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getInventoryInsights()
                setProducts(data)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) {
        return (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-4" />
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Scanning Store Shelves...</p>
            </div>
        )
    }

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-3">
                        <Activity className="w-6 h-6 text-purple-500" />
                        AI Inventory Vision
                    </h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Predictive Stock Analysis • Global Network</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                            <th className="pb-4 pl-4">Product Name</th>
                            <th className="pb-4 text-center">Current Stock</th>
                            <th className="pb-4 text-center">Daily Sell Rate</th>
                            <th className="pb-4 text-right pr-4">AI Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-white/5">
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-slate-500 italic">No products detected in circulation.</td>
                            </tr>
                        ) : products.map((product, i) => (
                            <tr key={i} className="group hover:bg-white/5 transition-colors">
                                <td className="py-4 pl-4 font-bold text-slate-300 group-hover:text-white transition-colors">
                                    {product.name}
                                </td>
                                <td className="py-4 text-center text-slate-400 font-mono text-xs">
                                    {product.stock} units
                                </td>
                                <td className="py-4 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-1">
                                    {product.avgSales}
                                    <span className="text-[10px] text-slate-600">/day</span>
                                </td>
                                <td className="py-4 text-right pr-4">
                                    <StatusBadge status={product.status} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {products.length > 0 && products.some(p => p.status !== 'Good') && (
                <div className="mt-6 flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                    <TrendingDown className="w-5 h-5 text-purple-400" />
                    <div>
                        <p className="text-xs font-bold text-white italic">AI Insight: Critical depletion risk detected.</p>
                        <p className="text-[10px] text-purple-300 uppercase tracking-widest font-black">Restock recommended for flagged units.</p>
                    </div>
                </div>
            )}
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'Good') {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                <CheckCircle2 className="w-3 h-3" /> Good
            </span>
        )
    }
    if (status === 'Low') {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest">
                <AlertOctagon className="w-3 h-3" /> Low
            </span>
        )
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-widest animate-pulse">
            <AlertOctagon className="w-3 h-3" /> Critical
        </span>
    )
}
