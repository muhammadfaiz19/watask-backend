// src/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const client = require('./whatsapp'); 
require('dotenv').config(); 

const app = express();
app.use(express.json());

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173' || 'https://watask-sooty.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions)); 

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Gunakan routes
app.use('/api', taskRoutes);
app.use('/api', userRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
