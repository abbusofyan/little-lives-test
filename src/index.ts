import express from 'express';
import dotenv from 'dotenv';
import invoiceRoutes from './routes/invoiceRoutes';
import paymentRoutes from './routes/paymentRoutes';
import receiptRoutes from './routes/receiptRoutes';

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.use('/invoices', invoiceRoutes);
app.use('/payments', paymentRoutes);
app.use('/receipts', receiptRoutes);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
