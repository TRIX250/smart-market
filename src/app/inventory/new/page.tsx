import Link from 'next/link'
import { AddProductForm } from '@/components/add-product-form'

export default function NewProductPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Add New Product</h2>
          <p className="text-slate-500 text-xs md:text-sm">Register a new item to your stock</p>
        </div>
        <Link href="/inventory" className="text-slate-400 hover:text-white text-xs md:text-sm bg-white/5 px-4 py-2 rounded-xl transition border border-white/5 font-bold">
          Cancel
        </Link>
      </div>

      <AddProductForm />
    </div>
  )
}