const Task = require('../models/Task');
const User = require('../models/User');
const { client } = require('../whatsapp');
const { 
  generateTaskCreatedMessage, 
  generateTaskUpdateMessage 
} = require('../utils/messageTemplates');

// Fungsi helper untuk mengkonversi dan memvalidasi tanggal
const convertToDateTime = (dateString, timeString) => {
  try {
    // Buat objek Date dari string tanggal
    const date = new Date(dateString);
    
    // Validasi format waktu
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
      throw new Error('Invalid time format');
    }
    
    // Set jam dan menit
    const [hours, minutes] = timeString.split(':');
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    
    // Validasi hasil konversi
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    return date;
  } catch (error) {
    throw new Error(`Date conversion failed: ${error.message}`);
  }
};

// Fungsi untuk membuat tugas dan mengirim pesan
const createTask = async (req, res) => {
  try {
    const { name, description, deadlineDate, deadlineTime, users } = req.body;

    // Konversi dan validasi tanggal
    const convertedDeadline = convertToDateTime(deadlineDate, deadlineTime);
    
    // Log untuk debugging
    console.log('Original deadline:', { deadlineDate, deadlineTime });
    console.log('Converted deadline:', convertedDeadline);

    const newTask = new Task({ 
      name, 
      description, 
      deadlineDate: convertedDeadline,
      deadlineTime,
      users,
      sent: false // Pastikan status awal adalah false
    });

    await newTask.save();
    console.log('Saved task:', newTask);

    const taskUsers = await User.find({ '_id': { $in: users } });

    // Kirim pesan ke semua pengguna terkait tugas ini
    for (const user of taskUsers) {
      const message = generateTaskCreatedMessage(user, {
        ...newTask.toObject(),
        deadlineDate: convertedDeadline // Gunakan tanggal yang sudah dikonversi
      });
      
      try {
        await client.sendMessage(`${user.phoneNumber}@c.us`, message);
        console.log(`Task creation message sent to ${user.phoneNumber}`);
      } catch (err) {
        console.error(`Failed to send task creation message to ${user.phoneNumber}:`, err);
      }
    }

    // Populate users sebelum mengirim response
    const populatedTask = await Task.findById(newTask._id).populate('users');
    res.status(201).send(populatedTask);

  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).send({ 
      error: 'Failed to create task', 
      details: err.message 
    });
  }
};

// Fungsi untuk mengupdate tugas dan mengirim pesan
const updateTask = async (req, res) => {
  try {
    const { name, description, deadlineDate, deadlineTime, users } = req.body;

    // Konversi dan validasi tanggal
    const convertedDeadline = convertToDateTime(deadlineDate, deadlineTime);

    // Reset status sent jika deadline berubah
    const currentTask = await Task.findById(req.params.id);
    const deadlineChanged = 
      currentTask.deadlineDate.getTime() !== convertedDeadline.getTime() ||
      currentTask.deadlineTime !== deadlineTime;

    const updateData = {
      name,
      description,
      deadlineDate: convertedDeadline,
      deadlineTime,
      users,
      // Reset sent status jika deadline berubah
      ...(deadlineChanged && { sent: false })
    };

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('users');

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Kirim pesan ke semua pengguna terkait tugas ini
    for (const user of updatedTask.users) {
      const message = generateTaskUpdateMessage(user, {
        ...updatedTask.toObject(),
        deadlineDate: convertedDeadline
      });
      
      try {
        await client.sendMessage(`${user.phoneNumber}@c.us`, message);
        console.log(`Task update message sent to ${user.phoneNumber}`);
      } catch (err) {
        console.error(`Failed to send task update message to ${user.phoneNumber}:`, err);
      }
    }

    res.status(200).json(updatedTask);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ 
      message: 'Failed to update task',
      details: err.message
    });
  }
};

// Fungsi untuk membaca semua tugas
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('users');
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

// Fungsi untuk membaca tugas berdasarkan ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('users');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch task' });
  }
};

// Fungsi untuk menghapus tugas
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task' });
  }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask };