// src/routes/taskRoutes.js
const express = require("express");
const router = express.Router();
const { createTask, getTasks, getTaskById, updateTask, deleteTask } = require("../controllers/taskController");

router.post("/tasks", createTask);
router.get("/tasks", getTasks);
router.get("/tasks/:id", getTaskById);
router.put("/tasks/:id", updateTask);
router.delete("/tasks/:id", deleteTask);

module.exports = router;
