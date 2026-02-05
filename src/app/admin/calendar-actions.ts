'use server'

import { prisma } from '@/lib/prisma'
import { isEmailAdmin, isUsernameAdmin } from '@/lib/auth-constants'
import { currentUser } from '@clerk/nextjs/server'

export async function getUpcomingPayments() {
    try {
        const user = await currentUser()
        const email = user?.emailAddresses[0]?.emailAddress
        const username = user?.username
        const isAdmin = isEmailAdmin(email) || isUsernameAdmin(username)

        if (!isAdmin) throw new Error('Unauthorized')

        // Get all active subscriptions with expiry dates
        const subscriptions = await prisma.subscription.findMany({
            where: {
                planStatus: 'ACTIVE',
                expiryDate: { not: null }
            },
            orderBy: {
                expiryDate: 'asc'
            }
        })

        // Get user emails from payment requests
        const userIds = subscriptions.map(s => s.userId)
        const paymentRequests = await prisma.paymentRequest.findMany({
            where: {
                userId: { in: userIds },
                status: 'APPROVED'
            },
            select: {
                userId: true,
                userEmail: true
            },
            distinct: ['userId']
        })

        // Create a map for quick email lookup
        const emailMap = new Map<string, string>()
        paymentRequests.forEach(pr => {
            if (pr.userEmail) emailMap.set(pr.userId, pr.userEmail)
        })

        const now = new Date()
        const upcomingPayments = subscriptions.map(sub => {
            const expiryDate = sub.expiryDate || new Date()
            const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

            return {
                userId: sub.userId,
                userEmail: emailMap.get(sub.userId) || null,
                expiryDate: expiryDate,
                daysRemaining,
                planType: 'PRO',
                status: daysRemaining <= 0 ? 'expired' : daysRemaining <= 5 ? 'urgent' : daysRemaining <= 14 ? 'warning' : 'normal'
            }
        })

        return upcomingPayments
    } catch (error) {
        console.error('Failed to get upcoming payments:', error)
        return []
    }
}

export async function sendPaymentReminders() {
    'use server'
    try {
        const user = await currentUser()
        const email = user?.emailAddresses[0]?.emailAddress
        const username = user?.username
        const isAdmin = isEmailAdmin(email) || isUsernameAdmin(username)

        if (!isAdmin) throw new Error('Unauthorized')

        const now = new Date()
        const fiveDaysFromNow = new Date(now.getTime() + (5 * 24 * 60 * 60 * 1000))
        const sixDaysFromNow = new Date(now.getTime() + (6 * 24 * 60 * 60 * 1000))

        // Find users expiring in exactly 5 days (within a 24-hour window)
        const expiringUsers = await prisma.subscription.findMany({
            where: {
                planStatus: 'ACTIVE',
                expiryDate: {
                    gte: fiveDaysFromNow,
                    lt: sixDaysFromNow
                }
            }
        })

        let sentCount = 0
        for (const sub of expiringUsers) {
            // Check if we already sent a reminder recently
            const recentReminder = await prisma.notification.findFirst({
                where: {
                    userId: sub.userId,
                    title: { contains: 'Subscription Expiring Soon' },
                    createdAt: { gte: new Date(now.getTime() - (24 * 60 * 60 * 1000)) }
                }
            })

            if (!recentReminder) {
                await prisma.notification.create({
                    data: {
                        userId: sub.userId,
                        title: '⚠️ Subscription Expiring Soon',
                        message: `Your SmartMarket PRO subscription expires in 5 days! Renew now to avoid service interruption.`
                    }
                })
                sentCount++
            }
        }

        return { success: true, sent: sentCount }
    } catch (error) {
        console.error('Failed to send payment reminders:', error)
        return { success: false, sent: 0 }
    }
}

export async function sendSingleReminder(targetUserId: string, userEmail: string | null) {
    'use server'
    try {
        const user = await currentUser()
        const email = user?.emailAddresses[0]?.emailAddress
        const username = user?.username
        const isAdmin = isEmailAdmin(email) || isUsernameAdmin(username)

        if (!isAdmin) throw new Error('Unauthorized')

        await prisma.notification.create({
            data: {
                userId: targetUserId,
                title: '🔔 Payment Reminder',
                message: `Hi${userEmail ? ` ${userEmail.split('@')[0]}` : ''}! Your SmartMarket PRO subscription is expiring soon. Please renew to continue enjoying premium features.`
            }
        })

        return { success: true, userEmail: userEmail || targetUserId.slice(-8).toUpperCase() }
    } catch (error) {
        console.error('Failed to send single reminder:', error)
        return { success: false, userEmail: null }
    }
}
