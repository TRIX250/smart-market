import { auth } from "@clerk/nextjs/server";
import { prisma } from '@/lib/prisma'
import DashboardView from "../dashboard-view";
import { AutoRefresh } from '@/components/AutoRefresh';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/');
    }

    // Fetch sales, products, waste logs, credit sales, and expenses in parallel
    let dashboardData;
    try {
        const [salesToday, products, wasteLogsToday, creditSales, expensesToday] = await prisma.$transaction([
            prisma.sale.findMany({
                where: {
                    userId,
                    createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
                },
                include: { product: true },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.product.findMany({ where: { userId } }),
            prisma.wasteLog.findMany({
                where: {
                    userId,
                    createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
                },
                include: { product: true },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.creditSale.findMany({
                where: {
                    userId,
                    status: 'UNPAID'
                },
                include: { product: true },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.expense.findMany({
                where: {
                    userId,
                    createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
                }
            })
        ]);

        // CALCULATIONS for the Dashboard metrics
        const completedSales = salesToday.filter(s => s.status === 'COMPLETED');
        const revenue = completedSales.reduce((acc, s) => acc + s.totalAmount, 0);
        const totalGrossProfit = completedSales.reduce((acc, s) => acc + (s.profit > 0 ? s.profit : 0), 0);
        const totalSellingLoss = completedSales.reduce((acc, s) => acc + (s.profit < 0 ? Math.abs(s.profit) : 0), 0);
        const totalExpenses = (expensesToday as any[]).reduce((acc: number, e: any) => acc + e.amount, 0);
        const totalStockValue = products.reduce((acc, p) => acc + (Math.max(0, p.stockQty) * p.costPrice), 0);

        dashboardData = {
            salesToday,
            revenue,
            profit: (totalGrossProfit - totalSellingLoss) - totalExpenses,
            netProfit: totalGrossProfit,
            sellingLoss: totalSellingLoss,
            expenses: totalExpenses,
            inventoryValue: totalStockValue,
            wasteLogsToday,
            creditSales
        };
    } catch (error) {
        console.error("Dashboard data fetch failed:", error);
        dashboardData = {
            salesToday: [],
            revenue: 0,
            profit: 0,
            netProfit: 0,
            sellingLoss: 0,
            expenses: 0,
            inventoryValue: 0,
            wasteLogsToday: [],
            creditSales: [],
            dbError: true
        };
    }

    return (
        <>
            <AutoRefresh interval={30000} />
            <DashboardView userId={userId} data={dashboardData} />
        </>
    );
}
