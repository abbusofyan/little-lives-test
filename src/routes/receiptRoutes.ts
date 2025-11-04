import express from 'express';
import prisma from '../prismaClient';
import { generateReceipt } from '../services/receiptService';

const router = express.Router();

router.post('/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const result = await generateReceipt(paymentId);
        res.json(result);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const r = await prisma.receipt.findUnique({
            where: { id: req.params.id },
            include: { items: true, payment: true },
        });
        if (!r) return res.status(404).json({ error: 'not found' });
        res.json(r);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
