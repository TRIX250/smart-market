'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function flushDevCache() {
    try {
        revalidatePath('/')
        revalidatePath('/admin')
        return { success: true, message: 'Cache Flushed: All paths revalidated' }
    } catch (error) {
        console.error('Cache flush error:', error)
        return { success: false, message: 'Failed to flush cache' }
    }
}

export async function rebootDevServer() {
    // In a real production environment, this would trigger a redeploy hook or similar.
    // For now, it signals a successful intent.
    return { success: true, message: 'Server Reboot Sequence Initiated... (Simulated)' }
}

export async function getSystemAnomalies() {
    'use server'
    const anomalies: any[] = []

    // 1. Check DB Latency
    try {
        const start = Date.now()
        await prisma.$queryRaw`SELECT 1`
        const latency = Date.now() - start
        if (latency > 100) {
            anomalies.push({
                id: 'db-lag',
                type: 'DATABASE_LATENCY',
                severity: 'high',
                angle: 45,
                dist: 70,
                detail: `${latency}ms response time detected.`
            })
        }
    } catch (e) {
        anomalies.push({ id: 'db-off', type: 'DB_CONNECTION_LOST', severity: 'high', angle: 0, dist: 90, detail: 'Connection refused' })
    }

    // 2. Memory Analysis
    const memory = process.memoryUsage().heapUsed / 1024 / 1024
    if (memory > 300) {
        anomalies.push({
            id: 'mem-leak',
            type: 'MEMORY_USAGE',
            severity: 'low',
            angle: 160,
            dist: 45,
            detail: `${memory.toFixed(1)}MB Heap usage.`
        })
    }

    // 3. Env Check
    if (!process.env.GEMINI_API_KEY) {
        anomalies.push({
            id: 'api-off',
            type: 'API_DISCONNECTED',
            severity: 'high',
            angle: 280,
            dist: 85,
            detail: 'Neural Link (Gemini) Key missing.'
        })
    }

    // 4. Backlog
    try {
        const pending = await prisma.paymentRequest.count({ where: { status: 'PENDING' } })
        if (pending > 5) {
            anomalies.push({
                id: 'backlog',
                type: 'REQUEST_BACKLOG',
                severity: 'low' as const,
                angle: 320,
                dist: 30,
                detail: `${pending} payments awaiting approval.`
            })
        }
    } catch (e) { }

    return anomalies as { id: string, type: string, severity: 'high' | 'low', angle: number, dist: number, detail: string }[]
}

export async function getRealSystemLogs() {
    'use server'
    try {
        // Fetch recent events from across the system
        const [sales, payments, notifications] = await Promise.all([
            prisma.sale.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
            prisma.paymentRequest.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
            prisma.notification.findMany({ take: 5, orderBy: { createdAt: 'desc' } })
        ])

        const logs = []

        // Format Sales
        sales.forEach(s => logs.push({
            time: s.createdAt,
            type: 'QUERY',
            msg: `SALE_EXECUTED: ID ${s.id.slice(-6)} | Amount: ${s.totalAmount} RWF`
        }))

        // Format Payments
        payments.forEach(p => logs.push({
            time: p.createdAt,
            type: 'INFO',
            msg: `PAYMENT_REQ: User ${p.userEmail || p.userId.slice(-6)} | TX: ${p.transactionId}`
        }))

        // Format Notifications
        notifications.forEach(n => logs.push({
            time: n.createdAt,
            type: 'DEBUG',
            msg: `NOTIF_SENT: "${n.title}" -> TO: ${n.userId.slice(-6)}`
        }))

        // Add some system noise for realism
        logs.push({ time: new Date(), type: 'INFO', msg: `NODE_ENV: ${process.env.NODE_ENV}` })
        logs.push({ time: new Date(), type: 'DEBUG', msg: `UPTIME: ${Math.floor(process.uptime())}s` })

        // Sort by time and return formatted strings
        return logs
            .sort((a, b) => a.time.getTime() - b.time.getTime())
            .map(l => {
                const ts = l.time.toLocaleTimeString().split(' ')[0]
                return `[${ts}] ${l.type.padEnd(5)} : ${l.msg}`
            })
    } catch (e) {
        console.error("Failed to fetch real logs:", e)
        return [`[${new Date().toLocaleTimeString().split(' ')[0]}] ERROR : Failed to attach to system signal stream.`]
    }
}

export async function getTrafficMetrics() {
    'use server'
    const start = Date.now()
    try {
        await prisma.$queryRaw`SELECT 1`
        const latency = Date.now() - start

        // Simulate a request rate that fluctuates slightly 
        // biased by actual process uptime and CPU load
        const cpuBias = process.cpuUsage().user / 1000000
        const requestsPerSec = Math.floor(20 + (Math.random() * 10) + (cpuBias % 15))

        return {
            latency,
            requestsPerSec,
            timestamp: new Date().toISOString()
        }
    } catch (e) {
        return { latency: 999, requestsPerSec: 0, timestamp: new Date().toISOString() }
    }
}
