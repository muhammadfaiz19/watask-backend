const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

const router = express.Router();

// Endpoint login menggunakan email atau username
router.post('/login', async (req, res) => {
  const { email, username, password } = req.body;

  // Cek apakah pengguna ada dengan email atau username
  let user;
  if (username) {
    user = await User.findOne({ username });
  } else if (email) {
    user = await User.findOne({ email });
  }

  if (!user) {
    return res.status(401).json({ message: 'Invalid username/email or password' });
  }

  // Verifikasi password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid username/email or password' });
  }

  // Jika password benar, buat JWT token
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }  // Token berlaku selama 1 jam
  );

  res.json({ token, role: user.role });
});

module.exports = router;
