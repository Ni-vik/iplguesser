import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import playerRoutes from './routes/playerRoutes.js';

dotenv.config();
connectDB();

const corsorigin = {
  origin : 'https://guesstheplayer.onrender.com'
}

const app = express();
app.use(cors(corsorigin));
app.use(express.json());

app.use('/api/players', playerRoutes);
app.get('/health-check', (req, res) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
