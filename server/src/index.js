import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('WARNING: SUPABASE_URL or SUPABASE_ANON_KEY is missing in .env file');
}

export const supabase = (supabaseUrl && supabaseKey) 
    ? createClient(supabaseUrl, supabaseKey) 
    : null;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
    res.send('Study-Stack API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
