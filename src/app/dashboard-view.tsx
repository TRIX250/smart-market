'use client'
import { useState } from 'react'
import { confirmSale, deleteSale } from './inventory/actions'
import { Trash2, AlertTriangle, X } from 'lucide-react'
import Link from 'next/link'
import { UserButton } from "@clerk/nextjs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { DBErrorView } from '@/components/db-error-view';

export default function DashboardView({ userId, data = {} }: any) {
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Database Connection Guard
  if (data.dbError) {
    return <DBErrorView />;
  }

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

  // Safe extraction with fallbacks
  const salesToday = data.salesToday || [];
  const revenue = data.revenue || 0;
  const profit = data.profit || 0;
  const expenses = data.expenses || 0;
  const inventoryValue = data.inventoryValue || 0;
  const wasteLogsToday = data.wasteLogsToday || [];
  const creditSales = data.creditSales || [];
  const sellingLoss = data.sellingLoss || 0;

  // Formatting as Rwf
  const rwf = (val: number) => `Rwf ${new Intl.NumberFormat('en-RW').format(val)}`;

  const plData = [
    { name: 'Revenue', amount: revenue, fill: '#3b82f6' },
    { name: 'Expenses', amount: expenses, fill: '#ef4444' },
    { name: profit >= 0 ? 'Net Profit' : 'Net Loss', amount: profit, fill: profit >= 0 ? '#10b981' : '#f43f5e' },
  ];

  const chartData = salesToday.map((s: any) => ({
    time: new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    total: s.totalAmount
  }));



  // Calculate total waste value
  const totalWasteValue = wasteLogsToday.reduce((acc: number, w: any) => acc + w.valueLost, 0);

  // Calculate total unpaid debt
  const totalUnpaidDebt = creditSales.reduce((acc: number, c: any) => acc + c.totalAmount, 0);

  const lossySales = salesToday.filter((s: any) => s.profit < 0);

  // Calculate Gross Profit (Net Profit + Expenses)
  const grossProfit = profit + expenses;
  // Determine alert level
  const isExpenseCritical = grossProfit > 0 && expenses > grossProfit; // Red LOSS badge
  const isExpenseWarning = grossProfit > 0 && expenses > (grossProfit * 0.5) && !isExpenseCritical; // Yellow ALERT badge

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">SmartMarket Pro Analytics</h1>
          <p className="text-slate-500 text-sm">Real-time business intelligence</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Link href="/pos" className="w-full md:w-auto text-center bg-blue-600 px-6 py-2 rounded-xl font-bold hover:bg-blue-500 transition text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] uppercase tracking-widest text-xs flex items-center justify-center gap-2 neon-blue">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Sign In to POS
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-xl">
          <p className="text-slate-300 text-xs md:text-sm font-bold mb-1 uppercase tracking-widest">Income</p>
          <p className="text-lg md:text-2xl font-black text-blue-400">{rwf(revenue)}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-xl">
          <p className="text-slate-300 text-xs md:text-sm font-bold mb-1 uppercase tracking-widest">Total Expenses</p>
          <p className="text-lg md:text-2xl font-black text-orange-400">{rwf(expenses)}</p>
        </div>
        <div className={`bg-white/5 backdrop-blur-xl p-5 rounded-2xl border shadow-xl ${isExpenseCritical ? 'border-red-500/50 bg-red-500/5' :
          isExpenseWarning ? 'border-yellow-500/50 bg-yellow-500/5' :
            profit < 0 ? 'border-red-500/50 bg-red-500/5' :
              'border-white/10'
          }`}>
          <div className="flex justify-between items-start">
            <p className="text-slate-300 text-xs md:text-sm font-bold mb-1 uppercase tracking-widest">
              {profit >= 0 ? "Net Gain" : "Net Deficit"}
            </p>
            {isExpenseCritical && (
              <span className="text-[9px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded uppercase animate-pulse">LOSS</span>
            )}
            {isExpenseWarning && !isExpenseCritical && (
              <span className="text-[9px] font-black bg-yellow-500 text-black px-1.5 py-0.5 rounded uppercase animate-pulse">Alert</span>
            )}
          </div>
          <p className={`text-lg md:text-2xl font-black ${isExpenseCritical ? 'text-red-500' :
            isExpenseWarning ? 'text-yellow-400' :
              (profit >= 0 ? 'text-green-400' : 'text-red-500')
            }`}>
            {profit < 0 ? '-' : ''}{rwf(Math.abs(profit))}
          </p>
          {isExpenseCritical && (
            <p className="text-[9px] text-red-500/80 font-mono mt-1">Exp &gt; Gross Profit</p>
          )}
          {isExpenseWarning && !isExpenseCritical && (
            <p className="text-[9px] text-yellow-500/80 font-mono mt-1">Exp &gt; 50% GP</p>
          )}
          {isExpenseCritical && (
            <p className="text-[10px] text-orange-400 font-bold mt-2 bg-orange-500/10 px-2 py-1 rounded">
              Revenue Coverage: {rwf(expenses - grossProfit)}
            </p>
          )}
        </div>
        <div className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-xl">
          <p className="text-slate-300 text-xs md:text-sm font-bold uppercase tracking-widest mb-1">Stock Value</p>
          <p className="text-lg md:text-2xl font-black text-purple-400">{rwf(inventoryValue)}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-xl">
          <p className="text-slate-300 text-xs md:text-sm font-bold uppercase tracking-widest mb-1">Waste Loss</p>
          <p className="text-lg md:text-2xl font-black text-orange-400">{rwf(totalWasteValue)}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-xl">
          <p className="text-slate-300 text-xs md:text-sm font-bold uppercase tracking-widest mb-1">Selling Loss</p>
          <p className="text-lg md:text-2xl font-black text-red-500">{rwf(sellingLoss)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div id="analytics" className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl h-[250px] shadow-xl">
          <h3 className="text-lg font-bold mb-6">Financial Overview</h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={plData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }} />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-2xl h-fit overflow-hidden shadow-xl">
          <h2 className="font-bold mb-4">Daily Transaction Stream</h2>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-sm">
              <thead className="text-slate-400 border-b border-white/10 sticky top-0 bg-white/5 backdrop-blur-md">
                <tr>
                  <th className="text-left pb-2">Item</th>
                  <th className="text-left pb-2">Qty</th>
                  <th className="text-left pb-2">Method</th>
                  <th className="text-left pb-2">Date</th>
                  <th className="text-right pb-2">Total</th>
                  <th className="text-right pb-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {salesToday.map((s: any) => (
                  <tr key={s.id}>
                    <td className="py-3 text-slate-300 break-words line-clamp-2 max-w-[120px] md:max-w-none">{s.product?.name}</td>
                    <td className="py-3 text-slate-400 font-mono">{s.quantity}</td>
                    <td className="py-3 text-[10px] opacity-60 uppercase">{s.paymentMethod}</td>
                    <td className="py-3 text-xs text-slate-400">
                      {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 text-right font-mono">{rwf(s.totalAmount)}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setItemToDelete(s.id)}
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
        </div>
      </div>

      {/* CREDIT & DEBT PANEL */}
      <div className="bg-pink-500/5 border border-pink-500/20 p-4 md:p-6 rounded-3xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h3 className="text-lg font-bold text-pink-500 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-pink-500"></span>
            Credit & Debt
          </h3>
          <div className="text-left md:text-right">
            <p className="text-xs text-slate-500">Total Unpaid</p>
            <p className="text-2xl font-black text-pink-400">{rwf(totalUnpaidDebt)}</p>
          </div>
        </div>

        {creditSales.length > 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-sm">
                <thead className="text-slate-400 border-b border-white/10 bg-white/5 backdrop-blur-md">
                  <tr>
                    <th className="text-left p-3">Customer</th>
                    <th className="text-left p-3">Product</th>
                    <th className="hidden sm:table-cell text-left p-3">Sale Date</th>
                    <th className="hidden md:table-cell text-left p-3">Expected Pay</th>
                    <th className="text-right p-3">Amount</th>
                    <th className="text-right p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {creditSales.map((c: any) => (
                    <tr key={c.id}>
                      <td className="p-3 text-slate-300 font-medium break-words max-w-[80px] md:max-w-none">{c.customerName}</td>
                      <td className="p-3 text-slate-400 break-words line-clamp-1 max-w-[100px] md:max-w-none">{c.product?.name}</td>
                      <td className="hidden sm:table-cell p-3 text-xs text-slate-400">
                        {new Date(c.saleDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="hidden md:table-cell p-3 text-xs text-slate-400">
                        {c.expectedPayDate
                          ? new Date(c.expectedPayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : '-'}
                      </td>
                      <td className="p-3 text-right font-mono text-pink-300">{rwf(c.totalAmount)}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={async () => {
                            const { markCreditPaid } = await import('./credit/actions');
                            await markCreditPaid(c.id);
                          }}
                          className="bg-pink-600 hover:bg-pink-500 text-xs px-4 py-2 rounded-lg font-bold transition"
                        >
                          MARK PAID
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-600 italic">No unpaid credit sales.</div>
        )}

        <Link
          href="/credit"
          className="mt-4 block text-center bg-pink-600 hover:bg-pink-500 py-3 rounded-xl font-bold transition text-white"
        >
          + Log New Credit Sale
        </Link>
      </div>

      {/* WASTE/SHRINKAGE PANEL */}
      <div className="bg-orange-500/5 border border-orange-500/20 p-4 md:p-6 rounded-3xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h3 className="text-lg font-bold text-orange-500 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-orange-500"></span>
            Waste & Shrinkage Today
          </h3>
          <div className="text-left md:text-right">
            <p className="text-xs text-slate-500">Total Loss</p>
            <p className="text-2xl font-black text-orange-400">{rwf(totalWasteValue)}</p>
          </div>
        </div>

        {wasteLogsToday.length > 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-sm">
                <thead className="text-slate-400 border-b border-white/10 bg-white/5 backdrop-blur-md">
                  <tr>
                    <th className="text-left p-3">Product</th>
                    <th className="hidden sm:table-cell text-left p-3">Reason</th>
                    <th className="hidden md:table-cell text-left p-3">Date</th>
                    <th className="text-right p-3">Qty</th>
                    <th className="text-right p-3">Loss</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {wasteLogsToday.map((w: any) => (
                    <tr key={w.id}>
                      <td className="p-3 text-slate-300 break-words line-clamp-1 max-w-[120px] md:max-w-none">{w.product?.name}</td>
                      <td className="hidden sm:table-cell p-3">
                        <span className="text-[10px] px-2 py-1 rounded bg-orange-500/20 text-orange-400 uppercase">
                          {w.reason}
                        </span>
                      </td>
                      <td className="hidden md:table-cell p-3 text-xs text-slate-400">
                        {new Date(w.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="p-3 text-right text-orange-300">{w.quantity}</td>
                      <td className="p-3 text-right font-mono text-orange-400">{rwf(w.valueLost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-600 italic">No waste logged today.</div>
        )}

        <Link
          href="/inventory/waste"
          className="mt-4 block text-center bg-orange-600 hover:bg-orange-500 py-3 rounded-xl font-bold transition text-white"
        >
          + Log New Waste Entry
        </Link>
      </div>

      {/* SELLING LOSS PANEL */}
      <div className="bg-red-500/5 border border-red-500/20 p-4 md:p-6 rounded-3xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500"></span>
            Selling Losses (Sold below Cost)
          </h3>
          <div className="text-left md:text-right">
            <p className="text-xs text-slate-500">Value Lost in Sales</p>
            <p className="text-2xl font-black text-red-400">{rwf(sellingLoss)}</p>
          </div>
        </div>

        {lossySales.length > 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-sm">
                <thead className="text-slate-400 border-b border-white/10 bg-white/5 backdrop-blur-md">
                  <tr>
                    <th className="text-left p-3">Product</th>
                    <th className="hidden sm:table-cell text-left p-3">Qty</th>
                    <th className="hidden md:table-cell text-left p-3">Sold Price</th>
                    <th className="hidden md:table-cell text-left p-3 text-red-400">Unit Loss</th>
                    <th className="text-right p-3">Total Loss</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {lossySales.map((s: any) => (
                    <tr key={s.id}>
                      <td className="p-3 text-slate-300 font-medium break-words max-w-[100px] md:max-w-none">{s.product?.name}</td>
                      <td className="hidden sm:table-cell p-3 text-slate-400">{s.quantity}</td>
                      <td className="hidden md:table-cell p-3 text-xs text-slate-400 font-mono">
                        {rwf(s.totalAmount / s.quantity)}
                      </td>
                      <td className="hidden md:table-cell p-3 text-xs text-red-400 font-mono italic">
                        - {rwf(Math.abs(s.profit / s.quantity))}
                      </td>
                      <td className="p-3 text-right font-mono text-red-400">{rwf(Math.abs(s.profit))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-600 italic">No products sold below cost price today.</div>
        )}
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl h-[300px] md:h-fit shadow-xl">
        <h3 className="text-lg font-bold mb-6">Revenue Trend</h3>
        <div className="h-48 md:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Area type="monotone" dataKey="total" stroke="#3b82f6" fillOpacity={0.1} fill="#3b82f6" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MODAL */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
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
    </div>
  );
}