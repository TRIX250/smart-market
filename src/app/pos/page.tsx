import { prisma } from '@/lib/prisma'
import { recordSale } from '../inventory/actions'
import { auth } from "@clerk/nextjs/server"
import Link from 'next/link'
import SaleButton from '@/components/SaleButton'
import { AutoRefresh } from '@/components/AutoRefresh'
import { ProductImage } from '@/components/product-image'
import { DBErrorView } from '@/components/db-error-view';

export default async function POSPage() {
  const { userId } = await auth();
  if (!userId) return null;

  let dbError = false;
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: { userId: userId, stockQty: { gt: 0 } }
    });
  } catch (error) {
    console.error("Failed to fetch POS products:", error);
    dbError = true;
  }

  if (dbError) {
    return <DBErrorView />;
  }

  return (
    <>
      <AutoRefresh interval={15000} />
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Point of Sale</h1>
            <p className="text-slate-500 text-sm">Create and manage transactions</p>
          </div>
          <Link href="/" className="text-slate-400 hover:text-white transition text-sm bg-white/5 px-4 py-2 rounded-lg">← Back to Dashboard</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const isLowStock = product.stockQty <= 5;

            return (
              <div
                key={product.id}
                className={`bg-white/5 backdrop-blur-2xl p-6 rounded-[2rem] border transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 ${isLowStock ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-white/10 shadow-xl'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <ProductImage
                      src={product.image}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover bg-white/5"
                    />
                    <div>
                      <h2 className="text-lg md:text-xl font-bold leading-tight line-clamp-2">{product.name}</h2>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{product.stockQty} in stock</p>
                    </div>
                  </div>
                  {isLowStock && (
                    <span className="bg-red-500 text-[10px] font-black px-2 py-1 rounded uppercase animate-pulse whitespace-nowrap">
                      Low Stock
                    </span>
                  )}
                </div>

                <p className="text-2xl font-black text-blue-400 mt-2 neon-text-blue">
                  Rwf {product.sellingPrice.toLocaleString()}
                </p>

                <SaleButton
                  productId={product.id}
                  productName={product.name}
                  sellingPrice={product.sellingPrice}
                  maxQty={product.stockQty}
                  recordSale={recordSale}
                />
              </div>
            );
          })}
        </div>
      </div>
    </>
  )
}