// src/controllers/userController.js
const User = require('../models/User');

const createUser = async (req, res) => {
  try {
    const { name, phoneNumber, email } = req.body;
    const newUser = new User({ name, phoneNumber, email });
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
    const { name, phoneNumber, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phoneNumber, email },
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
