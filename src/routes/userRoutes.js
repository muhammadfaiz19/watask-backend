const express = require('express');
const router = express.Router();
const { createTask, getTasks, getTaskById, updateTask, deleteTask } = require('../controllers/taskController');
// const { protect, isAdmin } = require('../middleware/auth');

// router.post('/tasks', protect, isAdmin, createTask);  
// router.get('/tasks', protect, getTasks);              
// router.get('/tasks/:id', protect, getTaskById);       
// router.put('/tasks/:id', protect, isAdmin, updateTask);  
// router.delete('/tasks/:id', protect, isAdmin, deleteTask);

router.post('/tasks', createTask);  
router.get('/tasks', getTasks);
router.get('/tasks/:id', getTaskById);
router.put('/tasks/:id', updateTask);
router.delete('tasks/:id' , deleteTask);

module.exports = router;
