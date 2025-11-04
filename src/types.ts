import { InvoiceItem as PrismaInvoiceItem } from '@prisma/client';

export type InvoiceItemInput = {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
};
