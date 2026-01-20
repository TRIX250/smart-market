import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import PrintButton from '@/components/print-button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { DBErrorView } from '@/components/db-error-view';

export default async function ProfitReportPage() {
    const { userId } = await auth();
    if (!userId) redirect('/');

    let dbError = false;
    let sales: any[] = [];
    let wasteLogs: any[] = [];
    try {
        sales = await prisma.sale.findMany({
            where: { userId, status: 'COMPLETED' },
            orderBy: { createdAt: 'desc' }
        });

        wasteLogs = await prisma.wasteLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("Failed to fetch profit report data:", error);
        dbError = true;
    }

    if (dbError) {
        return <DBErrorView />;
    }

    // Calculations
    const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);

    // Separate Profit from Selling Loss
    const totalSalesGain = sales.reduce((acc, s) => acc + (s.profit > 0 ? s.profit : 0), 0);
    const totalSellingLoss = sales.reduce((acc, s) => acc + (s.profit < 0 ? Math.abs(s.profit) : 0), 0);
    const totalWaste = wasteLogs.reduce((acc, w) => acc + w.valueLost, 0);

    const grossProfit = totalSalesGain - totalSellingLoss;
    const cogs = totalRevenue - grossProfit;
    const netProfit = totalSalesGain - totalSellingLoss - totalWaste;

    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Formatting
    const rwf = (val: number) => `Rwf ${new Intl.NumberFormat('en-RW').format(val)}`;
    const pct = (val: number) => `${val.toFixed(1)}%`;

    return (
        <div className="space-y-4 md:space-y-8 print:bg-white print:text-black">
            <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm md:text-base">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <PrintButton />
                </div>

                <div className="border-b border-white/10 pb-6 mb-2 md:mb-6 print:border-black">
                    <h1 className="text-xl md:text-3xl font-black mb-2 tracking-tight">Financial Performance Analysis</h1>
                    <p className="text-slate-500 text-[10px] md:text-sm print:text-slate-600 font-medium tracking-wide italic">Report Engine v2.0 • Generated on {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>

                {/* Executive Summary */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 print:grid-cols-5">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 md:p-5 rounded-2xl print:bg-transparent print:border-black shadow-xl">
                        <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase mb-1 tracking-widest">Revenue</p>
                        <p className="text-lg md:text-2xl font-black text-blue-500 print:text-black">{rwf(totalRevenue)}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 md:p-5 rounded-2xl print:bg-transparent print:border-black shadow-xl">
                        <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase mb-1 tracking-widest">COGS</p>
                        <p className="text-lg md:text-2xl font-black text-slate-400 print:text-black">{rwf(cogs)}</p>
                    </div>
                    <div className="bg-orange-500/5 backdrop-blur-xl border border-orange-500/10 p-4 md:p-5 rounded-2xl print:bg-transparent print:border-black shadow-xl">
                        <p className="text-orange-500/60 text-[9px] md:text-[10px] font-bold uppercase mb-1 tracking-widest">Waste</p>
                        <p className="text-lg md:text-2xl font-black text-orange-400 print:text-black">{rwf(totalWaste)}</p>
                    </div>
                    <div className="bg-red-500/5 backdrop-blur-xl border border-red-500/10 p-4 md:p-5 rounded-2xl print:bg-transparent print:border-black shadow-xl">
                        <p className="text-red-500/60 text-[9px] md:text-[10px] font-bold uppercase mb-1 tracking-widest">Sell Loss</p>
                        <p className="text-lg md:text-2xl font-black text-red-500 print:text-black">{rwf(totalSellingLoss)}</p>
                    </div>
                    <div className={`${netProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'} backdrop-blur-xl border p-4 md:p-5 rounded-2xl print:bg-transparent print:border-black shadow-xl col-span-2 md:col-span-1`}>
                        <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase mb-1 tracking-widest">{netProfit >= 0 ? 'Net Gain' : 'Net Deficit'}</p>
                        <p className={`text-xl md:text-2xl font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'} print:text-black tracking-tighter`}>
                            {rwf(Math.abs(netProfit))}
                        </p>
                    </div>
                </div>

                {/* Profit Margin Indicator */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 md:p-8 rounded-2xl md:rounded-3xl print:bg-transparent print:border-black shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <div className="space-y-1">
                            <h3 className="font-black text-lg md:text-xl tracking-tight">Net Profit Margin</h3>
                            <p className="text-[10px] md:text-xs text-slate-500 font-medium">Efficiency of your store in converting revenue into profit.</p>
                        </div>
                        <span className={`text-2xl md:text-4xl font-black ${profitMargin >= 0 ? 'text-blue-500' : 'text-red-500'} tracking-tighter`}>{pct(profitMargin)}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-3 md:h-5 print:hidden p-1 border border-white/10">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)] ${profitMargin < 0 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-600 to-blue-400'}`}
                            style={{ width: `${Math.min(Math.max(profitMargin, 0), 100)}%` }}
                        ></div>
                    </div>
                    {/* Print friendly progress bar alternative */}
                    <div className="hidden print:block border border-black h-4 w-full mt-2">
                        <div
                            className="bg-black h-full"
                            style={{ width: `${Math.min(Math.max(profitMargin, 0), 100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Breakdown Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 print:grid-cols-2">
                    {/* Revenue Breakdown */}
                    <div className="bg-white/5 backdrop-blur-xl p-5 md:p-8 rounded-3xl border border-white/10 shadow-xl">
                        <h3 className="text-lg font-black mb-6 border-b border-white/10 pb-4 print:border-black tracking-tight text-blue-400 uppercase">Input Stream</h3>
                        <table className="w-full text-xs md:text-sm">
                            <tbody className="divide-y divide-white/5 print:divide-slate-300">
                                <tr>
                                    <td className="py-4 text-slate-400 print:text-black font-medium">Gross Sales Revenue</td>
                                    <td className="py-4 text-right font-black text-slate-200">{rwf(totalRevenue)}</td>
                                </tr>
                                <tr>
                                    <td className="py-4 text-slate-400 print:text-black font-medium">Cost of Acquisition (COGS)</td>
                                    <td className="py-4 text-right text-red-500/80 font-mono italic">({rwf(cogs)})</td>
                                </tr>
                                <tr className="bg-white/5 print:bg-slate-100 font-black text-lg">
                                    <td className="py-5 px-3 rounded-l-xl">Gross Profit</td>
                                    <td className="py-5 px-3 text-right rounded-r-xl text-blue-400">{rwf(grossProfit)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Expense Breakdown */}
                    <div className="bg-white/5 backdrop-blur-xl p-5 md:p-8 rounded-3xl border border-white/10 shadow-xl">
                        <h3 className="text-lg font-black mb-6 border-b border-white/10 pb-4 print:border-black tracking-tight text-orange-400 uppercase">Impact Stream</h3>
                        <table className="w-full text-xs md:text-sm">
                            <tbody className="divide-y divide-white/5 print:divide-slate-300">
                                <tr>
                                    <td className="py-4 text-slate-400 print:text-black font-medium text-orange-400/80">Inventory Waste (FEFO/Shrinkage)</td>
                                    <td className="py-4 text-right text-orange-400 font-mono font-bold">{rwf(totalWaste)}</td>
                                </tr>
                                <tr>
                                    <td className="py-4 text-slate-400 print:text-black font-medium text-red-400/80">Selling Losses (Pricing Errors)</td>
                                    <td className="py-4 text-right text-red-500 font-mono font-bold">{rwf(totalSellingLoss)}</td>
                                </tr>
                                <tr>
                                    <td className="py-4 text-slate-400 print:text-black font-medium opacity-40">Operating Expenses</td>
                                    <td className="py-4 text-right text-slate-500 font-mono">-</td>
                                </tr>
                                <tr className="bg-white/5 print:bg-slate-100 font-black text-lg">
                                    <td className="py-5 px-3 rounded-l-xl">Total Impact</td>
                                    <td className="py-5 px-3 text-right rounded-r-xl text-red-500">({rwf(totalWaste + totalSellingLoss)})</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="text-center text-slate-600 text-[10px] mt-12 pb-8 print:block hidden font-medium uppercase tracking-widest border-t border-slate-200 pt-8">
                    SmartMarket Pro Financial Intelligence Unit • Confidential
                </div>
            </div>
        </div>
    );
}
