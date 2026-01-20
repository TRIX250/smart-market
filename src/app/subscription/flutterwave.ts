'use server'

import { prisma } from '@/lib/prisma'
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from 'next/cache'

/**
 * Initializes a Flutterwave payment for the subscription
 */
export async function initializeSubscription() {
    const { userId, sessionClaims } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Flutterwave requires a unique transaction reference
    const tx_ref = `sm_sub_${userId}_${Date.now()}`;
    const amount = 7000;
    const email = (sessionClaims as any)?.email || `${userId}@smartmarket.local`;
    const name = (sessionClaims as any)?.fullName || "SmartMarket User";

    try {
        const response = await fetch("https://api.flutterwave.com/v3/payments", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                tx_ref,
                amount,
                currency: "RWF",
                redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscribe/success`,
                customer: {
                    email,
                    name,
                },
                customizations: {
                    title: "SmartMarket Pro Subscription",
                    description: "30 Days Full Access to Inventory & POS",
                    logo: "https://smartmarket-manager.vercel.app/logo.png",
                },
            }),
        });

        const data = await response.json();

        if (data.status === "success") {
            return { success: true, url: data.data.link };
        } else {
            return { success: false, message: data.message || "Failed to initialize payment" };
        }
    } catch (error) {
        console.error("Flutterwave Init Error:", error);
        return { success: false, message: "Internal server error connecting to payment gateway" };
    }
}

/**
 * Verifies and updates the subscription after a successful payment
 */
export async function verifyAndActivateSubscription(transactionId: string) {
    const userId = (await auth()).userId;
    if (!userId) throw new Error("Unauthorized");

    try {
        // Verify payment with Flutterwave
        const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
            },
        });

        const data = await response.json();

        if (data.status === "success" && data.data.status === "successful" && data.data.amount >= 7000) {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);

            // Update Database
            await prisma.subscription.upsert({
                where: { userId },
                update: {
                    isSubscribed: true,
                    planStatus: "ACTIVE",
                    expiryDate,
                    updatedAt: new Date(),
                },
                create: {
                    userId,
                    isSubscribed: true,
                    planStatus: "ACTIVE",
                    expiryDate,
                },
            });

            // Update Clerk Metadata for Middleware Access
            const { createClerkClient } = await import('@clerk/nextjs/server');
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
        }

        return { success: false, message: "Payment verification failed" };
    } catch (error) {
        console.error("Verification Error:", error);
        return { success: false, message: "Error during payment verification" };
    }
}
