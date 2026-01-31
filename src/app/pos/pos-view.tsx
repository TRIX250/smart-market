'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import SaleButton from '@/components/SaleButton'
import { ProductImage } from '@/components/product-image'
import { recordSale } from '../inventory/actions'

export default function POSView({ products }: { products: any[] }) {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Point of Sale</h1>
                    <p className="text-slate-500 text-xs md:text-sm">Create and manage transactions</p>
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

                <Link href="/" className="w-full md:w-auto text-center text-slate-400 hover:text-white transition text-xs bg-white/5 px-4 py-2 rounded-lg no-underline uppercase font-bold tracking-widest">
                    ← Dashboard
                </Link>
            </div>

            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => {
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
                                            className="w-12 h-12 rounded-lg object-cover bg-white/5"
                                        />
                                        <div>
                                            <h2 className="text-lg font-bold leading-tight line-clamp-2 text-white">{product.name}</h2>
                                            <p className="text-xs text-slate-500 font-mono mt-0.5">{product.stockQty} in stock</p>
                                        </div>
                                    </div>
                                    {isLowStock && (
                                        <span className="bg-red-500 text-[10px] font-black px-2 py-1 rounded uppercase animate-pulse whitespace-nowrap text-white">
                                            Low Stock
                                        </span>
                                    )}
                                </div>

                                <p className="text-2xl font-black text-blue-400 mt-4 neon-text-blue">
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
            ) : (
                <div className="py-20 text-center text-slate-500 italic bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl">
                    <div className="flex flex-col items-center gap-4">
                        <Search className="w-12 h-12 opacity-20" />
                        <p>No products found matching "{searchQuery}"</p>
                    </div>
                </div>
            )}
        </div>
    )
}
