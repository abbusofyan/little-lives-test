import prisma from '../prismaClient';
import { Invoice, PaymentMethod } from '@prisma/client';

export interface ReceiptItem {
    id: string;
    receiptId: string;
    invoiceItemId: string;
    allocatedAmount: number;
}

export interface Receipt {
    id: string;
    paymentId: string;
    receiptNumber: string;
    receiptDate: Date;
    totalPaid: number;
    remainingBalance: number;
    items: ReceiptItem[];
}

export async function processPayment(
    invoiceId: string,
    paymentAmount: number,
    paymentMethod: PaymentMethod,
    referenceNumber?: string
) {
    const validMethods = ['Cash', 'BankTransfer', 'Card'];
    if (!validMethods.includes(paymentMethod)) throw new Error('Invalid payment method');
    if (paymentAmount <= 0) throw new Error('Payment amount must be greater than 0');

    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { items: true, payments: true },
    });
    if (!invoice) throw new Error('Invoice not found');

    const outstanding = Number(invoice.outstandingAmount || 0);

    if (outstanding <= 0) {
        throw new Error('Cannot pay an invoice with zero outstanding amount');
    }

    if (paymentAmount < 0) {
        throw new Error('Payment amount cannot be negative');
    }

    if (paymentAmount > outstanding) {
        throw new Error(`Payment amount exceeds outstanding invoice amount (${outstanding})`);
    }

    if (referenceNumber) {
        const duplicateRef = await prisma.payment.findFirst({ where: { referenceNumber } });
        if (duplicateRef) throw new Error(`Reference number "${referenceNumber}" already exists`);
    }

    const newOutstandingRaw = Number((outstanding - paymentAmount).toFixed(2));
    const newOutstanding = newOutstandingRaw < 0 ? 0 : newOutstandingRaw;

    let status: typeof invoice.status = invoice.status;
    if (paymentAmount === outstanding) status = 'Paid';
    else status = 'PartiallyPaid';

    const payment = await prisma.payment.create({
        data: {
            invoiceId,
            paymentMethod,
            amount: paymentAmount,
            referenceNumber,
            status: 'Completed',
        },
    });

    const receiptNumber = `RCPT-${Date.now()}-${payment.id}`;

    const totalInvoiceAmount = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const receiptItemsData = invoice.items.map(item => {
        const itemTotal = item.quantity * item.unitPrice;
        const proportion = itemTotal / totalInvoiceAmount;
        const allocatedAmount = Number((paymentAmount * proportion).toFixed(2));
        return {
            receiptId: '',
            invoiceItemId: item.id,
            allocatedAmount,
        };
    });

    const totalAllocated = receiptItemsData.reduce((sum, item) => sum + item.allocatedAmount, 0);
    const remainingBalance = totalInvoiceAmount - totalAllocated;

    const receipt = await prisma.receipt.create({
        data: {
            paymentId: payment.id,
            invoiceId,
            receiptNumber,
            receiptDate: new Date(),
            totalPaid: totalAllocated,
            remainingBalance,
        },
    });

    const receiptItemsToCreate = receiptItemsData.map(item => ({ ...item, receiptId: receipt.id }));
    await prisma.receiptItem.createMany({ data: receiptItemsToCreate });

    const updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: { outstandingAmount: newOutstanding, status },
        include: { items: true, payments: true },
    });

    return {
        payment,
        receipt: { ...receipt, items: receiptItemsToCreate },
        invoice: updatedInvoice,
        overpayment: 0,
    };
}
