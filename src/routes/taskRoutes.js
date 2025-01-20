const express = require('express');
const router = express.Router();
const { createUser, getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
// const { protect, isAdmin } = require('../middleware/auth');

// router.post('/users', protect, isAdmin, createUser);  
// router.get('/users', protect, getUsers);     
// router.get('/users/:id', protect, isAdmin, getUserById); 
// router.put('/users/:id', protect, isAdmin, updateUser); 
// router.delete('/users/:id', protect, isAdmin, deleteUser);

router.post('/users', createUser);  
router.get('/users', getUsers);     
router.get('/users/:id', getUserById); 
router.put('/users/:id', updateUser); 
router.delete('/users/:id', deleteUser);

module.exports = router;
