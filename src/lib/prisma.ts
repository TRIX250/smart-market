import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    return new PrismaClient().$extends({
        query: {
            $allModels: {
                async $allOperations({ model, operation, args, query }) {
                    let lastError;
                    for (let i = 0; i < 3; i++) {
                        try {
                            return await query(args);
                        } catch (error: any) {
                            lastError = error;
                            // Check for connection issues
                            const isConnectionError =
                                error.message?.includes("Can't reach database server") ||
                                error.message?.includes("DB_CONNECTION_REFUSED") ||
                                error.code === 'P1001' || // Can't reach DB server
                                error.code === 'P1002' || // DB server timeout
                                error.code === 'P1008';   // Operations timeout

                            if (isConnectionError) {
                                console.warn(`[Prisma] Connection error. Retrying ${i + 1}/3...`, error.message);
                                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff-ish
                                continue;
                            }
                            throw error;
                        }
                    }
                    throw lastError;
                },
            },
        },
    });
}

type PrismaClientWithExtensions = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = global as unknown as { prisma: PrismaClientWithExtensions }

export const prisma = globalForPrisma.prisma || prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma