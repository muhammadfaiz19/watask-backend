const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  deadlineDate: { type: Date, required: true }, 
  deadlineTime: { type: String, required: true }, 
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sent: { type: Boolean, default: false },
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
