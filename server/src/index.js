import './config/env.js';
import express from 'express';
import cors from 'cors';

import aiRoutes from './routes/aiRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', async (req, res) => {
    try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        if (error) throw error;
        res.json({ status: 'ok', database: 'connected', timestamp: new Date() });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message, timestamp: new Date() });
    }
});

app.get('/', (req, res) => {
    res.send('Study-Stack API is running...');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is successfully listening on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Keep process alive for debugging
setInterval(() => {
    console.log('Heartbeat: Server is still alive...');
}, 60000);
