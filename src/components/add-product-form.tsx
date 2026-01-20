'use client'

import { createProduct } from '@/app/inventory/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { ImageIcon, X, Upload } from 'lucide-react'

export function AddProductForm() {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [imageBase64, setImageBase64] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 2 * 1024 * 1024) { // 2MB limit for base64
            toast.error('Image is too large. Please select an image under 2MB.')
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            setImageBase64(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const removeImage = () => {
        setImageBase64(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    async function handleSubmit(formData: FormData) {
        setIsPending(true)
        if (imageBase64) {
            formData.set('image', imageBase64)
        }

        try {
            const result = await createProduct(formData)
            if (result.success) {
                toast.success(`${result.name} is saved in stock go to inventory to see`)
                router.push('/inventory')
            } else {
                toast.error(result.error || 'Failed to create product')
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6 bg-white/5 backdrop-blur-2xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl">
            {/* Image Upload Section */}
            <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Product Image</label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl p-6 transition hover:border-blue-500/50 group bg-white/5">
                    {imageBase64 ? (
                        <div className="relative w-full max-w-[200px] aspect-square rounded-xl overflow-hidden shadow-2xl">
                            <img src={imageBase64} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-500 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center gap-3 cursor-pointer text-slate-500 group-hover:text-blue-400 transition-colors"
                        >
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-600/10 transition-colors">
                                <Upload size={24} />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-sm">Click to upload image</p>
                                <p className="text-[10px] uppercase tracking-tighter">PNG, JPG up to 2MB</p>
                            </div>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Product Name</label>
                    <input name="name" type="text" placeholder="e.g. Primus Beer" required className="w-full bg-white/5 border border-white/5 rounded-xl p-3 outline-none focus:border-blue-500/50 transition-all font-medium text-white" />
                </div>
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 ml-1">SKU / Barcode</label>
                    <input name="sku" type="text" placeholder="e.g. PR-001" required className="w-full bg-white/5 border border-white/5 rounded-xl p-3 outline-none focus:border-blue-500/50 transition-all font-mono text-sm text-white" />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Cost (Rwf)</label>
                    <input name="costPrice" type="number" step="0.01" required className="w-full bg-white/5 border border-white/5 rounded-xl p-3 outline-none focus:border-blue-500/50 transition-all font-black text-white" />
                </div>
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Sell (Rwf)</label>
                    <input name="sellingPrice" type="number" step="0.01" required className="w-full bg-white/5 border border-white/5 rounded-xl p-3 outline-none focus:border-blue-500/50 transition-all font-black text-blue-400" />
                </div>
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Stock</label>
                    <input name="stockQty" type="number" required className="w-full bg-white/5 border border-white/5 rounded-xl p-3 outline-none focus:border-blue-500/50 transition-all font-black text-white" />
                </div>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-4 rounded-xl font-black text-white transition active:scale-[0.98] shadow-xl shadow-blue-600/20 uppercase tracking-widest neon-blue"
                >
                    {isPending ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Saving Product...</span>
                        </div>
                    ) : 'Save to Inventory'}
                </button>
            </div>
        </form>
    )
}
