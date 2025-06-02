// src/routes/customers.ts
import express, { Request, Response } from 'express';
import { enqueue } from '../pubsub/queue';

const router = express.Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { id, name, email, totalSpend, visitCount, lastActive } = req.body;

  if (!id || !name || !email) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  enqueue({
    type: 'customer',
    data: { id, name, email, totalSpend, visitCount, lastActive },
  });

  res.status(202).json({ message: 'Customer accepted for processing' });
});

export default router;
