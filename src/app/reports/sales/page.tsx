import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import PrintButton from '@/components/print-button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ExportSalesButton } from '@/components/export-sales-button';

import { canExport } from '@/lib/auth-utils';
import { DBErrorView } from '@/components/db-error-view';

export default async function SalesReportPage() {
    const { userId } = await auth();
    if (!userId) redirect('/');

    const isAuthorized = await canExport();

    let dbError = false;
    let sales: any[] = [];
    try {
        sales = await prisma.sale.findMany({
            where: { userId },
            include: { product: true },
            orderBy: { createdAt: 'desc' },
            take: 500
        });
    } catch (error) {
        console.error("Failed to fetch sales report:", error);
        dbError = true;
    }

    if (dbError) {
        return <DBErrorView />;
    }

    const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
    const totalItems = sales.reduce((acc, sale) => acc + sale.quantity, 0);

    // Formatting as Rwf
    const rwf = (val: number) => `Rwf ${new Intl.NumberFormat('en-RW').format(val)}`;

    return (
        <div className="space-y-4 md:space-y-8 print:bg-white print:text-black">
            <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">

                {/* Header - No Print Navigation */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm md:text-base">
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden xs:inline">Back to Dashboard</span><span className="xs:hidden">Back</span>
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full sm:w-auto">
                        {isAuthorized && <ExportSalesButton sales={sales} />}
                        <div className="sm:block hidden">
                            <PrintButton />
                        </div>
                    </div>
                </div>

                {/* Report Header */}
                <div className="border-b border-white/10 pb-6 mb-2 md:mb-6 print:border-black">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-4">
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold mb-2 tracking-tight">Detailed Sales Report</h1>
                            <p className="text-slate-500 text-[10px] md:text-sm print:text-slate-600 font-medium">
                                Generated: {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <div className="text-left md:text-right bg-blue-500/5 md:bg-transparent p-4 md:p-0 rounded-2xl border border-blue-500/10 md:border-none w-full md:w-auto">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Total Revenue</p>
                            <p className="text-2xl md:text-4xl font-black text-blue-500 print:text-black tracking-tighter">{rwf(totalRevenue)}</p>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 print:hidden">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-2xl shadow-xl">
                        <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-1 md:mb-2">Transactions</p>
                        <p className="text-lg md:text-3xl font-black text-white">{sales.length}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-2xl shadow-xl">
                        <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-1 md:mb-2">Items Sold</p>
                        <p className="text-lg md:text-3xl font-black text-white">{totalItems}</p>
                    </div>
                    <div className="bg-blue-600/5 backdrop-blur-xl border border-blue-500/10 p-4 md:p-6 rounded-2xl shadow-xl col-span-2 lg:col-span-1">
                        <p className="text-blue-400/60 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-1 md:mb-2">Avg. Transaction</p>
                        <p className="text-lg md:text-3xl font-black text-blue-400">{rwf(sales.length > 0 ? totalRevenue / sales.length : 0)}</p>
                    </div>
                </div>

                {/* Sales Table Container */}
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
            </div>
        </div>
    );
}
