'use client'

import { Trash2 } from 'lucide-react'
import { deleteProduct, restoreProduct } from './actions'
import { useTransition } from 'react'
import { toast } from 'sonner'

export function DeleteProductButton({ product }: { product: any }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProduct(product.id)

      if (result.success && result.deletedProduct) {
        toast.success(`${result.deletedProduct.name} deleted`, {
          description: "The product has been removed from inventory.",
          action: {
            label: "Undo",
            onClick: () => {
              startTransition(async () => {
                const undoResult = await restoreProduct(result.deletedProduct)
                if (undoResult.success) {
                  toast.success(`${result.deletedProduct.name} restored!`)
                } else {
                  toast.error("Failed to restore item.")
                }
              })
            },
          },
        })
      } else {
        toast.error("Could not delete item.")
      }
    })
  }

  return (
    <button
      disabled={isPending}
      onClick={handleDelete}
      className="text-slate-500 hover:text-red-500 transition-colors disabled:opacity-50"
      title="Delete Product"
    >
      <Trash2 size={18} className={isPending ? "animate-pulse" : ""} />
    </button>
  )
}