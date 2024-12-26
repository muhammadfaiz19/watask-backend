// src/app.js
const express = require('express');
const mongoose = require('mongoose');
const { createTask } = require('./controllers/taskController');
require('dotenv').config();

const app = express();
app.use(express.json());

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
