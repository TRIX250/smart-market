'use server'

import { auth, currentUser, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

import { writeFile } from 'fs/promises'
import path from 'path'

export async function submitPaymentRequest(formData: FormData) {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const transactionId = formData.get('transactionId') as string
    const file = formData.get('screenshot') as File

    if (!transactionId || transactionId.trim().length < 5) {
        return { success: false, message: 'Please enter a valid Transaction ID' }
    }

    try {
        // Check if transaction ID already exists
        const existing = await prisma.paymentRequest.findUnique({
            where: { transactionId }
        })

        if (existing) {
            return { success: false, message: 'This Transaction ID has already been submitted.' }
        }

        let screenshotUrl = null
        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer())
            const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`
            const filepath = path.join(process.cwd(), 'public/uploads', filename)
            await writeFile(filepath, buffer)
            screenshotUrl = `/uploads/${filename}`
        }

        const user = await currentUser()
        const userEmail = user?.emailAddresses[0]?.emailAddress || null

        await prisma.paymentRequest.create({
            data: {
                userId,
                userEmail,
                transactionId,
                screenshotUrl,
                amount: 7000,
                status: 'PENDING'
            }
        })

        revalidatePath('/subscribe')
        return { success: true, message: 'Request submitted! Waiting for admin approval.' }
    } catch (error) {
        console.error('Payment request error:', error)
        return { success: false, message: 'Failed to submit request. Please try again.' }
    }
}

export async function getPaymentStatus() {
    const { userId } = await auth()
    if (!userId) return null

    const request = await prisma.paymentRequest.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    })

    return request
}
