import express from 'express';
import { createInvoice, getInvoiceById } from '../services/invoiceService';
import { InvoiceItemInput } from '../types';

const router = express.Router();
const DEFAULT_TAX_RATE = parseFloat(process.env.DEFAULT_TAX_RATE || '0.07');

router.post('/', async (req, res) => {
    try {
        const { invoiceNumber, invoiceDate, items }: { invoiceNumber?: string; invoiceDate?: string; items: InvoiceItemInput[] } = req.body;
        if (!invoiceNumber) return res.status(400).json({ error: 'Invoice number is required' });
        if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'items is required' });

        const invDate = invoiceDate ? new Date(invoiceDate) : new Date();
        const created = await createInvoice(invoiceNumber, invDate, items, DEFAULT_TAX_RATE);
        res.json(created);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const inv = await getInvoiceById(req.params.id);
        if (!inv) return res.status(404).json({ error: 'not found' });
        res.json(inv);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
