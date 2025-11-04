import express from 'express';
import { processPayment } from '../services/paymentService';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { invoiceId, amount, paymentMethod, referenceNumber } = req.body;
        if (!invoiceId || !amount || !paymentMethod)
            return res.status(400).json({ error: 'Invoice ID, Amount & Payment Method are required' });

        const result = await processPayment(invoiceId, Number(amount), paymentMethod, referenceNumber);
        res.json(result);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
