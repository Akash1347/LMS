import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import pool from './config/db.js';
import { fileURLToPath } from 'url';


const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static('public'));
app.use(express.json());
import authRoutes from './routes/authRoute.js';
 
import path from 'path';
 
import { connectRabbitMq } from './config/rabbitmq.js';

connectRabbitMq();

app.get('/', async (req, res) => {
    const data = await pool.query('select * from users');
    console.log(data.rows);
    //console.log(privateKey , publicKey);
    res.send('Auth Service is running');
}) 
app.use('/api/auth', authRoutes);
 

app.listen(PORT, () => {
    console.log(`Auth Service is running on port ${PORT}`);
});
