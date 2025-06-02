import { dequeue } from './queue';
import { db } from '../firebase';

export const startWorker = () => {
  setInterval(async () => {
    const job = dequeue();
    if (!job) return;

    try {
      if (job.type === 'customer') {
        const { id, ...rest } = job.data;
        await db.collection('customers').doc(id).set(rest);
        console.log(`✅ Processed customer: ${id}`);
      } else if (job.type === 'order') {
        const { orderId, ...rest } = job.data;
        await db.collection('orders').doc(orderId).set(rest);
        console.log(`✅ Processed order: ${orderId}`);
      }
    } catch (err) {
      console.error(`❌ Failed to process ${job.type}`, err);
    }
  }, 1000); // 1-second interval
};
