import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { auth } from "@clerk/nextjs/server"
import { Edit3 } from 'lucide-react'
import { DeleteProductButton } from './delete-button'
import { ExportInventoryButton } from '@/components/export-inventory-button'
import { ProductImage } from '@/components/product-image'

import { canExport } from '@/lib/auth-utils';
import { DBErrorView } from '@/components/db-error-view';

export default async function InventoryPage() {
  const { userId } = await auth();
  const isAuthorized = await canExport();

  let products: any[] = [];
  let dbError = false;
  try {
    products = await prisma.product.findMany({
      where: { userId: userId || "" },
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    dbError = true;
  }
  if (dbError) {
    return <DBErrorView />;
  }
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Inventory Master</h1>
          <p className="text-slate-500 text-sm">Real-time stock tracking and management</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {isAuthorized && <ExportInventoryButton products={products} />}
          <Link href="/inventory/new" className="flex-1 md:flex-none text-center bg-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-500/20">
            + Add Product
          </Link>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto no-scrollbar md:overflow-visible">
          <table className="w-full text-left lg:min-w-0">
            <thead className="bg-white/5 text-slate-300 text-[10px] uppercase font-bold tracking-widest">
              <tr>
                <th className="p-5">Product Name</th>
                <th className="hidden md:table-cell p-5">SKU</th>
                <th className="p-5 text-center">In Stock</th>
                <th className="p-5 text-right">Price & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-white/2 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <ProductImage
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-white/5 shrink-0"
                      />
                      <span className="font-medium break-words line-clamp-2 max-w-[100px] md:max-w-none">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-5 font-mono text-slate-500 text-xs">{p.sku}</td>
                  <td className="p-5 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold 
                      ${p.stockQty <= 0 ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                        p.stockQty <= 5 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                          'bg-blue-500/10 text-blue-400'}`}>
                      {p.stockQty <= 0 ? 'Out of Stock' : p.stockQty}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-end gap-6">
                      <span className="font-mono font-black text-sm text-slate-200">
                        Rwf {p.sellingPrice.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                        <Link href={`/inventory/edit/${p.id}`} className="text-slate-500 hover:text-blue-400 transition-colors">
                          <Edit3 size={18} />
                        </Link>
                        <DeleteProductButton product={p} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}