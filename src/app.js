// src/app.js
const express = require('express');
const mongoose = require('mongoose');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const client = require('./whatsapp');  // Impor client dari whatsapp.js
require('dotenv').config();

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

const app = express();
app.use(express.json()); // Middleware untuk parsing request JSON

// Gunakan routes
app.use('/api', taskRoutes);
app.use('/api', userRoutes);

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
