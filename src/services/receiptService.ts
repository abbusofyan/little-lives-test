import prisma from '../prismaClient';
import { v4 as uuidv4 } from 'uuid';
import { Invoice, Payment } from '@prisma/client';

export async function generateReceipt(paymentId: string) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId }, include: { invoice: { include: { items: true } } } });
    if (!payment) throw new Error('Payment not found');

    const invoice = payment.invoice as (Invoice & { items: any[] });
    const amountToAllocate = Number(payment.amount);

    const totalLines = invoice.items.reduce((s, it: any) => s + it.lineTotal + it.taxAmount, 0);
    const totalLinesRounded = Number(totalLines.toFixed(2)) || 0;

    let allocations: { invoiceItemId: string; allocatedAmount: number }[] = [];

    if (totalLinesRounded <= 0) {
        allocations.push({
            invoiceItemId: invoice.items[0] ?.id ?? '',
            allocatedAmount: Number(amountToAllocate.toFixed(2))
        });
    } else {
        let runningAllocated = 0;
        invoice.items.forEach((it: any, idx: number) => {
            const itemTotal = it.lineTotal + it.taxAmount;
            const proportion = itemTotal / totalLinesRounded;
            let allocated = idx === invoice.items.length - 1
                ? Number((amountToAllocate - runningAllocated).toFixed(2))
                : Number((amountToAllocate * proportion).toFixed(2));
            runningAllocated = Number((runningAllocated + allocated).toFixed(2));
            allocations.push({ invoiceItemId: it.id, allocatedAmount: allocated });
        });
    }

    const remainingBalance = Number(Math.max(0, invoice.outstandingAmount - amountToAllocate).toFixed(2));

    const receiptNumber = `R-${uuidv4().slice(0, 8)}`;
    const createdReceipt = await prisma.receipt.create({
        data: {
            paymentId,
            receiptNumber,
            totalPaid: amountToAllocate,
            remainingBalance,
            items: {
                create: allocations.map(a => ({
                    invoiceItemId: a.invoiceItemId,
                    allocatedAmount: a.allocatedAmount
                }))
            }
        },
        include: { items: true }
    });

    return { receipt: createdReceipt, allocations };
}
