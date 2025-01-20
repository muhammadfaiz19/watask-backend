const User = require('../models/User');

// Membuat user
const createUser = async (req, res) => {
  try {
    const { name, phoneNumber, email, username, password, role } = req.body;

    // Validasi untuk memastikan email dan username unik
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email atau username sudah terdaftar' });
    }

    const newUser = new User({ name, phoneNumber, email, username, password, role });
    await newUser.save();
    res.status(201).json({
      message: 'User created successfully',
      user: newUser
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create user' });
  }
};

// Membaca semua user
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Membaca user berdasarkan ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

// Mengupdate user
const updateUser = async (req, res) => {
  try {
    const { name, phoneNumber, email, username, role } = req.body;

    // Pastikan email dan username tetap unik
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser && existingUser._id.toString() !== req.params.id) {
      return res.status(400).json({ message: 'Email atau username sudah terdaftar' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phoneNumber, email, username, role },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user' });
  }
};

// Menghapus user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

module.exports = { createUser, getUsers, getUserById, updateUser, deleteUser };
