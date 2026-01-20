'use server'

import { prisma } from '@/lib/prisma'
import { auth, currentUser, createClerkClient } from "@clerk/nextjs/server"
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getAuth() {
    const { userId } = await auth();
    if (!userId) return null;
    return userId;
}

// 1. Check Access: Returns status object
export async function checkAccess(providedUserId?: string | null) {
    const { userId, sessionClaims } = await auth();
    const finalUserId = providedUserId || userId;

    if (!finalUserId) {
        return { isValid: false, expiryDate: null, isLoggedIn: false, planStatus: 'INACTIVE', isAdmin: false };
    }

    let isAdmin = false;

    // A. Check Admin Status via Session Claims (Fastest & Safest)
    const claims = sessionClaims as { email?: string, username?: string } | null;
    const userEmail = claims?.email;
    const username = claims?.username;
    const adminEmail = 'ishimwet822@gmail.com';

    isAdmin =
        userEmail?.toLowerCase() === adminEmail.toLowerCase() ||
        username === 'trick_market';

    if (isAdmin) {
        return {
            isValid: true,
            expiryDate: new Date('2099-12-31'),
            isLoggedIn: true,
            planStatus: 'ACTIVE',
            isAdmin: true
        };
    }

    // B. Fallback to currentUser() only if claims are missing
    try {
        const user = await currentUser();
        if (user) {
            isAdmin =
                user.emailAddresses?.some(e => e.emailAddress.toLowerCase() === adminEmail.toLowerCase()) ||
                user.username?.toLowerCase() === 'trick_market';

            if (isAdmin) {
                return {
                    isValid: true,
                    expiryDate: new Date('2099-12-31'),
                    isLoggedIn: true,
                    planStatus: 'ACTIVE',
                    isAdmin: true
                };
            }
        }
    } catch (error) {
        console.warn('[Clerk] User profile fetch failed in checkAccess.', error);
    }

    // C. Defensively check Subscription via DB
    try {
        const sub = await prisma.subscription.findUnique({
            where: { userId: finalUserId }
        });

        if (!sub) return { isValid: false, expiryDate: null, isLoggedIn: true, planStatus: 'INACTIVE', isAdmin: false };

        const isValid = sub.planStatus === 'ACTIVE' && sub.expiryDate && new Date(sub.expiryDate) > new Date();

        return {
            isValid: !!isValid,
            expiryDate: sub.expiryDate,
            isLoggedIn: true,
            planStatus: sub.planStatus,
            isAdmin: false
        };
    } catch (error) {
        console.warn('[Database] Subscription status fetch failed in checkAccess.', error);
        return {
            isValid: false,
            expiryDate: null,
            isLoggedIn: true,
            planStatus: 'OFFLINE',
            isAdmin: false
        };
    }
}

import { requestToPay } from '@/lib/momo'

// 2. Process MoMo Subscription (Real API)
export async function processMoMoSubscription(formData: FormData) {
    const userId = await getAuth();
    if (!userId) throw new Error("Unauthorized");

    const phoneNumber = formData.get('phoneNumber') as string;
    const amount = 7000; // Updated price

    try {
        // Trigger MoMo Payment
        const result = await requestToPay(amount, phoneNumber);

        if (!result.success) {
            return { success: false, message: "MoMo Request Failed: " + result.error };
        }

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30); // Add 30 days

        await prisma.subscription.upsert({
            where: { userId },
            update: {
                isSubscribed: true,
                planStatus: 'ACTIVE',
                expiryDate: expiryDate,
                updatedAt: new Date()
            },
            create: {
                userId,
                isSubscribed: true,
                planStatus: 'ACTIVE',
                expiryDate: expiryDate
            }
        });

        const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        await clerk.users.updateUserMetadata(userId, {
            publicMetadata: {
                isSubscribed: true,
                planStatus: "ACTIVE",
                expiryDate: expiryDate.getTime()
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (e: any) {
        console.error("Subscription Error:", e);
        return { success: false, message: e.message || "Payment Error" };
    }
}

// 3. Helper to get Subscription Data (for UI)
export async function getSubscriptionStatus() {
    const userId = await getAuth();
    if (!userId) return null;

    return await prisma.subscription.findUnique({
        where: { userId }
    });
}

// 4. Airtel Placeholder
export async function handleAirtelSubscription() {
    return { success: false, message: "Airtel Money integration is coming soon!" };
}
