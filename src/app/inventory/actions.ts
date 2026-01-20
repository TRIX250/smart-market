'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from "@clerk/nextjs/server"
import { checkAccess } from '../subscription/actions'
import { v4 as uuidv4 } from 'uuid'
import { ensureCanImport } from '@/lib/auth-utils'

/* ==========================================
   HELPER FUNCTIONS
   ========================================== */

/**
 * Validates user authentication and subscription status
 */
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

/**
 * Retrieves an access token from MTN MoMo
 */
async function getMoMoToken() {
  const authHeader = Buffer.from(`${process.env.MOMO_API_USER}:${process.env.MOMO_API_KEY}`).toString('base64');

  const response = await fetch('https://sandbox.momodeveloper.mtn.com/collection/token/', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Ocp-Apim-Subscription-Key': process.env.MOMO_PRIMARY_KEY!,
    },
  });

  if (!response.ok) throw new Error("Failed to retrieve MoMo token");

  const data = await response.json();
  return data.access_token;
}

/* ==========================================
   SUBSCRIPTION ACTIONS
   ========================================== */

export async function handleSubscription(phoneNumber: string) {
  try {
    const token = await getMoMoToken();
    const transactionId = uuidv4();

    const response = await fetch('https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Reference-Id': transactionId,
        'X-Target-Environment': 'sandbox',
        'Ocp-Apim-Subscription-Key': process.env.MOMO_PRIMARY_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: "5000",
        currency: "EUR", // Sandbox strictly requires 'EUR'
        externalId: "smartmarket_sub",
        payer: {
          partyIdType: "MSISDN",
          partyId: phoneNumber // format: 25078XXXXXXX
        },
        payerMessage: "Subscribe to SmartMarket",
        payeeNote: "Monthly Access Fee"
      }),
    });

    if (response.status === 202) {
      return { success: true, transactionId };
    }
    return { success: false, error: "Payment request rejected by provider" };
  } catch (error) {
    console.error("Subscription Error:", error);
    return { success: false, error: "Internal server error during payment" };
  }
}

/* ==========================================
   INVENTORY & PRODUCT ACTIONS
   ========================================== */

export async function deleteProduct(id: string) {
  const userId = await getAuth();
  try {
    const product = await prisma.product.findUnique({ where: { id: id } });
    if (!product || product.userId !== userId) return { success: false };

    await prisma.product.delete({ where: { id: id } });

    revalidatePath('/inventory');
    revalidatePath('/');
    revalidatePath('/pos');
    return { success: true, deletedProduct: product };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false };
  }
}

export async function restoreProduct(productData: any) {
  const userId = await getAuth();
  try {
    await prisma.product.create({
      data: {
        id: productData.id,
        userId,
        name: productData.name,
        sku: productData.sku,
        costPrice: productData.costPrice,
        sellingPrice: productData.sellingPrice,
        stockQty: productData.stockQty,
        category: productData.category || 'General',
        image: productData.image || null,
        supplierId: productData.supplierId || null,
        createdAt: productData.createdAt,
        updatedAt: new Date()
      }
    });

    revalidatePath('/inventory');
    revalidatePath('/');
    revalidatePath('/pos');
    return { success: true };
  } catch (error) {
    console.error("Restore Error:", error);
    return { success: false };
  }
}

export async function createProduct(formData: FormData) {
  const userId = await getAuth();
  try {
    const name = formData.get('name') as string;
    const image = formData.get('image') as string;

    // Placeholder image URL - using a generic placeholder service or local asset
    const defaultImage = "https://placehold.co/600x400/1e293b/ffffff?text=No+Image";

    // Validate string length for TEXT column (approx 64KB safety limit for non-TEXT types, though TEXT is unlimited in Postgres, Prisma might have limits or we want to be safe)
    // Actually, String in Prisma/Postgres is TEXT which is 1GB. But if using a VARCHAR limit...
    // The user asked to alert if imageUrl is too long.
    // Validate string length for TEXT column
    // The user wants to support images up to 2MB. 
    // Base64 is ~33% larger, so 2MB * 1.33 = ~2.7MB. Let's set limit to 3MB.
    if (image && image.length > 3000000) {
      throw new Error("Image file is too large. Please use a smaller image (under 2MB).");
    }

    await prisma.product.create({
      data: {
        userId,
        name: name,
        sku: formData.get('sku') as string,
        costPrice: Number(formData.get('costPrice')),
        sellingPrice: Number(formData.get('sellingPrice')),
        stockQty: Number(formData.get('stockQty')),
        category: (formData.get('category') as string) || 'General',
        image: image && image.length > 0 ? image : defaultImage
      }
    });
    revalidatePath('/inventory');
    revalidatePath('/');
    revalidatePath('/pos');
    return { success: true, name };
  } catch (error: any) {
    console.error("Create Product Error:", error);
    // Explicitly check for DB connection error to help user
    if (error.message?.includes("Can't reach database server")) {
      return { success: false, error: "Database offline. Run 'sudo pg_ctlcluster 18 main start' in terminal." };
    }
    return { success: false, error: error.message || "Failed to create product" };
  }
}

export async function recordSale(productId: string, quantity: number, paymentMethod: string, customPrice?: number) {
  const userId = await getAuth();
  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product || product.userId !== userId) throw new Error("Access Denied");

  if (product.stockQty < quantity) {
    throw new Error(`Insufficient stock. Available: ${product.stockQty}`);
  }

  const status = (paymentMethod === 'MOBILE_MONEY' || paymentMethod === 'MOMO') ? 'PENDING' : 'COMPLETED';

  await prisma.$transaction([
    prisma.sale.create({
      data: {
        userId,
        productId,
        quantity,
        totalAmount: (customPrice || product.sellingPrice) * quantity,
        profit: ((customPrice || product.sellingPrice) - product.costPrice) * quantity,
        paymentMethod,
        status: status
      }
    }),
    prisma.product.update({
      where: { id: productId },
      data: { stockQty: { decrement: quantity } }
    })
  ]);

  revalidatePath('/pos');
  revalidatePath('/');
  return { success: true, name: product.name, count: quantity };
}

export async function confirmSale(saleId: string) {
  const userId = await getAuth();
  try {
    await prisma.sale.updateMany({
      where: { id: saleId, userId },
      data: { status: 'COMPLETED' }
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function logWaste(formData: FormData) {
  const userId = await getAuth();
  const productId = formData.get('productId') as string;
  const quantity = parseInt(formData.get('quantity') as string);
  const reason = formData.get('reason') as string;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.userId !== userId) return;

  await prisma.wasteLog.create({
    data: { userId, productId, quantity, reason, valueLost: product.costPrice * quantity }
  });

  await prisma.product.update({
    where: { id: productId },
    data: { stockQty: { decrement: quantity } }
  });

  revalidatePath('/inventory/waste');
  revalidatePath('/');
}

export async function updateProduct(formData: FormData) {
  const userId = await getAuth();
  const id = formData.get('id') as string;

  if (!id) throw new Error("Product ID is required for update.");

  try {
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct || existingProduct.userId !== userId) {
      throw new Error("Product not found or unauthorized.");
    }

    await prisma.product.update({
      where: { id },
      data: {
        name: formData.get('name') as string,
        sku: formData.get('sku') as string,
        costPrice: parseFloat(formData.get('costPrice') as string),
        sellingPrice: parseFloat(formData.get('sellingPrice') as string),
        stockQty: parseInt(formData.get('stockQty') as string),
        category: (formData.get('category') as string) || 'General',
        image: formData.get('image') as string || undefined
      }
    });

    revalidatePath('/inventory');
    revalidatePath('/');
  } catch (error) {
    console.error("Update Error:", error);
    throw error;
  }
}

export async function bulkImportProducts(products: any[]) {
  const userId = await getAuth();
  await ensureCanImport();

  try {
    const validatedProducts = products.filter(p => {
      const name = p.name || p.Name;
      const costPrice = parseFloat(p.costPrice || p['Cost Price'] || 0);
      const sellingPrice = parseFloat(p.sellingPrice || p['Selling Price'] || 0);
      const stockQty = parseInt(p.stockQty || p['Stock Qty'] || 0);
      return name && costPrice >= 0 && sellingPrice >= 0 && stockQty >= 0;
    }).map(p => ({
      userId,
      name: p.name || p.Name,
      sku: (p.sku || p.SKU) || `SKU-${Math.random().toString(36).substring(7).toUpperCase()}`,
      costPrice: parseFloat(p.costPrice || p['Cost Price'] || 0),
      sellingPrice: parseFloat(p.sellingPrice || p['Selling Price'] || 0),
      stockQty: parseInt(p.stockQty || p['Stock Qty'] || 0),
      category: p.category || p.Category || 'General'
    }));

    if (validatedProducts.length === 0) {
      return { success: false, error: "No valid products found to import." };
    }

    const result = await prisma.product.createMany({
      data: validatedProducts,
      skipDuplicates: true
    });

    revalidatePath('/inventory');
    revalidatePath('/');
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Bulk Import Error:", error);
    return { success: false, error: "Failed to import products. Check your file format." };
  }
}