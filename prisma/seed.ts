import prisma from '../src/prismaClient';

async function main() {
    const invoice = await prisma.invoice.create({
        data: {
            invoiceNumber: 'INV-1000',
            invoiceDate: new Date(),
            totalAmount: 0,
            totalTax: 0,
            outstandingAmount: 0,
            status: 'Pending',
            items: {
                create: [
                    { description: 'Consulting', quantity: 2, unitPrice: 150, lineTotal: 300, taxRate: 0.07, taxAmount: 21 },
                    { description: 'Hosting', quantity: 1, unitPrice: 50, lineTotal: 50, taxRate: 0.07, taxAmount: 3.5 },
                ]
            }
        }
    });

    const totalAmount = 350;
    const totalTax = 24.5;
    const grandTotal = 374.5;

    await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
            totalAmount,
            totalTax,
            outstandingAmount: grandTotal,
            status: 'Pending'
        }
    });
    console.log('seed finished');
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
