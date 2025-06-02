import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import customerRoutes from './routes/customers';
import orderRoutes from './routes/orders';
import { startWorker } from './pubsub/worker';
import deliveryRoutes from './routes/delivery';


const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery-receipt', deliveryRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

startWorker();
