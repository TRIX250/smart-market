
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking for creditSale model...');
    if (prisma.creditSale) {
        console.log('SUCCESS: prisma.creditSale exists!');
        const count = await prisma.creditSale.count();
        console.log(`Credit sale count: ${count}`);
    } else {
        console.error('FAILURE: prisma.creditSale is undefined');
        process.exit(1);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
