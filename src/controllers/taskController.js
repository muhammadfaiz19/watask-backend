const Task = require('../models/Task');
const User = require('../models/User');
const { client } = require('../whatsapp');

// Function to send task creation message
const sendTaskCreatedMessage = async (user, task) => {
  const { phoneNumber } = user;
  const message = `🎉 *Tugas baru telah dibuat!* 🎉\n\n` +
    `🔹 **Tugas:** ${task.name}\n` +
    `📝 **Deskripsi:** ${task.description}\n` +
    `⏰ **Tanggal Deadline:** ${new Date(task.deadlineDate).toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, Pukul ${task.deadlineTime}\n` +
    `Jangan lupa untuk menyelesaikan tugas ini tepat waktu!`;

  try {
    await client.sendMessage(`${phoneNumber}@c.us`, message);
    console.log(`Message sent to ${phoneNumber} for task: ${task.name}`);
  } catch (err) {
    console.error(`Failed to send message to ${phoneNumber}:`, err);
  }
};

// Function to send reminders
const sendReminderMessages = async (user, task, daysUntilDeadline) => {
  const { phoneNumber } = user;
  let message;

  if (daysUntilDeadline === 3) {
    message = `🚨 *Urgent:* Tugas ${user.name} hampir jatuh tempo, H-3! ⚠️\n\n` +
      `🔹 **Tugas:** ${task.name}\n` +
      `📝 **Deskripsi:** ${task.description}\n` +
      `⏰ **Tanggal Deadline:** ${new Date(task.deadlineDate).toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, Pukul ${task.deadlineTime}\n` +
      `🚨 **Prioritas:** Waktunya hampir habis! ⚠️\n\n` +
      `Pastikan kamu menyelesaikan tugas ini!`;
  } else if (daysUntilDeadline === 1) {
    message = `🚨 *Urgent!* H-1! Tugas ${user.name} ⏳\n\n` +
      `🔹 **Tugas:** ${task.name}\n` +
      `📝 **Deskripsi:** ${task.description}\n` +
      `⏰ **Tanggal Deadline:** ${new Date(task.deadlineDate).toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, Pukul ${task.deadlineTime}\n` +
      `🚨 **Prioritas:** Tinggal 1 hari lagi! ⏰\n\n` +
      `Jangan lupa, selesaikan tugas ini tepat waktu!`;
  }

  try {
    await client.sendMessage(`${phoneNumber}@c.us`, message);
    console.log(`Reminder sent to ${phoneNumber} for task: ${task.name}`);
  } catch (err) {
    console.error(`Failed to send reminder to ${phoneNumber}:`, err);
  }
};

// Create task and send notifications
const createTask = async (req, res) => {
  try {
    const { name, description, deadlineDate, deadlineTime, users } = req.body;

    const newTask = new Task({ name, description, deadlineDate, deadlineTime, users });
    await newTask.save();

    const taskUsers = await User.find({ '_id': { $in: users } });

    taskUsers.forEach((user) => {
      sendTaskCreatedMessage(user, newTask);
    });

    res.status(201).send(newTask);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).send({ error: 'Failed to create task' });
  }
};

// Membaca semua task
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('users');
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

// Membaca task berdasarkan ID
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

// Mengupdate task
const updateTask = async (req, res) => {
  try {
    const { name, description, deadlineDate, deadlineTime, users } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { name, description, deadlineDate, deadlineTime, users },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task' });
  }
};

// Menghapus task
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
