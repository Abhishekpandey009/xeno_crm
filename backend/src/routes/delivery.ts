import express, { Request, Response } from 'express';
import { db } from '../firebase';

const router = express.Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { campaignId, customerId, status, subject } = req.body;

  if (!campaignId || !customerId || !status) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    await db
      .collection('communication_log')
      .doc(`${campaignId}_${customerId}`)
      .set({
        campaignId,
        customerId,
        status,
        subject: subject || 'Unnamed',
        timestamp: new Date().toISOString(),
      });

    res.status(200).json({ message: 'Delivery status logged' });
  } catch (err) {
    console.error('Error writing to Firestore:', err);
    res.status(500).json({ error: 'Failed to update delivery log' });
  }
});

export default router;
