const bcrypt = require('bcryptjs');
const User = require('../models/User');


const createUser = async (req, res) => {
  try {
    const { name, phoneNumber, email, username, password, role } = req.body;

    console.log("Received data:", req.body);

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
    console.error('Error during user creation:', err);
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
  // req.user.id will be set by the authenticate middleware
  const userId = req.user.id;
  try {
    const user = await User.findById(userId); 
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

const updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber, email, username } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser && existingUser._id.toString() !== req.user.id) {
      return res.status(400).json({ message: 'Email or username already exists' });
    }

    const user = await User.findByIdAndUpdate(req.user.id, { name, phoneNumber, email, username }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
};


const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Debugging: Log the current password and hashed user password
    console.log('Current password:', currentPassword);
    console.log('User password (hashed):', user.password);

    // Compare current password with stored password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    // Debugging: Log the result of the comparison
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Save user
    console.log("Saving user with new password...");
    await user.save();
    console.log("User saved successfully!");

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error while updating password:', err); 
    res.status(500).json({ message: 'Failed to update password' });
  }
};



module.exports = { createUser, getUsers, getUserById, updateUser, deleteUser, updateProfile, updatePassword };
