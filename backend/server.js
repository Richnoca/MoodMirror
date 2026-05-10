import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import entryRoutes from './routes/entries.js';
import userRoutes from './routes/users.js';
import followRoutes from './routes/follows.js';
import likeRoutes from './routes/likes.js';
import feedRoutes from './routes/feed.js';
import commentRoutes from './routes/comments.js';
import notificationRoutes from './routes/notifications.js';
import uploadRoutes from './routes/upload.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('MoodMirror backend is running.');
});

app.use('/auth', authRoutes);
app.use('/entries', entryRoutes);
app.use('/users', userRoutes);
app.use('/follows', followRoutes);
app.use('/likes', likeRoutes);
app.use('/feed', feedRoutes);
app.use('/comments', commentRoutes);
app.use('/notifications', notificationRoutes);
app.use('/upload', uploadRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
