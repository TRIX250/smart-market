const { PrismaClient } = require('@prisma/client');
const { createClerkClient } = require('@clerk/nextjs/server');

async function clearAdminSubscription() {
    const adminEmail = 'ishimwet822@gmail.com';
    console.log('Cleaning up admin subscription data for:', adminEmail);

    // Initialize clients
    const prisma = new PrismaClient();
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

    try {
        const users = await clerk.users.getUserList({ emailAddress: [adminEmail] });
        const user = users.data[0];

        if (user) {
            await clerk.users.updateUserMetadata(user.id, {
                publicMetadata: {
                    isSubscribed: null,
                    planStatus: null,
                    expiryDate: null
                }
            });
            console.log('✅ Clerk metadata cleared for admin.');

            await prisma.subscription.deleteMany({
                where: { userId: user.id }
            });
            await prisma.paymentRequest.deleteMany({
                where: { userId: user.id }
            });
            console.log('✅ Database records cleared for admin.');
        } else {
            console.log('❌ Admin user not found in Clerk.');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

clearAdminSubscription();
