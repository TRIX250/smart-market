'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit3, Search, X } from 'lucide-react'
import { DeleteProductButton } from './delete-button'
import { ExportInventoryButton } from '@/components/export-inventory-button'
import { ProductImage } from '@/components/product-image'

export default function InventoryView({ products, isAuthorized }: { products: any[], isAuthorized: boolean }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Inventory Master</h1>
          <p className="text-slate-500 text-xs md:text-sm">Real-time stock tracking and management</p>
        </div>

        {/* SEARCH BAR - MOVED TO HEADER */}
        <div className="relative group w-full md:max-w-[200px]">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 rounded-xl py-2 pl-10 pr-10 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all backdrop-blur-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {isAuthorized && <ExportInventoryButton products={products} />}
          <Link href="/inventory/new" className="flex-1 md:flex-none text-center bg-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-500/20 text-white text-xs md:text-sm uppercase tracking-wider">
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
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p: any) => (
                  <tr key={p.id} className="hover:bg-white/2 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <ProductImage
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-white/5 shrink-0"
                        />
                        <span className="font-medium text-white break-words line-clamp-2 max-w-[100px] md:max-w-none">{p.name}</span>
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
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-20 text-center text-slate-500 italic">
                    <div className="flex flex-col items-center gap-4">
                      <Search className="w-12 h-12 opacity-20" />
                      <p>No products found matching "{searchQuery}"</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
