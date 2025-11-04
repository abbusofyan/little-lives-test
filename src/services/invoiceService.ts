import prisma from '../prismaClient';
import { InvoiceItemInput } from '../types';
import { v4 as uuidv4 } from 'uuid';

export type InvoiceTotals = {
    items: {
        description: string;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
        taxRate: number;
        taxAmount: number;
    }[];
    totalAmount: number;
    totalTax: number;
    grandTotal: number;
};


export function calculateInvoiceTotal(items: InvoiceItemInput[], taxRate: number): InvoiceTotals {
    const computedItems = items.map(i => {
        const q = Number(i.quantity);
        const u = Number(i.unitPrice);
        const lineTotal = Number((q * u).toFixed(2));
        const tr = typeof i.taxRate === 'number' ? i.taxRate : taxRate;
        const taxAmount = Number((lineTotal * tr).toFixed(2));
        return {
            description: i.description,
            quantity: q,
            unitPrice: u,
            lineTotal,
            taxRate: tr,
            taxAmount,
        };
    });

    const totalAmount = Number(computedItems.reduce((s, it) => s + it.lineTotal, 0).toFixed(2));
    const totalTax = Number(computedItems.reduce((s, it) => s + it.taxAmount, 0).toFixed(2));
    const grandTotal = Number((totalAmount + totalTax).toFixed(2));

    return { items: computedItems, totalAmount, totalTax, grandTotal };
}

export async function createInvoice(
    invoiceNumber: string,
    invoiceDate: Date,
    items: InvoiceItemInput[],
    taxRate: number
) {
    // Validation
    if (!invoiceNumber?.trim()) throw new Error('Invoice number is required');
    if (!invoiceDate) throw new Error('Invoice date is required');
    if (!items || items.length === 0) throw new Error('At least one invoice item is required');

    const existingInvoice = await prisma.invoice.findUnique({ where: { invoiceNumber } });
    if (existingInvoice) throw new Error(`Invoice number "${invoiceNumber}" already exists`);

    items.forEach((item, idx) => {
        if (!item.description?.trim()) throw new Error(`Item #${idx + 1} description is required`);
        if (item.quantity <= 0) throw new Error(`Item #${idx + 1} quantity must be greater than 0`);
        if (item.unitPrice < 0) throw new Error(`Item #${idx + 1} unit price must be non-negative`);
    });

    const totals = calculateInvoiceTotal(items, taxRate);

    const created = await prisma.invoice.create({
        data: {
            invoiceNumber,
            invoiceDate,
            totalAmount: totals.totalAmount,
            totalTax: totals.totalTax,
            outstandingAmount: totals.grandTotal,
            status: 'Pending',
            items: {
                create: totals.items.map(it => ({
                    description: it.description,
                    quantity: it.quantity,
                    unitPrice: it.unitPrice,
                    lineTotal: it.lineTotal,
                    taxRate: it.taxRate,
                    taxAmount: it.taxAmount,
                })),
            },
        },
        include: { items: true },
    });

    return created;
}


export async function getInvoiceById(id: string) {
    return prisma.invoice.findUnique({ where: { id }, include: { items: true, payments: true, receipts: true } });
}
