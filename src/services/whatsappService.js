const cron = require('node-cron');
const Task = require('../models/Task');
const { client } = require('../whatsapp');
const { 
  generateTaskCreatedMessage, 
  generateTaskUpdateMessage, 
  generateReminderMessage 
} = require('../utils/messageTemplates');

cron.schedule("* * * * *", async () => {  // Run every minute
  const now = new Date();
  try {
    const tasks = await Task.find({
      sent: { $ne: true },
      deadlineDate: { $gte: now.toISOString().split('T')[0] }
    }).populate("users");

    for (const task of tasks) {
      const deadline = new Date(task.deadlineDate);
      const [hour, minute] = task.deadlineTime.split(':');
      deadline.setHours(hour, minute, 0);

      const timeUntilDeadline = deadline - now;
      const daysUntilDeadline = Math.floor(timeUntilDeadline / (1000 * 60 * 60 * 24));
      const hoursUntilDeadline = Math.floor(timeUntilDeadline / (1000 * 60 * 60));

      // Separate conditions for H-3 and H-1 reminders
      if ((daysUntilDeadline === 3 && hoursUntilDeadline <= 72) || 
          (daysUntilDeadline === 1 && hoursUntilDeadline <= 24)) {
        for (const user of task.users) {
          try {
            const message = generateReminderMessage(user, task, daysUntilDeadline);
            await client.sendMessage(`${user.phoneNumber}@c.us`, message);
          } catch (err) {
            console.error(`Error sending reminder: ${err.message}`);
          }
        }

        task.sent = true;
        await task.save();
      }
    }
  } catch (err) {
    console.error(`Scheduler error: ${err.message}`);
  }
});

// Fungsi tambahan untuk notifikasi task saat dibuat atau diperbarui
const sendTaskNotification = async (user, task, action) => {
  if (!client || !client.pupPage || !client.pupPage.isConnected()) {
    throw new Error("WhatsApp client is not connected.");
  }

  let message;
  if (action === 'create') {
    message = generateTaskCreatedMessage(user, task);
  } else if (action === 'update') {
    message = generateTaskUpdateMessage(user, task);
  } else {
    throw new Error("Invalid action type. Use 'create' or 'update'.");
  }

  try {
    await client.sendMessage(`${user.phoneNumber}@c.us`, message);
  } catch (err) {
    console.error(`[Notification] Error sending task notification: ${err.message}`);
    throw err;
  }
};

module.exports = { sendTaskNotification };
