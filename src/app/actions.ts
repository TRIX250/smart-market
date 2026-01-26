'use server'

import { auth, currentUser, createClerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// Hard-coded Admin List
const ADMIN_EMAILS = ['ishimwet822@gmail.com', 'mwisenezanadjim0@gmail.com'];
const ADMIN_USERNAMES = ['trick_market', 'nadjim_12'];

async function getSafeUser() {
    try {
        return await currentUser()
    } catch (error) {
        console.error("Clerk API Error:", error)
        return null
    }
}

export async function isUserAdmin(user: { emailAddresses?: { emailAddress: string }[], username?: string | null } | null) {
    if (!user) return false;
    const email = user.emailAddresses?.[0]?.emailAddress?.toLowerCase();
    const username = user.username?.toLowerCase();

    return (
        (!!email && ADMIN_EMAILS.includes(email)) ||
        (!!username && ADMIN_USERNAMES.includes(username))
    );
}

export async function submitPayment(formData: FormData) {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const transactionId = formData.get('transactionId') as string
    const file = formData.get('screenshot') as File

    if (!transactionId || transactionId.trim().length < 5) {
        return { success: false, message: 'Please enter a valid Transaction ID' }
    }

    try {
        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), 'public/uploads')
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (e) {
            // ignore
        }

        const existing = await prisma.paymentRequest.findUnique({
            where: { transactionId }
        })

        if (existing) {
            if (existing.status === 'APPROVED') {
                return { success: true, message: 'Already approved.' }
            }
            return { success: false, message: 'This Transaction ID is already pending verification.' }
        }

        let screenshotUrl = null
        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer())
            const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`
            const filepath = path.join(uploadDir, filename)
            await writeFile(filepath, buffer)
            screenshotUrl = `/uploads/${filename}`
        }

        const user = await getSafeUser()
        const userEmail = user?.emailAddresses[0]?.emailAddress || null

        await prisma.paymentRequest.create({
            data: {
                userId,
                userEmail,
                transactionId,
                screenshotUrl,
                status: 'PENDING',
                amount: 7000
            }
        })

        revalidatePath('/subscribe')
        return { success: true }
    } catch (error) {
        console.error('Payment request error:', error)
        return { success: false, message: 'Failed to submit request.' }
    }
}

export async function approvePayment(paymentRequestId: string) {
    const user = await getSafeUser()
    const isAdmin = await isUserAdmin(user)
    if (!isAdmin) throw new Error('Unauthorized Action: Only Trick can do this.')

    const request = await prisma.paymentRequest.findUnique({
        where: { id: paymentRequestId }
    })

    if (!request) throw new Error('Payment request not found')

    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 30)

    // 1. Update/Create Subscription
    await prisma.subscription.upsert({
        where: { userId: request.userId },
        update: {
            isSubscribed: true,
            planStatus: 'ACTIVE',
            expiryDate: expiryDate,
        },
        create: {
            userId: request.userId,
            isSubscribed: true,
            planStatus: 'ACTIVE',
            expiryDate: expiryDate,
        }
    })

    // 2. Update Clerk Metadata
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    await clerk.users.updateUserMetadata(request.userId, {
        publicMetadata: {
            isSubscribed: true,
            planStatus: 'ACTIVE',
            expiryDate: expiryDate.toISOString()
        }
    })

    // 3. Update the request status
    await prisma.paymentRequest.update({
        where: { id: paymentRequestId },
        data: { status: 'APPROVED' }
    })

    // 4. Send notification
    try {
        await prisma.notification.create({
            data: {
                userId: request.userId,
                title: 'Subscription Approved!',
                message: 'Your payment was verified. You now have PRO access for 30 days.',
                isRead: false
            }
        })
    } catch (e) {
        console.error("Failed to send notification", e)
    }

    revalidatePath('/admin/approvals')
    revalidatePath('/admin/users')
    revalidatePath('/')
    revalidatePath('/pos'); // Added based on instruction
    return { success: true } // Kept original return, 'name' was not defined
}

export async function manualUnlock(userId: string) {
    const user = await getSafeUser()
    const isAdmin = await isUserAdmin(user)
    if (!isAdmin) throw new Error('Unauthorized Action')

    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 30)

    // 1. Update/Create Subscription
    await prisma.subscription.upsert({
        where: { userId },
        update: {
            isSubscribed: true,
            planStatus: 'ACTIVE',
            expiryDate: expiryDate,
        },
        create: {
            userId: userId,
            isSubscribed: true,
            planStatus: 'ACTIVE',
            expiryDate: expiryDate,
        }
    })

    // 2. Update Clerk Metadata
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    await clerk.users.updateUserMetadata(userId, {
        publicMetadata: {
            isSubscribed: true,
            planStatus: 'ACTIVE',
            expiryDate: expiryDate.toISOString()
        }
    })

    // 3. Send notification
    try {
        await prisma.notification.create({
            data: {
                userId,
                title: 'Premium Unlocked!',
                message: 'An administrator has manually activated your PRO access. Enjoy!',
                isRead: false
            }
        })
    } catch (e) {
        console.error("Failed to send notification", e)
    }

    revalidatePath('/admin/users')
    revalidatePath('/')
    return { success: true }
}

export async function approveUser(id: string) {
    return approvePayment(id)
}

export async function rejectPayment(paymentRequestId: string) {
    const user = await getSafeUser()
    const isAdmin = await isUserAdmin(user)
    if (!isAdmin) throw new Error('Unauthorized Action')

    const request = await prisma.paymentRequest.findUnique({
        where: { id: paymentRequestId }
    })

    if (!request) throw new Error('Payment request not found')

    await prisma.paymentRequest.update({
        where: { id: paymentRequestId },
        data: { status: 'REJECTED' }
    })

    // Send notification
    try {
        await prisma.notification.create({
            data: {
                userId: request.userId,
                title: 'Payment Rejected',
                message: 'Your payment request was rejected. Please ensure you submitted a valid Transaction ID.',
                isRead: false
            }
        })
    } catch (e) {
        console.error("Failed to send notification", e)
    }

    revalidatePath('/admin/approvals')
    return { success: true }
}

export async function rejectRequest(id: string) {
    return rejectPayment(id)
}

export async function getPendingPayments() {
    try {
        const user = await getSafeUser()
        const isAdmin = await isUserAdmin(user)
        if (!isAdmin) throw new Error('Unauthorized')

        return await prisma.paymentRequest.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'desc' }
        })
    } catch (error) {
        console.error("Failed to fetch pending payments:", error);
        return [];
    }
}

export async function getPendingCount() {
    try {
        const user = await getSafeUser()
        const isAdmin = await isUserAdmin(user)
        if (!isAdmin) return 0

        return await prisma.paymentRequest.count({
            where: { status: 'PENDING' }
        })
    } catch (error) {
        console.error("Failed to get pending count:", error);
        return 0;
    }
}

export async function getAdminStats() {
    try {
        const user = await getSafeUser()
        const isAdmin = await isUserAdmin(user)
        if (!isAdmin) throw new Error('Unauthorized')

        const totalUsers = await prisma.subscription.count()
        const activePro = await prisma.subscription.count({
            where: {
                planStatus: 'ACTIVE',
                expiryDate: { gt: new Date() }
            }
        })
        const pendingApprovals = await prisma.paymentRequest.count({
            where: { status: 'PENDING' }
        })

        // Total revenue from approved payments
        const approvedPayments = await prisma.paymentRequest.findMany({
            where: { status: 'APPROVED' },
            select: { amount: true }
        })
        const totalRevenue = approvedPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0)

        return {
            totalUsers,
            activePro,
            pendingApprovals,
            totalRevenue
        }
    } catch (error) {
        console.error("Failed to get admin stats:", error);
        return {
            totalUsers: 0,
            activePro: 0,
            pendingApprovals: 0,
            totalRevenue: 0
        }
    }
}

export async function getAllUsers() {
    try {
        const user = await getSafeUser()
        const isAdmin = await isUserAdmin(user)
        if (!isAdmin) throw new Error('Unauthorized')

        const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

        // 1. Fetch all users from Clerk (paginated, but 100 is enough for now)
        const { data: clerkUsers } = await clerk.users.getUserList({ limit: 100 });

        // 2. Fetch all subscriptions from Prisma
        let subscriptions: any[] = [];
        try {
            subscriptions = await prisma.subscription.findMany();
        } catch (dbError) {
            console.error("DB Error fetching subscriptions:", dbError);
        }

        // 3. Merge them
        const allUsers = clerkUsers.map(u => {
            const sub = subscriptions.find(s => s.userId === u.id);
            return {
                userId: u.id,
                email: u.emailAddresses[0]?.emailAddress || 'No Email',
                fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'Anonymous',
                isSubscribed: sub?.isSubscribed || false,
                planStatus: sub?.planStatus || 'INACTIVE',
                expiryDate: sub?.expiryDate || null,
                createdAt: u.createdAt
            };
        });

        // Sort by subscription status then by date
        return allUsers
            .filter(u => !ADMIN_EMAILS.includes(u.email.toLowerCase())) // HIDE ADMINS FROM THIS LIST
            .sort((a: any, b: any) => {
                if (a.planStatus === 'ACTIVE' && b.planStatus !== 'ACTIVE') return -1;
                if (a.planStatus !== 'ACTIVE' && b.planStatus === 'ACTIVE') return 1;
                return b.createdAt - a.createdAt;
            });
    } catch (error) {
        console.error("Failed to get all users:", error);
        return [];
    }
}

export async function getPaymentStatus() {
    try {
        const { userId } = await auth()
        if (!userId) return null

        const request = await prisma.paymentRequest.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        })

        return request
    } catch (error) {
        console.error("Failed to get payment status:", error);
        return null;
    }
}

export async function sendNotification(targetUserId: string, title: string, message: string) {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const user = await getSafeUser()
    const isAdmin = await isUserAdmin(user)
    if (!isAdmin) throw new Error('Unauthorized')

    await prisma.notification.create({
        data: {
            userId: targetUserId,
            title,
            message,
            isRead: false
        }
    })

    return { success: true }
}

export async function getUserNotifications() {
    try {
        const { userId } = await auth()
        if (!userId) return []

        return await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        })
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return [];
    }
}

export async function markNotificationAsRead(notificationId: string) {
    try {
        const { userId } = await auth()
        if (!userId) throw new Error('Unauthorized')

        await prisma.notification.update({
            where: { id: notificationId, userId },
            data: { isRead: true }
        })

        return { success: true }
    } catch (error) {
        console.error("Failed to mark notification as read:", error);
        return { success: false, message: "Database connection failed" };
    }
}

// --- EXPENSE TRACKER ACTIONS ---

export async function createExpense(data: { category: string, amount: number, description: string }) {
    const user = await getSafeUser();
    if (!user || !user.id) throw new Error('Unauthorized');

    await prisma.expense.create({
        data: {
            userId: user.id,
            category: data.category,
            amount: data.amount,
            description: data.description,
        }
    });

    revalidatePath('/dashboard/expenses');
    revalidatePath('/');
    return { success: true };
}

export async function getExpenses() {
    const { userId } = await auth();
    if (!userId) return [];

    return await prisma.expense.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50
    });
}

export async function deleteExpense(expenseId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized: Please sign in.');

    // Verify the expense belongs to the current user
    const expense = await prisma.expense.findUnique({
        where: { id: expenseId }
    });

    if (!expense) throw new Error('Expense not found.');
    if (expense.userId !== userId) throw new Error('Unauthorized: You can only delete your own expenses.');

    // Double check ownership or just admin privilege? 
    // Admin can delete any expense? Or only their own? 
    // Schema has userId. Assuming Admin manages the "Store" for the user or it's a single store app?
    // The app seems to be multi-tenant ("userId" everywhere).
    // If "Admin" (Global Admin) deletes an expense, they might delete SOMEONE ELSE'S expense if we don't check.
    // But `delete` by ID is unique.
    // However, for safety, we should probably ensure the expense belongs to the context or the admin has override.
    // Given the prompt "Admin Only... delete", and the user is 'ishimwet822', who seems to be the OWNER/ADMIN of this specific instance.

    await prisma.expense.delete({
        where: { id: expenseId }
    });

    revalidatePath('/dashboard/expenses');
    revalidatePath('/');
    return { success: true };
}

export async function resetNegativeStock() {
    const user = await getSafeUser();
    const isAdmin = await isUserAdmin(user);
    if (!isAdmin) throw new Error('Unauthorized: Admin only');

    // Find all products with negative stock
    const negativeProducts = await prisma.product.findMany({
        where: { stockQty: { lt: 0 } }
    });

    // Reset them to 0
    await prisma.product.updateMany({
        where: { stockQty: { lt: 0 } },
        data: { stockQty: 0 }
    });

    revalidatePath('/inventory');
    revalidatePath('/');
    revalidatePath('/pos');

    return { success: true, count: negativeProducts.length };
}

export async function initializeTrial() {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    // Check if they already have a subscription
    const existing = await prisma.subscription.findUnique({
        where: { userId }
    });

    if (existing) return { success: true, alreadyExists: true };

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    await prisma.subscription.create({
        data: {
            userId,
            isSubscribed: true,
            planStatus: 'ACTIVE',
            expiryDate: expiryDate,
        }
    });

    // Update Clerk Metadata as well for middleware efficiency
    try {
        const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        await clerk.users.updateUserMetadata(userId, {
            publicMetadata: {
                isSubscribed: true,
                planStatus: 'ACTIVE',
                expiryDate: expiryDate.toISOString()
            }
        });
    } catch (e) {
        console.error("Failed to update clerk metadata in trial init", e);
    }

    revalidatePath('/');
    return { success: true };
}
// --- USER MANAGEMENT ---

export async function deleteUser(targetUserId: string) {
    const user = await getSafeUser()
    const isAdmin = await isUserAdmin(user)
    if (!isAdmin) throw new Error('Unauthorized Action: Admin Only')

    // 1. Delete from Clerk
    try {
        const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        await clerk.users.deleteUser(targetUserId);
    } catch (error) {
        console.error("Failed to delete user from Clerk:", error);
        // Continue to clean up DB even if Clerk fails (or user mostly gone)
    }

    // 2. Delete from Database (Clean up all user data)
    try {
        // Transaction to ensure cleanup
        await prisma.$transaction([
            // Delete dependent records first (though some cascade via Product)
            prisma.sale.deleteMany({ where: { userId: targetUserId } }),
            prisma.wasteLog.deleteMany({ where: { userId: targetUserId } }),
            prisma.creditSale.deleteMany({ where: { userId: targetUserId } }),
            prisma.notification.deleteMany({ where: { userId: targetUserId } }),
            prisma.paymentRequest.deleteMany({ where: { userId: targetUserId } }),
            prisma.expense.deleteMany({ where: { userId: targetUserId } }),
            prisma.subscription.deleteMany({ where: { userId: targetUserId } }),

            // Delete core entities
            prisma.product.deleteMany({ where: { userId: targetUserId } }),
            prisma.supplier.deleteMany({ where: { userId: targetUserId } }),
        ]);
    } catch (error) {
        console.error("Failed to clean up user database records:", error);
        throw new Error("Partial failure during deletion.");
    }

    revalidatePath('/admin/users');
    return { success: true };
}
