import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClerkClient } from '@clerk/nextjs/server'

export async function POST(req: Request) {
    const signature = req.headers.get('verif-hash');
    const secretHash = process.env.FLW_WEBHOOK_HASH;

    // Optional: Verify Webhook Signature if hash is set
    if (secretHash && signature !== secretHash) {
        return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
    }

    try {
        const payload = await req.json();

        // 1. Verify it's a successful transaction
        if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
            const tx_ref = payload.data.tx_ref; // e.g., sm_sub_user_123_timestamp
            const userId = tx_ref.split('_')[2]; // Extracting userId from tx_ref pattern

            if (userId) {
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 30);

                await prisma.subscription.upsert({
                    where: { userId },
                    update: {
                        planStatus: 'ACTIVE',
                        expiryDate,
                        isSubscribed: true,
                        updatedAt: new Date(),
                    },
                    create: {
                        userId,
                        planStatus: 'ACTIVE',
                        expiryDate,
                        isSubscribed: true,
                    }
                });

                // Update Clerk Metadata
                const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
                await clerk.users.updateUserMetadata(userId, {
                    publicMetadata: {
                        isSubscribed: true,
                        planStatus: 'ACTIVE',
                        expiryDate: expiryDate.getTime()
                    }
                });

                console.log(`Webhook: Subscription updated for user ${userId}`);
            }
        }

        return NextResponse.json({ status: 'success' });
    } catch (err) {
        console.error('Webhook Error:', err);
        return NextResponse.json({ message: 'Webhook handler failed' }, { status: 500 });
    }
}
