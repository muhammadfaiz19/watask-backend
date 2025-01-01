const Task = require('../models/Task');
const User = require('../models/User');
const { client } = require('../whatsapp');

// Fungsi untuk mengirim pesan saat tugas dibuat
const sendTaskCreatedMessage = async (user, task) => {
  const { phoneNumber, name } = user; 
  const message = `*Halo, ${name}! Tugas baru telah dibuat!* 🎉\n\n` +  
    `📚 *Tugas Matakuliah:* ${task.name}\n` +
    `📝 *Deskripsi:* ${task.description}\n` +
    `⏰ *Deadline:* ${new Date(task.deadlineDate).toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, Pukul ${task.deadlineTime}\n` +
    `🚀 *Jangan lupa menyelesaikan tugas ini tepat waktu!* 💪`;

  try {
    await client.sendMessage(`${phoneNumber}@c.us`, message);
    console.log(`Message sent to ${phoneNumber} for task: ${task.name}`);
  } catch (err) {
    console.error(`Failed to send message to ${phoneNumber}:`, err);
  }
};

// Fungsi untuk mengirim pengingat
const sendReminderMessages = async (user, task, daysUntilDeadline) => {
  const { phoneNumber, name } = user;  // Mengambil nama pengguna
  let message;

  if (daysUntilDeadline === 3) {
    message = `⚠️ *Halo, ${name}! Tugasmu hampir jatuh tempo, H-3! ⚠️*\n\n` +  // Menyapa nama pengguna
      `📚 *Tugas:* ${task.name}\n` +
      `📝 *Deskripsi:* ${task.description}\n` +
      `⏰ *Deadline:* ${new Date(task.deadlineDate).toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, Pukul ${task.deadlineTime}\n` +
      `🚨 *Prioritas:* Waktunya hampir habis! ⚠️\n\n` +
      `⏳ *Yuk, pastikan tugas ini selesai tepat waktu!* 🌟`;
  } else if (daysUntilDeadline === 1) {
    message = `⏰ *Halo, ${name}! H-1! Tugas tinggal 1 hari lagi! ⏳*\n\n` +  // Menyapa nama pengguna
      `📚 *Tugas:* ${task.name}\n` +
      `📝 *Deskripsi:* ${task.description}\n` +
      `⏰ *Deadline:* ${new Date(task.deadlineDate).toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, Pukul ${task.deadlineTime}\n` +
      `🚨 *Prioritas:* Tinggal 1 hari lagi! ⏰\n\n` +
      `⏳ *Jangan sampai terlewat! Selesaikan tugasmu dengan baik!* 💪`;
  }

  try {
    await client.sendMessage(`${phoneNumber}@c.us`, message);
    console.log(`Reminder sent to ${phoneNumber} for task: ${task.name}`);
  } catch (err) {
    console.error(`Failed to send reminder to ${phoneNumber}:`, err);
  }
};

// Fungsi untuk membuat tugas dan mengirim pesan
const createTask = async (req, res) => {
  try {
    const { name, description, deadlineDate, deadlineTime, users } = req.body;

    const newTask = new Task({ name, description, deadlineDate, deadlineTime, users });
    await newTask.save();

    const taskUsers = await User.find({ '_id': { $in: users } });

    // Kirim pesan ke semua pengguna terkait tugas ini
    for (const user of taskUsers) {
      sendTaskCreatedMessage(user, newTask);
    }

    res.status(201).send(newTask);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).send({ error: 'Failed to create task' });
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

// Fungsi untuk mengupdate tugas
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
