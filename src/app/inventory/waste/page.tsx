import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { logWaste } from '../actions'
import Link from 'next/link'
import { DBErrorView } from '@/components/db-error-view';

export default async function WastePage() {
  const { userId } = await auth()
  if (!userId) return <div>Please sign in</div>

  let dbError = false;
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: { userId },
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    console.error("Failed to fetch products for waste logging:", error);
    dbError = true;
  }

  if (dbError) {
    return <DBErrorView />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-orange-500">Log Waste / Shrinkage</h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Track damaged, expired, or lost inventory</p>
        </div>
        <Link href="/inventory" className="text-slate-400 hover:text-white text-xs md:text-sm bg-white/5 px-4 py-2 rounded-xl transition border border-white/5 font-bold">
          Cancel
        </Link>
      </div>

      <form action={logWaste} className="bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Product</label>
          <select
            name="productId"
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all appearance-none"
          >
            <option value="">Select a product...</option>
            {products.map(p => (
              <option key={p.id} value={p.id} className="bg-slate-900">
                {p.name} (Stock: {p.stockQty})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Quantity Lost</label>
            <input
              name="quantity"
              type="number"
              min="1"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Reason</label>
            <select
              name="reason"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all appearance-none"
            >
              <option value="SPOILAGE" className="bg-slate-900">Spoilage / Expired</option>
              <option value="DAMAGE" className="bg-slate-900">Damage</option>
              <option value="THEFT" className="bg-slate-900">Theft</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-500 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-orange-500/20 active:scale-[0.98]"
        >
          Log Waste Entry
        </button>
      </form>
    </div>
  )
}