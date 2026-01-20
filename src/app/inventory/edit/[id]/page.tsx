import { prisma } from '@/lib/prisma'
import { auth } from "@clerk/nextjs/server"
import Link from 'next/link'
import { EditProductForm } from '@/components/edit-product-form'
import { redirect } from 'next/navigation'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) redirect('/');

    const product = await prisma.product.findUnique({
        where: { id },
    });

    if (!product || product.userId !== userId) {
        return (
            <div className="p-8 text-center text-white">
                <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
                <Link href="/inventory" className="text-blue-400 hover:underline">Return to Inventory</Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex justify-between items-center bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">Edit Product</h2>
                    <p className="text-slate-500 text-xs md:text-sm">Modify product details & pricing</p>
                </div>
                <Link href="/inventory" className="text-slate-400 hover:text-white text-xs md:text-sm bg-white/5 px-4 py-2 rounded-xl transition border border-white/5 font-bold">
                    Cancel
                </Link>
            </div>

            <EditProductForm product={product} />
        </div>
    )
}

