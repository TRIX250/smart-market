'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from "@clerk/nextjs/server"
import { redirect } from 'next/navigation'
import { checkAccess } from '../subscription/actions'

async function getAuth() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized: Please sign in to continue.");

    // Check Subscription
    const access = await checkAccess();
    if (!access.isValid) {
        throw new Error("Subscription Required: Please pay to continue.");
    }

    return userId;
}

// Log a new credit sale
export async function logCreditSale(formData: FormData) {
    const userId = await getAuth();
    const productId = formData.get('productId') as string;
    const customerName = formData.get('customerName') as string;
    const quantity = parseInt(formData.get('quantity') as string);
    const expectedPayDateStr = formData.get('expectedPayDate') as string;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.userId !== userId) return;

    const totalAmount = product.sellingPrice * quantity;
    const expectedPayDate = expectedPayDateStr ? new Date(expectedPayDateStr) : null;

    await prisma.$transaction([
        prisma.creditSale.create({
            data: {
                userId,
                productId,
                customerName,
                quantity,
                totalAmount,
                expectedPayDate,
                status: 'UNPAID'
            }
        }),
        prisma.product.update({
            where: { id: productId },
            data: { stockQty: { decrement: quantity } }
        })
    ]);

    revalidatePath('/');
    revalidatePath('/credit');
    redirect('/');
}

// Mark a credit sale as paid
export async function markCreditPaid(creditSaleId: string) {
    const userId = await getAuth();
    try {
        // 1. Fetch the credit sale to get amounts and product cost
        const creditSale = await prisma.creditSale.findUnique({
            where: { id: creditSaleId },
            include: { product: true }
        });

        if (!creditSale || creditSale.userId !== userId) throw new Error("Credit sale not found");

        if (creditSale.status === 'PAID') return { success: true }; // Already paid

        // 2. Calculate profit based on ORIGINAL cost at time of sale (approx) or current cost
        // Since we didn't store cost at time of credit, we use current product cost.
        // Profit = Total Sold Amount - (Cost * Qty)
        const costPrice = creditSale.product?.costPrice || 0;
        const profit = creditSale.totalAmount - (costPrice * creditSale.quantity);

        // 3. Transaction: Create Sale + Mark Credit as Paid
        // IMPORTANT: We do NOT decrement stock here, because it was decremented when Credit Sale was created.
        await prisma.$transaction([
            // Create the Sale record so it shows up in Dashboard Revenue/Profit
            prisma.sale.create({
                data: {
                    userId,
                    productId: creditSale.productId,
                    quantity: creditSale.quantity,
                    totalAmount: creditSale.totalAmount,
                    profit: profit,
                    paymentMethod: 'CREDIT_PAYMENT',
                    status: 'COMPLETED'
                }
            }),
            // Update the Credit Sale status
            prisma.creditSale.update({
                where: { id: creditSaleId },
                data: {
                    status: 'PAID',
                    paidDate: new Date()
                }
            })
        ]);

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Mark Paid Error:", error);
        return { success: false };
    }
}
