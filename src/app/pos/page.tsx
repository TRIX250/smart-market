import { prisma } from '@/lib/prisma'
import { auth } from "@clerk/nextjs/server"
import { AutoRefresh } from '@/components/AutoRefresh'
import { DBErrorView } from '@/components/db-error-view';
import POSView from './pos-view';

export default async function POSPage() {
  const { userId } = await auth();
  if (!userId) return null;

  let dbError = false;
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: { userId: userId, stockQty: { gt: 0 } },
      orderBy: { name: 'asc' }
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
      <POSView products={products} />
    </>
  )
}