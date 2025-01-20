const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
require('./services/whatsappService');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('[MongoDB] Connected successfully'))
  .catch(err => console.error('[MongoDB] Connection error:', err.message));

// Routes
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api', taskRoutes);
app.use('/api', userRoutes);
app.use('/api', authRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`[Server] Running on port ${PORT}`));
