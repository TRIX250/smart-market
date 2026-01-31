import { prisma } from '@/lib/prisma'
import { auth } from "@clerk/nextjs/server"
import { canExport } from '@/lib/auth-utils';
import { DBErrorView } from '@/components/db-error-view';
import InventoryView from './inventory-view';

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
    <InventoryView products={products} isAuthorized={isAuthorized} />
  )
}