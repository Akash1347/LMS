import dotenv from 'dotenv';
dotenv.config();
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static('public'));
app.use(express.json());
import authRoutes from './routes/authRoute.js';

import { connectRabbitMq } from './config/rabbitmq.js';

connectRabbitMq();

app.get('/', (req, res) => {
    res.send('Auth Service is running');
})

app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" });
});
app.use('/api/auth', authRoutes);
 

app.listen(PORT, () => {
    console.log(`Auth Service is running on port ${PORT}`);
});
