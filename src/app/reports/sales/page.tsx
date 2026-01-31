import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import PrintButton from '@/components/print-button';
import Link from 'next/link';
import { ArrowLeft, Calendar, TrendingUp, Coins, BarChart3, History, ChevronDown } from 'lucide-react';
import { ExportSalesButton } from '@/components/export-sales-button';

import { canExport } from '@/lib/auth-utils';
import { DBErrorView } from '@/components/db-error-view';
import { SalesTable } from './sales-table';

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
            take: 5000 // Further increased for comprehensive annual coverage
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

    // PERIODIC CALCULATIONS
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // DAILY EARNINGS (Last 30 Days)
    const getLast30Days = () => {
        const days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);

            const dayTotal = sales.filter(s => {
                const saleDate = new Date(s.createdAt);
                return saleDate >= date && saleDate < nextDay;
            }).reduce((acc, s) => acc + s.totalAmount, 0);

            days.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                fullDate: date,
                total: dayTotal,
                isToday: date.toDateString() === now.toDateString()
            });
        }
        return days;
    };

    const dailyEarnings = getLast30Days();

    // 1. Weekly (Last 7 Days)
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0); // Include the full day from 7 days ago
    const weeklyTotal = sales
        .filter(s => new Date(s.createdAt) >= sevenDaysAgo)
        .reduce((acc, s) => acc + s.totalAmount, 0);

    // 2. Monthly (Current Month)
    const monthlyTotal = sales
        .filter(s => {
            const d = new Date(s.createdAt);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((acc, s) => acc + s.totalAmount, 0);
    const currentMonthName = now.toLocaleString('en-US', { month: 'long' });

    // 3. Yearly (Current Year)
    const yearlyTotal = sales
        .filter(s => new Date(s.createdAt).getFullYear() === currentYear)
        .reduce((acc, s) => acc + s.totalAmount, 0);

    // 4. Milestone Breakdown (Weekly & Monthly)
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Get weeks for THE CURRENT MONTH
    const getWeekTotals = (targetMonth: number, targetYear: number) => {
        const weekRanges = [
            { name: 'Week 1', start: 1, end: 7 },
            { name: 'Week 2', start: 8, end: 14 },
            { name: 'Week 3', start: 15, end: 21 },
            { name: 'Week 4', start: 22, end: 31 }
        ];

        return weekRanges.map(range => {
            const total = sales.filter(s => {
                const d = new Date(s.createdAt);
                return d.getMonth() === targetMonth &&
                    d.getFullYear() === targetYear &&
                    d.getDate() >= range.start &&
                    d.getDate() <= range.end;
            }).reduce((acc, s) => acc + s.totalAmount, 0);

            // A week is "over" if the current date is past its end date OR the month has passed
            const isOver = now.getDate() > range.end || now.getMonth() > targetMonth || now.getFullYear() > targetYear;

            return { ...range, total, isOver };
        });
    };

    const currentMonthWeeks = getWeekTotals(currentMonth, currentYear);

    // HISTORICAL ARCHIVE (Past Months & Weeks)
    const getHistoricalMonths = () => {
        const historicalMonths = [];

        // Get all months that have sales data
        for (let year = 2024; year <= currentYear; year++) {
            const startMonth = year === 2024 ? 0 : 0;
            const endMonth = year === currentYear ? currentMonth - 1 : 11;

            for (let month = startMonth; month <= endMonth; month++) {
                const monthTotal = sales.filter(s => {
                    const d = new Date(s.createdAt);
                    return d.getMonth() === month && d.getFullYear() === year;
                }).reduce((acc, s) => acc + s.totalAmount, 0);

                if (monthTotal > 0) {
                    const monthName = new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' });
                    const weeks = getWeekTotals(month, year);

                    historicalMonths.push({
                        name: monthName,
                        month,
                        year,
                        total: monthTotal,
                        weeks: weeks.filter(w => w.total > 0)
                    });
                }
            }
        }

        return historicalMonths.reverse(); // Most recent first
    };

    const historicalArchive = getHistoricalMonths();

    const monthlyBreakdown = monthNames.map((name, index) => {
        const total = sales
            .filter(s => {
                const d = new Date(s.createdAt);
                return d.getMonth() === index && d.getFullYear() === currentYear;
            })
            .reduce((acc, s) => acc + s.totalAmount, 0);
        const isOver = now.getMonth() > index || now.getFullYear() > currentYear;
        return { name, total, isOver };
    }).filter(m => m.total > 0 || m.name === currentMonthName);

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
                            <h1 className="text-xl md:text-3xl font-bold mb-2 tracking-tight">Financial Milestone Report</h1>
                            <p className="text-slate-500 text-[10px] md:text-sm print:text-slate-600 font-medium">
                                Period Totals & Cycle Analysis
                            </p>
                        </div>
                        <div className="text-left md:text-right bg-blue-500/5 md:bg-transparent p-4 md:p-0 rounded-2xl border border-blue-500/10 md:border-none w-full md:w-auto">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Total Life Revenue</p>
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

                {/* Periodic Performance Panel */}
                <div className="space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 print:hidden">
                        {/* Weekly Card */}
                        <div className="bg-emerald-500/5 backdrop-blur-xl border border-emerald-500/10 p-5 rounded-2xl shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Calendar className="w-12 h-12 text-emerald-500" />
                            </div>
                            <p className="text-emerald-500/60 text-[10px] font-bold uppercase tracking-widest mb-2">Weekly Milestones</p>
                            <div className="space-y-1">
                                {currentMonthWeeks.map(w => (
                                    <div key={w.name} className="flex justify-between items-center text-[10px]">
                                        <span className={w.isOver ? 'text-emerald-400' : 'text-slate-500 italic'}>{w.name} {w.isOver ? '✓' : '(Calculating...)'}</span>
                                        <span className="font-mono text-slate-300">
                                            {w.isOver ? rwf(w.total) : '---'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Monthly Milestone Card */}
                        <div className="bg-purple-500/5 backdrop-blur-xl border border-purple-500/10 p-5 rounded-2xl shadow-xl relative overflow-hidden group h-full">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <TrendingUp className="w-12 h-12 text-purple-500" />
                            </div>
                            <p className="text-purple-400/60 text-[10px] font-bold uppercase tracking-widest mb-2">{currentMonthName} Milestone</p>
                            <p className="text-2xl font-black text-purple-400">
                                {now.getMonth() > currentMonth || now.getFullYear() > currentYear ? rwf(monthlyTotal) : 'In Progress...'}
                            </p>
                            <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-tighter italic">
                                {now.getMonth() > currentMonth || now.getFullYear() > currentYear ? `Finalized earnings for ${currentMonthName}` : `Waiting for ${currentMonthName} cycle to end...`}
                            </p>
                        </div>

                        {/* Yearly Card */}
                        <div className="bg-blue-600/5 backdrop-blur-xl border border-blue-500/10 p-5 rounded-2xl shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Coins className="w-12 h-12 text-blue-500" />
                            </div>
                            <p className="text-blue-400/60 text-[10px] font-bold uppercase tracking-widest mb-2">{currentYear} Annual Income</p>
                            <p className="text-2xl font-black text-blue-400">
                                {now.getFullYear() > currentYear ? rwf(yearlyTotal) : 'Annual Cycle Active'}
                            </p>
                            <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-tighter italic">
                                {now.getFullYear() > currentYear ? `Finalized total for year ${currentYear}` : `Collecting data for 12-month period...`}
                            </p>
                        </div>
                    </div>

                    {/* Milestone Breakdown Tabs */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-3xl shadow-xl print:hidden">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="w-4 h-4 text-slate-400" />
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Monthly Cycle Breakdown ({currentYear})</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {monthlyBreakdown.map((m) => {
                                const isCurrent = m.name === currentMonthName;
                                return (
                                    <div key={m.name} className={`p-3 rounded-xl border transition-all ${isCurrent
                                        ? 'bg-blue-500/10 border-blue-500/30'
                                        : 'bg-white/5 border-white/5 hover:border-white/10'}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">{m.name}</p>
                                            {m.isOver ? (
                                                <span className="text-[7px] bg-emerald-500/20 text-emerald-400 px-1 rounded">CLOSED</span>
                                            ) : (
                                                <span className="text-[7px] bg-blue-500/20 text-blue-400 px-1 rounded animate-pulse">ACTIVE</span>
                                            )}
                                        </div>
                                        <p className={`text-xs font-black ${isCurrent ? 'text-blue-400' : (m.isOver ? 'text-slate-200' : 'text-slate-500')}`}>
                                            {m.isOver ? rwf(m.total) : '---'}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Daily Earnings Timeline */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-3xl shadow-xl print:hidden">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Daily Earnings (Last 30 Days)</h3>
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {dailyEarnings.map((day) => (
                                <div key={day.date} className={`flex items-center justify-between p-2 rounded-lg transition-all ${day.isToday ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-white/5 hover:bg-white/10'
                                    }`}>
                                    <div className="flex items-center gap-3 flex-1">
                                        <span className={`text-[9px] font-black uppercase tracking-wider ${day.isToday ? 'text-blue-400' : 'text-slate-500'
                                            }`}>{day.date}</span>
                                        <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-full ${day.isToday ? 'bg-blue-500' : 'bg-emerald-500'} transition-all`}
                                                style={{ width: `${Math.min((day.total / Math.max(...dailyEarnings.map(d => d.total))) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className={`text-xs font-black font-mono ${day.isToday ? 'text-blue-400' : 'text-slate-300'
                                        }`}>{rwf(day.total)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Historical Archive */}
                    {historicalArchive.length > 0 && (
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-3xl shadow-xl print:hidden">
                            <div className="flex items-center gap-2 mb-4">
                                <History className="w-4 h-4 text-slate-400" />
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                    Historical Archive ({historicalArchive.length} {historicalArchive.length === 1 ? 'Month' : 'Months'} Saved)
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {historicalArchive.map((archive) => (
                                    <details key={archive.name} className="group bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                                        <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                                            <div className="flex items-center gap-3">
                                                <ChevronDown className="w-3 h-3 text-slate-400 group-open:rotate-180 transition-transform" />
                                                <span className="text-xs font-black text-slate-200">{archive.name}</span>
                                                <span className="text-[7px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase font-black">
                                                    ARCHIVED
                                                </span>
                                            </div>
                                            <span className="text-sm font-black text-purple-400">{rwf(archive.total)}</span>
                                        </summary>
                                        <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3 mt-2">
                                            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-2">Weekly Breakdown:</p>
                                            {archive.weeks.map((week) => (
                                                <div key={week.name} className="flex justify-between items-center text-[10px] bg-white/5 p-2 rounded">
                                                    <span className="text-slate-400">{week.name} (Day {week.start}-{week.end})</span>
                                                    <span className="font-mono text-emerald-400">{rwf(week.total)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sales Table Container */}
                <SalesTable sales={sales} />
            </div>
        </div>
    );
}

