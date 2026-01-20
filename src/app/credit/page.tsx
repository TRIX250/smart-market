import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { logCreditSale } from './actions'
import Link from 'next/link'
import { DBErrorView } from '@/components/db-error-view';

export default async function CreditSalePage() {
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
        console.error("Failed to fetch products for credit sale:", error);
        dbError = true;
    }

    if (dbError) {
        return <DBErrorView />;
    }

    return (
        <div className="space-y-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Log Credit Sale</h1>
                        <p className="text-slate-500 text-sm mt-1">Record sales made on credit/debt</p>
                    </div>
                    <Link href="/" className="text-slate-400 hover:text-white transition">
                        ← Back to Dashboard
                    </Link>
                </div>

                <form action={logCreditSale} className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Customer Name</label>
                        <input
                            name="customerName"
                            type="text"
                            required
                            placeholder="Enter customer name"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-pink-500 shadow-inner"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Product</label>
                        <select
                            name="productId"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-pink-500 shadow-inner"
                        >
                            <option value="">Select a product...</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} - {new Intl.NumberFormat('en-RW').format(p.sellingPrice)} Rwf (Stock: {p.stockQty})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Quantity</label>
                        <input
                            name="quantity"
                            type="number"
                            min="1"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-pink-500 shadow-inner"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Expected Payment Date (Optional)</label>
                        <input
                            name="expectedPayDate"
                            type="date"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-pink-500 shadow-inner"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-pink-600 hover:bg-pink-500 py-4 rounded-xl font-bold transition text-white"
                    >
                        Record Credit Sale
                    </button>
                </form>
            </div>
        </div>
    )
}
