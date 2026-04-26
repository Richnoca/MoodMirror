import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import entryRoutes from './routes/entries.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('MoodMirror backend is running.');
});

app.use('/auth', authRoutes);
app.use('/entries', entryRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});