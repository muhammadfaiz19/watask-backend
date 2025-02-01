const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret"; // Tambahkan default jika env tidak di-set

// User Registration
router.post("/register", async (req, res) => {
  try {
    const { name, phoneNumber, email, username, password, role } = req.body;

    if (!email || !username || !password || !name || !phoneNumber || !role) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    // Cek email dan username
    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Buat user baru - password akan di-hash oleh pre-save hook
    const newUser = new User({
      name,
      phoneNumber,
      email,
      username,
      password: password.trim(), // Tidak perlu hash manual di sini
      role,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ message: "Please provide login and password" });
    }

    console.log('Attempting login with:', {
      providedLogin: login,
      providedPassword: password,
    });

    const lowercaseLogin = login.toLowerCase();
    
    const user = await User.findOne({
      $or: [
        { email: lowercaseLogin },
        { username: lowercaseLogin }
      ],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log('User found:', {
      username: user.username,
      email: user.email,
      storedPassword: user.password
    });

    // Pastikan deklarasi isMatch sebelum penggunaan
    let isMatch;
    try {
      isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match result:', isMatch);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return res.status(500).json({ message: "Error verifying credentials" });
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;

