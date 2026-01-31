'use client';

import { useState } from 'react';
import { deleteSale } from '@/app/inventory/actions';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface SalesTableProps {
    sales: any[];
}

export function SalesTable({ sales }: SalesTableProps) {
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Formatting helper
    const rwf = (val: number) => `Rwf ${new Intl.NumberFormat('en-RW').format(val)}`;

    const handleDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            await deleteSale(itemToDelete);
            setItemToDelete(null);
        } catch (error) {
            console.error(error);
            alert("Failed to delete sale");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl print:bg-transparent print:border-none">
                <div className="overflow-x-auto custom-scrollbar md:overflow-visible">
                    <table className="w-full text-xs md:text-sm text-left lg:min-w-0">
                        <thead className="bg-white/5 text-slate-400 text-[9px] md:text-[10px] uppercase font-bold tracking-widest print:bg-slate-100 print:text-black">
                            <tr>
                                <th className="p-4 md:p-5">Time/Date</th>
                                <th className="p-4 md:p-5">Product</th>
                                <th className="hidden sm:table-cell p-4 md:p-5 text-center">Qty</th>
                                <th className="hidden md:table-cell p-4 md:p-5 text-right">Unit Price</th>
                                <th className="p-4 md:p-5 text-right">Total</th>
                                <th className="hidden md:table-cell p-4 md:p-5 text-right">Method</th>
                                <th className="hidden md:table-cell p-4 md:p-5 text-right print:hidden">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 print:divide-slate-300">
                            {sales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-white/[0.02] transition-colors print:hover:bg-transparent group">
                                    <td className="p-4 md:p-5 text-slate-500 font-mono print:text-black whitespace-nowrap">
                                        {new Date(sale.createdAt).toLocaleString('en-US', {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
                                        })}
                                    </td>
                                    <td className="p-4 md:p-5 font-bold text-slate-200 print:text-black break-words line-clamp-2 max-w-[120px] md:max-w-none">{sale.product.name}</td>
                                    <td className="hidden sm:table-cell p-4 md:p-5 text-center">
                                        <span className="bg-white/10 text-slate-300 px-2 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-black">
                                            {sale.quantity}
                                        </span>
                                    </td>
                                    <td className="hidden md:table-cell p-4 md:p-5 text-right text-slate-500 font-mono text-[10px] md:text-xs print:text-black group-hover:text-slate-300 transition-colors">
                                        {rwf(sale.totalAmount / sale.quantity)}
                                    </td>
                                    <td className="p-4 md:p-5 text-right font-black text-white print:text-black tracking-tight">{rwf(sale.totalAmount)}</td>
                                    <td className="hidden md:table-cell p-4 md:p-5 text-right">
                                        <span className={`px-2 py-1 rounded-[4px] text-[9px] md:text-[10px] font-black uppercase tracking-wider ${sale.paymentMethod === 'MOMO' || sale.paymentMethod === 'MOBILE_MONEY'
                                            ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                            } print:border print:border-black print:text-black print:bg-transparent`}>
                                            {sale.paymentMethod}
                                        </span>
                                    </td>
                                    <td className="hidden md:table-cell p-4 md:p-5 text-right print:hidden">
                                        <button
                                            onClick={() => setItemToDelete(sale.id)}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                            title="Delete Sale"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Empty State */}
                {sales.length === 0 && (
                    <div className="py-20 text-center space-y-3">
                        <p className="text-slate-500 font-medium italic">No sales transactions found for this period.</p>
                    </div>
                )}
                <div className="text-center text-slate-600 text-[10px] p-8 print:block hidden border-t border-slate-200 mt-10">
                    Confidential Financial Report - Powered by SmartMarket Pro
                </div>
            </div>

            {/* Custom Modal with Improved UI */}
            {itemToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3 text-red-500">
                                <div className="p-2 bg-red-500/10 rounded-lg">
                                    <AlertTriangle size={24} />
                                </div>
                                <h3 className="text-lg font-bold">Confirm Deletion</h3>
                            </div>
                            <button
                                onClick={() => setItemToDelete(null)}
                                className="text-slate-500 hover:text-white transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                            Are you sure you want to delete this sale? This action will reverse the transaction and <span className="text-white font-bold">restore stock quantity</span>.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setItemToDelete(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition border border-white/5"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/20 transition flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        Delete Sale
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
