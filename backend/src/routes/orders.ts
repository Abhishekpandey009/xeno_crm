// src/routes/orders.ts
import express, { Request, Response } from 'express';
import { enqueue } from '../pubsub/queue';

const router = express.Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { orderId, customerId, amount, date } = req.body;

  if (!orderId || !customerId || !amount) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  enqueue({
    type: 'order',
    data: { orderId, customerId, amount, date },
  });

  res.status(202).json({ message: 'Order accepted for processing' });
});

export default router;
