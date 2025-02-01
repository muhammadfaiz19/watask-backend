const express = require('express');
const router = express.Router();
const { createUser, getUsers, getUserById, updateUser, deleteUser, updateProfile, updatePassword } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// Routes that require user authentication
router.get('/users/:id', authenticate, getUserById);
router.put('/users/profile', authenticate, updateProfile);
router.get('/users/profile', authenticate, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});
router.put('/users/password', authenticate, updatePassword); 

// Other routes that do not need authentication
router.post('/users', createUser);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
