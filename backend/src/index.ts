import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import customerRoutes from './routes/customers';
import orderRoutes from './routes/orders';
import deliveryRoutes from './routes/delivery';
import { startWorker } from './pubsub/worker';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery-receipt', deliveryRoutes);

// Optional root route for Render/Vercel status check
app.get('/', (req, res) => {
  res.send('✅ Xeno CRM Backend is Live');
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

// Start background worker for delivery queue simulation
startWorker();
